"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  AlignLeft,
  ArrowLeft,
  Bold,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  FormInput,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  MoreHorizontal,
  MoreVertical,
  Quote,
  Save,
  Sparkles,
  Strikethrough,
  Table2,
  Trash2,
  Underline,
  UserRound,
  Video,
} from "lucide-react";

import {
  cmsPages,
  cmsPagesFromSettings,
  PUBLIC_SITE_URL,
} from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";

/* =========================================================
   FEATURED IMAGE
========================================================= */

const FEATURED_IMAGE =
  "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";

/* =========================================================
   TYPES
========================================================= */

type Status =
  | "Draft"
  | "Published";

type Visibility =
  | "Public"
  | "Private";

type FormState = {
  pageTitle: string;
  slug: string;
  template: string;
  parent: string;
  metaTitle: string;
  metaDescription: string;
  contentTitle: string;
  contentDescription: string;
  status: Status;
  visibility: Visibility;
  author: string;
  showInNavigation: boolean;
  menuOrder: string;
};

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="
        mb-[5px]
        block
        text-[11px]
        font-semibold
        leading-[14px]
        text-[#4b5568]
      "
    >
      {children}

      {required && (
        <span className="ml-[3px] text-red-500">
          *
        </span>
      )}
    </label>
  );
}

/* =========================================================
   TEXT INPUT
========================================================= */

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      className="
        h-[35px]
        w-full
        rounded-[5px]
        border
        border-[#dedfdb]
        bg-white
        px-[10px]
        text-[11px]
        font-medium
        text-[#414b5e]
        outline-none
        placeholder:text-[10.5px]
        placeholder:text-[#9aa0aa]
        focus:border-[#8fa98e]
      "
    />
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="
          h-[35px]
          w-full
          cursor-pointer
          appearance-none
          rounded-[5px]
          border
          border-[#dedfdb]
          bg-white
          pl-[10px]
          pr-[28px]
          text-[11px]
          font-medium
          text-[#414b5e]
          outline-none
          focus:border-[#8fa98e]
        "
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ),
        )}
      </select>

      <ChevronDown
        className="
          pointer-events-none
          absolute
          right-[9px]
          top-1/2
          h-[11px]
          w-[11px]
          -translate-y-1/2
          text-[#697386]
        "
      />
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  return (
    <div className="flex items-center gap-[8px]">
      <div
        className="
          grid
          h-[24px]
          w-[24px]
          shrink-0
          place-items-center
          rounded-[5px]
          bg-[#ecf5eb]
          text-[#2f7950]
        "
      >
        <FileText
          className="h-[13px] w-[13px]"
          strokeWidth={1.8}
        />
      </div>

      <h2
        className="
          text-[13px]
          font-bold
          text-[#285f40]
        "
      >
        {number}. {title}
      </h2>
    </div>
  );
}

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

function ToolbarButton({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        grid
        h-[30px]
        min-w-[30px]
        place-items-center
        rounded-[4px]
        px-[5px]
        transition

        ${active
          ? "bg-[#edf5ec] text-[#166b40]"
          : "text-[#435065] hover:bg-[#f5f6f3]"
        }
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (
    value: boolean,
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`
        relative
        h-[20px]
        w-[38px]
        shrink-0
        rounded-full
        transition

        ${checked
          ? "bg-[#087540]"
          : "bg-[#cdd3cf]"
        }
      `}
    >
      <span
        className={`
          absolute
          top-[3px]
          h-[14px]
          w-[14px]
          rounded-full
          bg-white
          shadow-sm
          transition-all

          ${checked
            ? "left-[21px]"
            : "left-[3px]"
          }
        `}
      />
    </button>
  );
}

/* =========================================================
   SEO CIRCLE
========================================================= */

function SeoScoreCircle() {
  return (
    <div
      className="
        relative
        h-[108px]
        w-[108px]
        shrink-0
      "
    >
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r="49"
          fill="none"
          stroke="#edf0eb"
          strokeWidth="9"
        />

        <circle
          cx="60"
          cy="60"
          r="49"
          fill="none"
          stroke="#08703d"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="307.87"
          strokeDashoffset="24.63"
        />
      </svg>

      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <div className="flex items-end">
          <span
            className="
              text-[29px]
              font-bold
              tracking-[-0.04em]
              text-[#17304a]
            "
          >
            92
          </span>

          <span
            className="
              mb-[5px]
              text-[8px]
              font-semibold
              text-[#697386]
            "
          >
            /100
          </span>
        </div>

        <span
          className="
            mt-[-2px]
            text-[8.5px]
            font-semibold
            text-[#147042]
          "
        >
          Excellent
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   SEO ROW
========================================================= */

function SeoRow({
  label,
}: {
  label: string;
}) {
  return (
    <div
      className="
        flex
        h-[21px]
        items-center
        justify-between
        gap-3
      "
    >
      <div
        className="
          flex
          min-w-0
          items-center
          gap-[7px]
        "
      >
        <span
          className="
            grid
            h-[13px]
            w-[13px]
            shrink-0
            place-items-center
            rounded-[3px]
            bg-[#147242]
            text-white
          "
        >
          <Check
            className="h-[8px] w-[8px]"
            strokeWidth={2.5}
          />
        </span>

        <span
          className="
            truncate
            text-[10px]
            font-medium
            text-[#435066]
          "
        >
          {label}
        </span>
      </div>

      <span
        className="
          text-[9.5px]
          font-semibold
          text-[#28854e]
        "
      >
        Good
      </span>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CmsEditPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const pageId =
    Number(params.id);

  const [pages, setPages] = useState(cmsPages);
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);

  const page =
    pages.find(
      (item) =>
        item.id === pageId,
    ) ?? pages[0] ?? cmsPages[0];

  useEffect(() => {
    settingsApi.get().then((value) => {
      const raw = value as unknown as Record<string, any>;
      setSettings(raw);
      setPages(cmsPagesFromSettings(raw));
    }).catch(() => undefined);
  }, []);

  const pageConfig = page.configKey && settings ? settings[page.configKey] : undefined;
  const firstContentSection = pageConfig?.sections?.find((section: any) => section.enabled !== false) ?? pageConfig?.sections?.[0];

  const initialForm =
    useMemo<FormState>(
      () => ({
        pageTitle:
          page.title,

        slug:
          page.slug === "/"
            ? ""
            : page.slug.replace(
              /^\//,
              "",
            ),

        template:
          page.type === "home"
            ? "Homepage"
            : "Standard Page",

        parent:
          page.type === "home"
            ? "— No Parent (Top Level) —"
            : "Home",

        metaTitle:
          page.type === "home"
            ? "Moksha Sewa – Dignity in Every Final Journey"
            : `${page.title} – Moksha Sewa`,

        metaDescription: page.seo?.metaDescription ?? "",
        contentTitle: firstContentSection?.title ?? "",
        contentDescription: firstContentSection?.description ?? "",

        status:
          page.status,

        visibility:
          "Public",

        author:
          page.author,

        showInNavigation:
          true,

        menuOrder:
          page.type === "home"
            ? "1"
            : "4",
      }),
      [page, firstContentSection],
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      initialForm,
    );

  useEffect(() => {
    if (!settings) return;
    setForm({
      ...initialForm,
      metaTitle: page.seo?.metaTitle ?? "",
      metaDescription: page.seo?.metaDescription ?? "",
      contentTitle: firstContentSection?.title ?? "",
      contentDescription: firstContentSection?.description ?? "",
    });
  }, [settings, initialForm]);

  const [
    activeFormats,
    setActiveFormats,
  ] =
    useState<string[]>([]);

  const updateField = <
    K extends keyof FormState,
  >(
    key: K,
    value: FormState[K],
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [key]: value,
      }),
    );
  };

  const toggleFormat = (
    format: string,
  ) => {
    setActiveFormats(
      (previous) =>
        previous.includes(
          format,
        )
          ? previous.filter(
            (item) =>
              item !== format,
          )
          : [
            ...previous,
            format,
          ],
    );
  };

  const savePage = async () => {
    if (!settings || !page.configKey) return;
    setSaving(true);
    try {
      const current = settings[page.configKey] ?? {};
      const sections = [...(current.sections ?? [])];
      const sectionIndex = Math.max(0, sections.findIndex((section: any) => section.enabled !== false));
      if (sections.length) sections[sectionIndex] = { ...sections[sectionIndex], title: form.contentTitle, description: form.contentDescription };
      const updated = await settingsApi.update({
        [page.configKey]: {
          ...current,
          sections,
          seo: { ...current.seo, metaTitle: form.metaTitle, metaDescription: form.metaDescription },
        },
      } as any);
      const raw = updated as unknown as Record<string, any>;
      setSettings(raw);
      setPages(cmsPagesFromSettings(raw));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="
        w-full
        bg-[#fffefb]
        text-[#172238]
      "
    >
      {/* =================================================
          FOOTER SPACE RESERVED
      ================================================= */}

      <div
        className="
          flex
          flex-col
          px-[16px]
          pb-[86px]
          pt-[7px]
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            h-[58px]
            shrink-0
            items-start
            justify-between
          "
        >
          <div
            className="
              flex
              items-start
              gap-[11px]
            "
          >
            <div
              className="
                mt-[1px]
                grid
                h-[42px]
                w-[42px]
                place-items-center
                rounded-full
                bg-[#e8f4e9]
                text-[#23714a]
              "
            >
              <Edit3
                className="h-[20px] w-[20px]"
                strokeWidth={1.65}
              />
            </div>

            <div>
              <h1
                className="
                  text-[20px]
                  font-bold
                  leading-[22px]
                  tracking-[-0.02em]
                  text-[#194631]
                "
              >
                Edit Page
              </h1>

              <div
                className="
                  mt-[6px]
                  flex
                  items-center
                  gap-[7px]
                  text-[10px]
                  font-medium
                  text-[#697386]
                "
              >
                <span>Dashboard</span>

                <ChevronRight className="h-[10px] w-[10px]" />

                <span>
                  Pages &amp; CMS
                </span>

                <ChevronRight className="h-[10px] w-[10px]" />

                <span>
                  {page.title}
                </span>

                <ChevronRight className="h-[10px] w-[10px]" />

                <span>
                  Edit Page
                </span>
              </div>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-[10px]
            "
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/pages",
                )
              }
              className="
                flex
                h-[37px]
                items-center
                gap-[7px]
                rounded-[6px]
                border
                border-[#dedfdb]
                bg-white
                px-[17px]
                text-[10.5px]
                font-semibold
                text-[#415067]
              "
            >
              <ArrowLeft className="h-[13px] w-[13px]" />

              Back to Pages
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/pages/${page.id}`,
                )
              }
              className="
                flex
                h-[37px]
                items-center
                gap-[7px]
                rounded-[6px]
                border
                border-[#ddcda8]
                bg-[#fffefa]
                px-[18px]
                text-[10.5px]
                font-semibold
                text-[#3d5648]
              "
            >
              <Eye className="h-[13px] w-[13px]" />

              Preview Page
            </button>

            <button
              type="button"
              onClick={savePage}
              disabled={saving}
              className="
                flex
                h-[37px]
                items-center
                gap-[7px]
                rounded-[6px]
                bg-[linear-gradient(135deg,#08723e,#075832)]
                px-[20px]
                text-[10.5px]
                font-semibold
                text-white
                shadow-[0_4px_10px_rgba(5,88,48,0.16)]
              "
            >
              <Save className="h-[13px] w-[13px]" />

              {saving ? "Updating..." : "Update Page"}
            </button>

            <button
              type="button"
              className="
                grid
                h-[37px]
                w-[37px]
                place-items-center
                rounded-[6px]
                border
                border-[#dedfdb]
                bg-white
                text-[#445065]
              "
            >
              <MoreVertical className="h-[16px] w-[16px]" />
            </button>
          </div>
        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <div
          className="
            grid
            items-start
            grid-cols-[minmax(0,2.35fr)_minmax(330px,1fr)]
            gap-[10px]
          "
        >
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-[8px]
                border
                border-[#e7e7e3]
                bg-white
                px-[16px]
                py-[11px]
              "
            >
              <SectionTitle
                number={1}
                title="Basic Information"
              />

              <div
                className="
                  mt-[9px]
                  grid
                  grid-cols-[1.12fr_1fr_.63fr]
                  gap-x-[20px]
                  gap-y-[7px]
                "
              >
                <div>
                  <FieldLabel required>
                    Page Title
                  </FieldLabel>

                  <TextInput
                    value={
                      form.pageTitle
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "pageTitle",
                        value,
                      )
                    }
                  />

                  <p className="mt-[2px] text-right text-[9px] font-medium text-[#878f9b]">
                    {
                      form
                        .pageTitle
                        .length
                    }{" "}
                    / 100
                  </p>
                </div>

                <div>
                  <FieldLabel required>
                    URL Slug
                  </FieldLabel>

                  <div
                    className="
                      flex
                      h-[35px]
                      overflow-hidden
                      rounded-[5px]
                      border
                      border-[#dedfdb]
                      bg-white
                    "
                  >
                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        border-r
                        border-[#e5e6e2]
                        bg-[#fafaf8]
                        px-[9px]
                        text-[9.5px]
                        font-medium
                        text-[#5f6a7c]
                      "
                    >
                      {PUBLIC_SITE_URL}/
                    </div>

                    <input
                      value={
                        form.slug
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "slug",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="enter-page-slug"
                      className="
                        min-w-0
                        flex-1
                        px-[9px]
                        text-[10.5px]
                        font-medium
                        text-[#414b5e]
                        outline-none
                        placeholder:text-[#9aa0aa]
                      "
                    />
                  </div>

                  <p className="mt-[2px] text-right text-[9px] text-[#878f9b]">
                    {
                      form.slug
                        .length
                    }{" "}
                    / 80
                  </p>
                </div>

                <div>
                  <FieldLabel>
                    Select Template
                  </FieldLabel>

                  <SelectField
                    value={
                      form.template
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "template",
                        value,
                      )
                    }
                    options={[
                      "Homepage",
                      "Default",
                      "Landing Page",
                      "Service Page",
                    ]}
                  />
                </div>

                <div>
                  <FieldLabel>
                    Page Parent
                  </FieldLabel>

                  <SelectField
                    value={
                      form.parent
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "parent",
                        value,
                      )
                    }
                    options={[
                      "— No Parent (Top Level) —",
                      "Home",
                      "About Us",
                      "Our Services",
                    ]}
                  />

                  <p className="mt-[2px] text-[9px] font-medium leading-[11px] text-[#888f9a]">
                    Choose parent page
                    (if any)
                  </p>
                </div>

                <div className="col-span-2">
                  <FieldLabel>
                    Meta Title
                    (for SEO)
                  </FieldLabel>

                  <TextInput
                    value={
                      form.metaTitle
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "metaTitle",
                        value,
                      )
                    }
                  />

                  <p className="mt-[2px] text-right text-[9px] font-medium text-[#878f9b]">
                    {
                      form
                        .metaTitle
                        .length
                    }{" "}
                    / 60
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                PAGE CONTENT
            ================================================= */}

            <section
              className="
                flex
                shrink-0
                flex-col
                rounded-[8px]
                border
                border-[#e7e7e3]
                bg-white
                px-[16px]
                py-[9px]
              "
            >
              <div
                className="
                  flex
                  shrink-0
                  items-start
                  justify-between
                "
              >
                <SectionTitle
                  number={2}
                  title="Page Content"
                />

                <button
                  type="button"
                  className="
                    flex
                    h-[31px]
                    items-center
                    gap-[6px]
                    rounded-[5px]
                    border
                    border-[#98bca5]
                    bg-white
                    px-[13px]
                    text-[9.5px]
                    font-semibold
                    text-[#34714c]
                  "
                >
                  <Sparkles className="h-[12px] w-[12px]" />

                  AI Assist
                </button>
              </div>

              <div
                className="
                  mt-[6px]
                  flex
                  flex-col
                "
              >
                <FieldLabel>
                  Content Editor
                </FieldLabel>

                <div
                  className="
                    flex
                    min-h-[176px]
                    flex-col
                    rounded-[6px]
                    border
                    border-[#dedfdb]
                    bg-white
                  "
                >
                  {/* TOOLBAR */}

                  <div
                    className="
                      flex
                      h-[38px]
                      shrink-0
                      items-center
                      overflow-hidden
                      border-b
                      border-[#e3e4e0]
                      px-[7px]
                    "
                  >
                    <div className="relative mr-[5px]">
                      <select
                        className="
                          h-[29px]
                          w-[94px]
                          appearance-none
                          bg-white
                          pl-[8px]
                          pr-[21px]
                          text-[10px]
                          font-semibold
                          text-[#4e5868]
                          outline-none
                        "
                      >
                        <option>
                          Paragraph
                        </option>

                        <option>
                          Heading 1
                        </option>

                        <option>
                          Heading 2
                        </option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-[6px] top-1/2 h-[9px] w-[9px] -translate-y-1/2" />
                    </div>

                    <span className="mx-[3px] h-[23px] w-px bg-[#e5e6e2]" />

                    <ToolbarButton
                      active={
                        activeFormats.includes(
                          "bold",
                        )
                      }
                      onClick={() =>
                        toggleFormat(
                          "bold",
                        )
                      }
                    >
                      <Bold className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton
                      active={
                        activeFormats.includes(
                          "italic",
                        )
                      }
                      onClick={() =>
                        toggleFormat(
                          "italic",
                        )
                      }
                    >
                      <Italic className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton
                      active={
                        activeFormats.includes(
                          "underline",
                        )
                      }
                      onClick={() =>
                        toggleFormat(
                          "underline",
                        )
                      }
                    >
                      <Underline className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton
                      active={
                        activeFormats.includes(
                          "strike",
                        )
                      }
                      onClick={() =>
                        toggleFormat(
                          "strike",
                        )
                      }
                    >
                      <Strikethrough className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <span className="mx-[3px] h-[23px] w-px bg-[#e5e6e2]" />

                    <ToolbarButton>
                      <Quote className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <List className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <ListOrdered className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <AlignLeft className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <Link2 className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <ImageIcon className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <Video className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <Table2 className="h-[13px] w-[13px]" />
                    </ToolbarButton>

                    <div className="flex-1" />

                    <ToolbarButton>
                      <MoreHorizontal className="h-[14px] w-[14px]" />
                    </ToolbarButton>
                  </div>

                  {/* EDITOR CONTENT */}

                  <div
                    className="
                      flex
                      flex-col
                      px-[17px]
                      pb-[8px]
                      pt-[9px]
                    "
                  >
                    <input
                      value={form.contentTitle}
                      onChange={(event) => updateField("contentTitle", event.target.value)}
                      className="
                        shrink-0
                        font-serif
                        text-[20px]
                        font-bold
                        leading-[24px]
                        text-[#174a31]
                      "
                    />

                    <textarea
                      value={form.contentDescription}
                      onChange={(event) => updateField("contentDescription", event.target.value)}
                      className="
                        mt-[6px]
                        shrink-0
                        max-w-[810px]
                        text-[11.5px]
                        font-medium
                        leading-[17px]
                        text-[#4d596c]
                      "
                    />

                    <div
                      className="
                        mt-[8px]
                        flex
                        shrink-0
                        items-center
                        gap-[12px]
                      "
                    >
                      <button
                        type="button"
                        className="
                          flex
                          h-[31px]
                          shrink-0
                          items-center
                          gap-[6px]
                          rounded-[5px]
                          bg-[#075c35]
                          px-[17px]
                          text-[9.5px]
                          font-semibold
                          text-white
                        "
                      >
                        Request Sewa Help

                        <ChevronRight className="h-[10px] w-[10px]" />
                      </button>

                      <button
                        type="button"
                        className="
                          h-[31px]
                          shrink-0
                          rounded-[5px]
                          border
                          border-[#cdb67d]
                          bg-[#fffefa]
                          px-[17px]
                          text-[9.5px]
                          font-semibold
                          text-[#9c7028]
                        "
                      >
                        Learn Our Mission
                      </button>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      h-[22px]
                      shrink-0
                      items-center
                      justify-end
                      border-t
                      border-[#edede9]
                      px-[10px]
                      text-[9px]
                      font-medium
                      text-[#828a96]
                    "
                  >
                    Words: 28
                  </div>
                </div>

                {/* MEDIA ACTIONS */}

                <div
                  className="
                    mt-[6px]
                    flex
                    h-[30px]
                    shrink-0
                    items-center
                    gap-[10px]
                  "
                >
                  <button
                    type="button"
                    className="
                      flex
                      h-[30px]
                      items-center
                      gap-[7px]
                      rounded-[5px]
                      border
                      border-[#dedfdb]
                      bg-white
                      px-[14px]
                      text-[9.5px]
                      font-semibold
                      text-[#36714d]
                    "
                  >
                    <ImageIcon className="h-[13px] w-[13px]" />
                    Add Media
                  </button>

                  <button
                    type="button"
                    className="
                      flex
                      h-[30px]
                      items-center
                      gap-[7px]
                      rounded-[5px]
                      border
                      border-[#dedfdb]
                      bg-white
                      px-[14px]
                      text-[9.5px]
                      font-semibold
                      text-[#36714d]
                    "
                  >
                    <FormInput className="h-[13px] w-[13px]" />
                    Add Form
                  </button>

                  <button
                    type="button"
                    className="
                      flex
                      h-[30px]
                      items-center
                      gap-[7px]
                      rounded-[5px]
                      border
                      border-[#dedfdb]
                      bg-white
                      px-[14px]
                      text-[9.5px]
                      font-semibold
                      text-[#36714d]
                    "
                  >
                    <Code2 className="h-[13px] w-[13px]" />
                    Add Shortcode
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================
                PAGE SETTINGS
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-[8px]
                border
                border-[#e7e7e3]
                bg-white
                px-[16px]
                py-[10px]
              "
            >
              <SectionTitle
                number={3}
                title="Page Settings"
              />

              <div
                className="
                  mt-[9px]
                  grid
                  grid-cols-[.82fr_.82fr_1.4fr]
                  gap-x-[24px]
                "
              >
                <div>
                  <FieldLabel>
                    Page Status
                  </FieldLabel>

                  <SelectField
                    value={
                      form.status
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "status",
                        value as Status,
                      )
                    }
                    options={[
                      "Published",
                      "Draft",
                    ]}
                  />
                </div>

                <div>
                  <FieldLabel required>
                    Author
                  </FieldLabel>

                  <SelectField
                    value={
                      form.author
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "author",
                        value,
                      )
                    }
                    options={[
                      "Admin User",
                      "Seva Team",
                    ]}
                  />
                </div>

                {/* FEATURED IMAGE */}

                <div className="row-span-2">
                  <FieldLabel>
                    Featured Image
                  </FieldLabel>

                  <div
                    className="
                      flex
                      h-[76px]
                      items-center
                      gap-[11px]
                      rounded-[6px]
                      border
                      border-[#dedfdb]
                      bg-white
                      p-[7px]
                    "
                  >
                    <div
                      className="
                        flex
                        h-[60px]
                        w-[120px]
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[5px]
                        bg-[#faf8f3]
                      "
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}

                      <img
                        src={
                          FEATURED_IMAGE
                        }
                        alt="Featured"
                        className="
                          h-full
                          w-full
                          object-contain
                          object-center
                        "
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-[#3f4c60]">
                        featured-home.jpg
                      </p>

                      <p className="mt-[1px] text-[8.5px] font-medium text-[#808894]">
                        1200x630px
                      </p>

                      <div className="mt-[5px] flex items-center gap-[10px]">
                        <button
                          type="button"
                          className="text-[8.5px] font-semibold text-[#2d8653]"
                        >
                          Change Image
                        </button>

                        <button
                          type="button"
                          className="text-[8.5px] font-semibold text-[#d25a52]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-[9px]">
                  <FieldLabel>
                    Show in Navigation Menu
                  </FieldLabel>

                  <div className="flex items-start gap-[9px]">
                    <Toggle
                      checked={
                        form.showInNavigation
                      }
                      onChange={(
                        value,
                      ) =>
                        updateField(
                          "showInNavigation",
                          value,
                        )
                      }
                    />

                    <span className="max-w-[155px] text-[8.5px] font-medium leading-[11px] text-[#858c98]">
                      Show this page in
                      main navigation
                      menu
                    </span>
                  </div>
                </div>

                <div className="mt-[9px]">
                  <FieldLabel>
                    Menu Order
                  </FieldLabel>

                  <TextInput
                    value={
                      form.menuOrder
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "menuOrder",
                        value,
                      )
                    }
                  />

                  <p className="mt-[2px] text-[8.5px] font-medium leading-[11px] text-[#858c98]">
                    Set display order in
                    navigation menu.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            {/* =================================================
                PUBLISH
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-[8px]
                border
                border-[#e7e7e3]
                bg-white
                px-[16px]
                py-[11px]
              "
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#263148]">
                  Publish
                </h2>

                <ChevronDown className="h-[13px] w-[13px] rotate-180 text-[#596579]" />
              </div>

              <div className="mt-[9px] space-y-[6px]">
                <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Status
                  </p>

                  <SelectField
                    value={
                      form.status
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "status",
                        value as Status,
                      )
                    }
                    options={[
                      "Published",
                      "Draft",
                    ]}
                  />
                </div>

                <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Visibility
                  </p>

                  <SelectField
                    value={
                      form.visibility
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "visibility",
                        value as Visibility,
                      )
                    }
                    options={[
                      "Public",
                      "Private",
                    ]}
                  />
                </div>

                <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Published On
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#465267]">
                      <CalendarDays className="h-[12px] w-[12px]" />

                      20 May 2026,
                      10:30 AM
                    </span>

                    <button
                      type="button"
                      className="text-[9.5px] font-semibold text-[#278650]"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Last Updated
                  </p>

                  <span className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#465267]">
                    <Clock3 className="h-[12px] w-[12px]" />

                    20 May 2026,
                    10:45 AM
                  </span>
                </div>

                <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Updated By
                  </p>

                  <span className="flex items-center gap-[7px] text-[10px] font-medium text-[#465267]">
                    <UserRound className="h-[12px] w-[12px]" />

                    Admin User
                  </span>
                </div>
              </div>

              <div
                className="
                  mt-[7px]
                  flex
                  h-[35px]
                  items-center
                  gap-[8px]
                  rounded-[5px]
                  bg-[#edf6ef]
                  px-[12px]
                  text-[9.5px]
                  font-semibold
                  text-[#32784e]
                "
              >
                <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border border-[#65a17b]">
                  <Check className="h-[9px] w-[9px]" />
                </span>

                This page is currently
                published.
              </div>
            </section>

            {/* =================================================
                SEO
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-[8px]
                border
                border-[#e7e7e3]
                bg-white
                px-[16px]
                py-[11px]
              "
            >
              <h2 className="text-[14px] font-bold text-[#263148]">
                SEO Score
              </h2>

              <div
                className="
                  mt-[8px]
                  grid
                  grid-cols-[132px_1fr]
                  items-center
                  gap-[11px]
                "
              >
                <div className="flex justify-center">
                  <SeoScoreCircle />
                </div>

                <div className="space-y-[1px] border-l border-[#eeeeea] pl-[14px]">
                  <SeoRow label="Meta Title" />
                  <SeoRow label="Meta Description" />
                  <SeoRow label="Headings" />
                  <SeoRow label="Content Quality" />
                  <SeoRow label="Internal Linking" />
                  <SeoRow label="Images (ALT Text)" />
                  <SeoRow label="Schema Markup" />
                </div>
              </div>

              <button
                type="button"
                className="
                  mt-[7px]
                  flex
                  h-[31px]
                  w-full
                  items-center
                  justify-center
                  gap-[8px]
                  rounded-[5px]
                  border
                  border-[#e2d7ba]
                  bg-[#fffefa]
                  text-[9.5px]
                  font-semibold
                  text-[#37624a]
                "
              >
                <Link2 className="h-[12px] w-[12px]" />

                View Full SEO Analysis

                <ChevronRight className="h-[10px] w-[10px]" />
              </button>
            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-[8px]
                border
                border-[#e7e7e3]
                bg-white
                px-[16px]
                py-[10px]
              "
            >
              <h2 className="text-[14px] font-bold text-[#263148]">
                Quick Actions
              </h2>

              <div
                className="
                  mt-[8px]
                  grid
                  grid-cols-2
                  gap-[7px]
                "
              >
                <button
                  type="button"
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#dedfdb]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#475367]
                  "
                >
                  <Copy className="h-[13px] w-[13px]" />

                  Duplicate Page
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigator
                      .clipboard
                      ?.writeText(
                        `${PUBLIC_SITE_URL}/${form.slug}`,
                      )
                  }
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#dedfdb]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#475367]
                  "
                >
                  <Link2 className="h-[13px] w-[13px]" />

                  Copy URL
                </button>

                <button
                  type="button"
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#efcfca]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#d44f48]
                  "
                >
                  <Trash2 className="h-[13px] w-[13px]" />

                  Move to Trash
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/pages/${page.id}`,
                    )
                  }
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#dedfdb]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#475367]
                  "
                >
                  <ExternalLink className="h-[13px] w-[13px]" />

                  View Page
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
