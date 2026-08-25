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
import { defaultLandingSections, mergeLandingSections, type LandingHeroSlide, type LandingSectionContent, type LandingSectionItem } from "@/lib/landingContent";

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

          {activeSection.key === "hero" && (
            <div className="mt-6 border-t border-surface-border pt-4">
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Hero Slides</h3>
                <p className="mt-1 text-[11px] text-text-muted">Each slide controls its own image, message, accessibility text, and buttons.</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setSection(activeSection.key, (section) => ({
                    ...section,
                    slides: [
                      ...(section.slides ?? []),
                      {
                        title: "New Hero Slide",
                        description: "Add slide description.",
                        image: section.slides?.[0]?.image || "/hero-images/dignity-in-every-final-journey-bg.png",
                        alt: "Hero slide image",
                        buttonLabel: "Learn More",
                        buttonHref: "/",
                        variant: "default",
                      },
                    ],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add Slide
              </Button>
              <div className="space-y-3">
                {(activeSection.slides ?? []).map((slide: LandingHeroSlide, slideIndex: number) => (
                  <div key={`hero-slide-${slideIndex}`} className="rounded-lg border border-surface-border bg-surface-sunken/40 p-3">
                    <p className="mb-3 text-xs font-semibold text-text-primary">Slide {slideIndex + 1}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <TextField label="Slide Title" value={slide.title} multiline onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, title: value })) }))} />
                      </div>
                      <div className="sm:col-span-2">
                        <TextField label="Slide Description" value={slide.description} multiline onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, description: value })) }))} />
                      </div>
                      <TextField label="Image Alt Text" value={slide.alt} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, alt: value })) }))} />
                      <label className="space-y-1.5 text-xs font-medium text-text-secondary">
                        Layout Variant
                        <select value={slide.variant ?? "default"} onChange={(event) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, variant: event.target.value as LandingHeroSlide["variant"] })) }))} className="h-10 w-full rounded-lg border border-surface-border bg-surface-card px-3 text-sm text-text-primary outline-none focus:border-accent">
                          <option value="default">Default</option>
                          <option value="family-support">Family Support</option>
                          <option value="journey-prayer">Journey Prayer</option>
                          <option value="volunteer-impact">Volunteer Impact</option>
                        </select>
                      </label>
                      <ImageField label="Slide Image" value={slide.image} uploading={uploadingKey === `hero:slide:${slideIndex}`} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, image: value })) }))} onUpload={(file) => uploadImage(`hero:slide:${slideIndex}`, file, (url) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, image: url })) })))} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextField label="Primary Button Text" value={slide.buttonLabel} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, buttonLabel: value })) }))} />
                        <TextField label="Primary Button Link" value={slide.buttonHref} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, buttonHref: value })) }))} />
                        <TextField label="Secondary Button Text" value={slide.secondaryButtonLabel} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, secondaryButtonLabel: value })) }))} />
                        <TextField label="Secondary Button Link" value={slide.secondaryButtonHref} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, secondaryButtonHref: value })) }))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection.key === "footer" && (
            <div className="mt-6 border-t border-surface-border pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Footer Logos</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <ImageField label="Moksha Sewa Logo" value={activeSection.logoImage} uploading={uploadingKey === "footer:logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, logoImage: value }))} onUpload={(file) => uploadImage("footer:logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, logoImage: url })))} />
                <ImageField label="Namo Gange Trust Logo" value={activeSection.partnerLogoImage} uploading={uploadingKey === "footer:partner-logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: value }))} onUpload={(file) => uploadImage("footer:partner-logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: url })))} />
              </div>
            </div>
          )}

          {activeSection.key === "trust-transparency" && (
            <div className="mt-6 border-t border-surface-border pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Trust &amp; Transparency Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2"><TextField label="Mission Quote" value={activeSection.quote} multiline onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, quote: value }))} /></div>
                <div className="sm:col-span-2"><TextField label="Legal Notice" value={activeSection.legalNotice} multiline onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, legalNotice: value }))} /></div>
                <TextField label="Lower Section Title" value={activeSection.lowerTitle} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, lowerTitle: value }))} />
                <TextField label="Bottom Statement" value={activeSection.bottomStatement} multiline onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, bottomStatement: value }))} />
                <div className="sm:col-span-2"><TextField label="Lower Section Description" value={activeSection.lowerDescription} multiline onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, lowerDescription: value }))} /></div>
                <ImageField label="Moksha Sewa Logo" value={activeSection.logoImage} uploading={uploadingKey === "trust:logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, logoImage: value }))} onUpload={(file) => uploadImage("trust:logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, logoImage: url })))} />
                <ImageField label="Namo Gange Logo" value={activeSection.partnerLogoImage} uploading={uploadingKey === "trust:partner-logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: value }))} onUpload={(file) => uploadImage("trust:partner-logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: url })))} />
                <ImageField label="Namo Gange Trust Logo" value={activeSection.secondaryLogoImage} uploading={uploadingKey === "trust:secondary-logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryLogoImage: value }))} onUpload={(file) => uploadImage("trust:secondary-logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, secondaryLogoImage: url })))} />
                <ImageField label="Sacred River Ghat Image" value={activeSection.secondaryImage} uploading={uploadingKey === "trust:secondary-image"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryImage: value }))} onUpload={(file) => uploadImage("trust:secondary-image", file, (url) => setSection(activeSection.key, (section) => ({ ...section, secondaryImage: url })))} />
              </div>
            </div>
          )}

          {activeSection.key === "final-act" && (
            <div className="mt-6 border-t border-surface-border pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Section Logos</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <ImageField label="Moksha Sewa Logo" value={activeSection.logoImage} uploading={uploadingKey === "final-act:logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, logoImage: value }))} onUpload={(file) => uploadImage("final-act:logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, logoImage: url })))} />
                <ImageField label="Namo Gange Logo" value={activeSection.partnerLogoImage} uploading={uploadingKey === "final-act:partner-logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: value }))} onUpload={(file) => uploadImage("final-act:partner-logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: url })))} />
              </div>
            </div>
          )}

          {(activeSection.key === "family-need" || activeSection.key === "compassion") && (
            <div className="mt-6 border-t border-surface-border pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Additional Visible Content</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeSection.key === "family-need" && <>
                  <TextField label="Support Message" value={activeSection.supportTitle} multiline onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, supportTitle: value }))} />
                  <TextField label="Support Submessage" value={activeSection.supportDescription} multiline onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, supportDescription: value }))} />
                  <TextField label="Region Intro" value={activeSection.regionDescription} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, regionDescription: value }))} />
                  <TextField label="Region Name" value={activeSection.regionTitle} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, regionTitle: value }))} />
                </>}
                {activeSection.key === "compassion" && <>
                  <TextField label="Phone CTA Label" value={activeSection.phoneLabel} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, phoneLabel: value }))} />
                  <TextField label="Phone Number" value={activeSection.phoneNumber} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, phoneNumber: value }))} />
                  <TextField label="Trust Card Title" value={activeSection.secondaryTitle} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryTitle: value }))} />
                  <TextField label="Trust Card Description" value={activeSection.secondaryDescription} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryDescription: value }))} />
                </>}
              </div>
            </div>
          )}

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
