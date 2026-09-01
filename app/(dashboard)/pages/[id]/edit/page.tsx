"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  ImageIcon,
  Info,
  Link2,
  Plus,
  Save,
  Settings,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { cmsPages } from "@/lib/cmsPages";

type CmsEditFormState = {
  pageTitle: string;
  slug: string;
  template: string;
  parent: string;
  metaTitle: string;
  content: string;
  status: "Draft" | "Published";
  author: string;
  showInNavigation: boolean;
  menuOrder: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  robotsMeta: string;
  noIndex: boolean;
  noFollow: boolean;
  xmlSitemap: boolean;
  breadcrumb: boolean;
  passwordProtect: boolean;
};

const seed: CmsEditFormState = {
  pageTitle: "",
  slug: "",
  template: "",
  parent: "— No Parent (Top Level) —",
  metaTitle: "",
  content: "",
  status: "Draft",
  author: "Admin User",
  showInNavigation: true,
  menuOrder: "0",
  seoTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  robotsMeta: "Index, Follow",
  noIndex: false,
  noFollow: false,
  xmlSitemap: true,
  breadcrumb: true,
  passwordProtect: false,
};

export default function CmsEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pageId = Number(params.id);
  const page = cmsPages.find((item) => item.id === pageId) ?? cmsPages[0];

  const initialForm = useMemo<CmsEditFormState>(
    () => ({
      ...seed,
      pageTitle: page.title,
      slug: page.slug,
      status: page.status,
      author: page.author,
      metaTitle: `${page.title} | Moksha Sewa`,
      metaDescription: `Learn more about ${page.title.toLowerCase()} at Moksha Sewa.`,
      focusKeyword: page.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim(),
      canonicalUrl: `https://mokshasewa.org${page.slug === "/" ? "/" : page.slug}`,
    }),
    [page],
  );

  const [form, setForm] = useState(initialForm);

  const updateField = <K extends keyof CmsEditFormState>(key: K, value: CmsEditFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-full bg-[#fffefb] p-6 text-[#182238]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/pages/${page.id}`)}
              className="inline-flex items-center gap-2 rounded-[6px] border border-[#dedfdb] bg-white px-3 py-2 text-[11px] font-semibold text-[#415067]"
            >
              <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={1.7} />
              Back to page
            </button>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a8392]">
                CMS editor
              </p>
              <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[#1d2a3d]">
                Edit: {page.title}
              </h1>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[6px] bg-[linear-gradient(135deg,#bc861b,#d99b18)] px-4 py-2 text-[11px] font-semibold text-white"
          >
            <Save className="h-[13px] w-[13px]" strokeWidth={1.7} />
            Save changes
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <section className="rounded-[10px] border border-[#e7e7e3] bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-[28px] w-[28px] place-items-center rounded-[6px] bg-[#edf6eb] text-[#26764b]">
                    <FileText className="h-[14px] w-[14px]" strokeWidth={1.7} />
                  </div>
                  <h2 className="text-[15px] font-bold text-[#2f4231]">Content</h2>
                </div>
                <span className="rounded-[5px] bg-[#f3f5f1] px-[8px] py-[4px] text-[9px] font-semibold text-[#586374]">
                  {form.status}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Page title</label>
                  <input
                    value={form.pageTitle}
                    onChange={(event) => updateField("pageTitle", event.target.value)}
                    className="h-[36px] w-full rounded-[6px] border border-[#dedfdb] bg-white px-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>

                <div>
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(event) => updateField("slug", event.target.value)}
                    className="h-[36px] w-full rounded-[6px] border border-[#dedfdb] bg-white px-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>

                <div>
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Template</label>
                  <div className="relative">
                    <select
                      value={form.template}
                      onChange={(event) => updateField("template", event.target.value)}
                      className="h-[36px] w-full appearance-none rounded-[6px] border border-[#dedfdb] bg-white pl-[10px] pr-[28px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                    >
                      <option value="">Choose a template</option>
                      <option value="home">Home</option>
                      <option value="standard">Standard</option>
                      <option value="services">Services</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#727b88]" />
                  </div>
                </div>

                <div>
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Parent</label>
                  <input
                    value={form.parent}
                    onChange={(event) => updateField("parent", event.target.value)}
                    className="h-[36px] w-full rounded-[6px] border border-[#dedfdb] bg-white px-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>

                <div>
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Author</label>
                  <input
                    value={form.author}
                    onChange={(event) => updateField("author", event.target.value)}
                    className="h-[36px] w-full rounded-[6px] border border-[#dedfdb] bg-white px-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>

                <div>
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Status</label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(event) => updateField("status", event.target.value as "Draft" | "Published")}
                      className="h-[36px] w-full appearance-none rounded-[6px] border border-[#dedfdb] bg-white pl-[10px] pr-[28px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#727b88]" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(event) => updateField("content", event.target.value)}
                    rows={8}
                    className="w-full rounded-[6px] border border-[#dedfdb] bg-white p-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[10px] border border-[#e7e7e3] bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid h-[28px] w-[28px] place-items-center rounded-[6px] bg-[#eef3ff] text-[#3b6cc9]">
                  <Sparkles className="h-[14px] w-[14px]" strokeWidth={1.7} />
                </div>
                <h2 className="text-[15px] font-bold text-[#2f4231]">SEO & metadata</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">SEO title</label>
                  <input
                    value={form.seoTitle || form.metaTitle}
                    onChange={(event) => updateField("seoTitle", event.target.value)}
                    className="h-[36px] w-full rounded-[6px] border border-[#dedfdb] bg-white px-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Meta description</label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(event) => updateField("metaDescription", event.target.value)}
                    rows={4}
                    className="w-full rounded-[6px] border border-[#dedfdb] bg-white p-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>

                <div>
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Focus keyword</label>
                  <input
                    value={form.focusKeyword}
                    onChange={(event) => updateField("focusKeyword", event.target.value)}
                    className="h-[36px] w-full rounded-[6px] border border-[#dedfdb] bg-white px-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>

                <div>
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">Canonical URL</label>
                  <input
                    value={form.canonicalUrl}
                    onChange={(event) => updateField("canonicalUrl", event.target.value)}
                    className="h-[36px] w-full rounded-[6px] border border-[#dedfdb] bg-white px-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[10px] border border-[#e7e7e3] bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid h-[28px] w-[28px] place-items-center rounded-[6px] bg-[#fbeed7] text-[#a66e0d]">
                  <Settings className="h-[14px] w-[14px]" strokeWidth={1.7} />
                </div>
                <h2 className="text-[15px] font-bold text-[#2f4231]">Settings</h2>
              </div>

              <div className="space-y-3 text-[10.5px] text-[#475367]">
                <label className="flex items-center justify-between gap-3">
                  <span>Show in navigation</span>
                  <input
                    type="checkbox"
                    checked={form.showInNavigation}
                    onChange={(event) => updateField("showInNavigation", event.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between gap-3">
                  <span>XML sitemap</span>
                  <input
                    type="checkbox"
                    checked={form.xmlSitemap}
                    onChange={(event) => updateField("xmlSitemap", event.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between gap-3">
                  <span>Breadcrumb</span>
                  <input
                    type="checkbox"
                    checked={form.breadcrumb}
                    onChange={(event) => updateField("breadcrumb", event.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between gap-3">
                  <span>Password protected</span>
                  <input
                    type="checkbox"
                    checked={form.passwordProtect}
                    onChange={(event) => updateField("passwordProtect", event.target.checked)}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[10px] border border-[#e7e7e3] bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid h-[28px] w-[28px] place-items-center rounded-[6px] bg-[#edf6eb] text-[#26764b]">
                  <ImageIcon className="h-[14px] w-[14px]" strokeWidth={1.7} />
                </div>
                <h2 className="text-[15px] font-bold text-[#2f4231]">Media</h2>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-dashed border-[#cdd4d0] bg-[#fafcf9] px-3 py-3 text-[10px] font-semibold text-[#4d5a6f]"
              >
                <UploadCloud className="h-[13px] w-[13px]" strokeWidth={1.7} />
                Upload hero image
              </button>
            </section>

            <section className="rounded-[10px] border border-[#e7e7e3] bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid h-[28px] w-[28px] place-items-center rounded-[6px] bg-[#f4f0ff] text-[#7a57d7]">
                  <Link2 className="h-[14px] w-[14px]" strokeWidth={1.7} />
                </div>
                <h2 className="text-[15px] font-bold text-[#2f4231]">Links</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-[4px] block text-[10.5px] font-semibold text-[#465168]">URL</label>
                  <input
                    value={form.canonicalUrl}
                    onChange={(event) => updateField("canonicalUrl", event.target.value)}
                    className="h-[36px] w-full rounded-[6px] border border-[#dedfdb] bg-white px-[10px] text-[11px] text-[#3b475c] outline-none focus:border-[#91a98f]"
                  />
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-[6px] border border-[#e3e4e0] bg-white px-3 py-2 text-[10px] font-semibold text-[#415067]"
                >
                  <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
                  Add internal link
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
