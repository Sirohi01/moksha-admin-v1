"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Headphones } from "lucide-react";
import { NAV_SECTIONS, type NavItem } from "./navigation";

function isActive(pathname: string, href?: string, searchParams?: URLSearchParams) {
  if (!href) return false;
  if (href === "/") return pathname === "/";

  const [basePath, query = ""] = href.split("?");
  if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) return false;
  if (!query) return true;

  const expected = new URLSearchParams(query);
  for (const [key, value] of expected.entries()) {
    if (searchParams?.get(key) !== value) return false;
  }
  return true;
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(pathname, item.href, searchParams);
    const content = (
      <>
        <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[8px] font-bold text-[#05243b]">
            {item.badge}
          </span>
        )}
      </>
    );

    if (item.disabled || !item.href) {
      return (
        <div
          key={item.label}
          aria-disabled="true"
          title="This module is not available yet"
          className="flex cursor-not-allowed items-center gap-2 rounded-md px-2.5 py-[5px] text-[13px] font-medium text-white/35"
        >
          {content}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={onNavigate}
        className={`relative flex items-center gap-2 rounded-md px-2.5 py-[5px] text-[13px] font-medium transition-colors ${
          active
            ? "bg-gradient-to-r from-[#9c8430] to-[#6e682d] text-white shadow-[0_3px_12px_rgba(0,0,0,0.2)]"
            : "text-slate-200 hover:bg-white/10 hover:text-white"
        }`}
      >
        {content}
      </Link>
    );
  };

  return (
    <aside className="relative flex h-full w-60 shrink-0 flex-col overflow-hidden border-r border-cyan-900/70 bg-[linear-gradient(180deg,#042c49_0%,#063654_54%,#073b58_100%)] text-white shadow-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(19,104,137,0.28),transparent_38%)]" />

      <div className="relative z-10 shrink-0 px-4 pb-3 pt-3">
        <div className="mx-auto flex h-[112px] w-full items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/moksha-sewa-logo.png"
            alt="Moksha Sewa"
            className="h-full w-full object-contain object-center"
          />
        </div>
      </div>

      <nav className="relative z-10 min-h-0 flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-color:rgba(255,255,255,0.22)_transparent] [scrollbar-width:thin]">
        {NAV_SECTIONS.map((section) => (
          <section key={section.title} className="mb-2">
            <div className="mb-1 flex items-center gap-2 px-2">
              <h2 className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-300">
                {section.title}
              </h2>
              <span className="h-px flex-1 bg-cyan-200/20" />
            </div>
            <div className="space-y-px">{section.items.map(renderItem)}</div>
          </section>
        ))}
      </nav>

      <div className="relative z-10 shrink-0 px-3 pb-3 pt-1">
        <a
          href="mailto:info@mokshasewa.org"
          className="flex items-center gap-2.5 rounded-lg border border-amber-300/25 bg-gradient-to-r from-[#7e772e] to-[#5e682d] px-3 py-2.5 text-white transition hover:brightness-110"
        >
          <Headphones className="h-6 w-6 shrink-0" strokeWidth={1.5} />
          <span>
            <span className="block text-[10px] font-medium">Need Help?</span>
            <span className="block text-[9px] text-white/80">Contact IT Support</span>
          </span>
        </a>
      </div>
    </aside>
  );
}
