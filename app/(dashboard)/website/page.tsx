"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { settingsApi } from "@/lib/settingsApi";
import { uploadApi } from "@/lib/uploadApi";
import { ApiRequestError } from "@/lib/api";
import { Settings } from "@/lib/types";
import { defaultLandingSections, mergeLandingSections, type LandingSectionContent, type LandingSectionItem } from "@/lib/landingContent";

const FOLDER = "moksha-sewa/website";

function updateAt<T>(items: T[], index: number, updater: (item: T) => T): T[] {
  return items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  if (multiline) {
    return <Textarea label={label} value={value ?? ""} rows={3} onChange={(event) => onChange(event.target.value)} />;
  }
  return <Input label={label} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />;
}

function ImageField({
  label,
  value,
  uploading,
  onChange,
  onUpload,
}: {
  label: string;
  value?: string;
  uploading?: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  };

  return (
    <div className="space-y-2">
      <Input label={label} value={value ?? ""} onChange={(event) => onChange(event.target.value)} hint="Paste existing public path or upload a new image." />
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-2.5 text-xs font-medium text-text-primary hover:bg-surface-sunken">
          <ImagePlus className="h-3.5 w-3.5" />
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-10 w-16 rounded border border-surface-border object-cover" />
        )}
      </div>
    </div>
  );
}

export default function WebsitePage() {
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sections, setSections] = useState<LandingSectionContent[]>(defaultLandingSections);
  const [activeKey, setActiveKey] = useState(searchParams.get("section") ?? defaultLandingSections[0]?.key ?? "hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const sectionParam = searchParams.get("section");
    if (sectionParam) {
      setActiveKey(sectionParam);
    }
  }, [searchParams]);

  useEffect(() => {
    settingsApi
      .get()
      .then((data) => {
        setSettings(data);
        setSections(mergeLandingSections(data.landingPage?.sections));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeSection = useMemo(
    () => sections.find((section) => section.key === activeKey) ?? sections[0],
    [activeKey, sections]
  );

  const setSection = (key: string, updater: (section: LandingSectionContent) => LandingSectionContent) => {
    setSections((current) => current.map((section) => (section.key === key ? updater(section) : section)));
  };

  const uploadImage = async (target: string, file: File, onDone: (url: string) => void) => {
    setUploadingKey(target);
    setMessage(null);
    try {
      const result = await uploadApi.file(file, FOLDER);
      onDone(result.url);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not upload image." });
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await settingsApi.update({ ...settings, landingPage: { sections } });
      setSettings(updated);
      setSections(mergeLandingSections(updated.landingPage?.sections));
      setMessage({ type: "success", text: "Website content saved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not save website content." });
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setSections(defaultLandingSections);
    setActiveKey(defaultLandingSections[0]?.key ?? "hero");
  };

  const restoreAndSaveDefaults = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await settingsApi.update({ ...settings, landingPage: { sections: defaultLandingSections } });
      setSettings(updated);
      setSections(mergeLandingSections(updated.landingPage?.sections));
      setActiveKey(defaultLandingSections[0]?.key ?? "hero");
      setMessage({ type: "success", text: "Original website content restored and saved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not restore website content." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !activeSection) {
    return <div className="flex min-h-[40vh] items-center justify-center text-text-muted">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Website</h1>
            <p className="text-xs text-text-muted">Landing page section content and images. Layout stays unchanged on the website.</p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="landing-section-select" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Landing Page
            </label>
            <select
              id="landing-section-select"
              value={activeKey}
              onChange={(event) => setActiveKey(event.target.value)}
              className="rounded-lg border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs font-medium text-text-primary outline-none ring-0 transition focus:border-accent"
            >
              {sections.map((section) => (
                <option key={section.key} value={section.key}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={resetDefaults}>Reset Defaults</Button>
          <Button type="button" variant="secondary" onClick={restoreAndSaveDefaults} loading={saving}>Restore Original</Button>
          <Button type="button" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            Save Website
          </Button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg border p-3 text-xs font-medium ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-surface-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">{activeSection.name}</h2>
              <p className="text-[11px] text-text-muted">Section key: {activeSection.key}</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
              <input
                type="checkbox"
                checked={activeSection.enabled !== false}
                onChange={(event) => setSection(activeSection.key, (section) => ({ ...section, enabled: event.target.checked }))}
              />
              Visible
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Admin Section Name" value={activeSection.name} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, name: value }))} />
            <TextField label="Eyebrow / Small Heading" value={activeSection.eyebrow} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, eyebrow: value }))} />
            <div className="sm:col-span-2">
              <TextField label="Main Title" value={activeSection.title} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, title: value }))} multiline />
            </div>
            <div className="sm:col-span-2">
              <TextField label="Subtitle" value={activeSection.subtitle} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, subtitle: value }))} multiline />
            </div>
            <div className="sm:col-span-2">
              <TextField label="Description" value={activeSection.description} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, description: value }))} multiline />
            </div>
            <ImageField
              label="Section Image"
              value={activeSection.image}
              uploading={uploadingKey === `${activeSection.key}:section`}
              onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, image: value }))}
              onUpload={(file) => uploadImage(`${activeSection.key}:section`, file, (url) => setSection(activeSection.key, (section) => ({ ...section, image: url })))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Primary Button Text" value={activeSection.buttonLabel} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, buttonLabel: value }))} />
              <TextField label="Primary Button Link" value={activeSection.buttonHref} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, buttonHref: value }))} />
              <TextField label="Secondary Button Text" value={activeSection.secondaryButtonLabel} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryButtonLabel: value }))} />
              <TextField label="Secondary Button Link" value={activeSection.secondaryButtonHref} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryButtonHref: value }))} />
            </div>
          </div>

          <div className="mt-6 border-t border-surface-border pt-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Cards / FAQs / Stats</h3>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setSection(activeSection.key, (section) => ({
                    ...section,
                    items: [...(section.items ?? []), { title: "New Item", description: "" }],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {(activeSection.items ?? []).map((item: LandingSectionItem, itemIndex: number) => (
                <div key={`${activeSection.key}-${itemIndex}`} className="rounded-lg border border-surface-border bg-surface-sunken/40 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-text-primary">Item {itemIndex + 1}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setSection(activeSection.key, (section) => ({
                          ...section,
                          items: (section.items ?? []).filter((_, index) => index !== itemIndex),
                        }))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Title / Question"
                      value={item.title}
                      onChange={(value) =>
                        setSection(activeSection.key, (section) => ({
                          ...section,
                          items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, title: value })),
                        }))
                      }
                    />
                    <TextField
                      label="Label"
                      value={item.label}
                      onChange={(value) =>
                        setSection(activeSection.key, (section) => ({
                          ...section,
                          items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, label: value })),
                        }))
                      }
                    />
                    <TextField
                      label="Value"
                      value={item.value}
                      onChange={(value) =>
                        setSection(activeSection.key, (section) => ({
                          ...section,
                          items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, value })),
                        }))
                      }
                    />
                    <TextField
                      label="Link"
                      value={item.href}
                      onChange={(value) =>
                        setSection(activeSection.key, (section) => ({
                          ...section,
                          items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, href: value })),
                        }))
                      }
                    />
                    <div className="sm:col-span-2">
                      <TextField
                        label="Description / Answer"
                        value={item.description}
                        multiline
                        onChange={(value) =>
                          setSection(activeSection.key, (section) => ({
                            ...section,
                            items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, description: value })),
                          }))
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <ImageField
                        label="Item Image"
                        value={item.image}
                        uploading={uploadingKey === `${activeSection.key}:item:${itemIndex}`}
                        onChange={(value) =>
                          setSection(activeSection.key, (section) => ({
                            ...section,
                            items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, image: value })),
                          }))
                        }
                        onUpload={(file) =>
                          uploadImage(`${activeSection.key}:item:${itemIndex}`, file, (url) =>
                            setSection(activeSection.key, (section) => ({
                              ...section,
                              items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, image: url })),
                            }))
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
