"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NAV_SECTIONS } from "./navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_SECTIONS.filter((s) => s.title !== "Overview").map((s) => [s.title, true]))
  );

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-white/10 backdrop-blur-md border-r border-white/20 shadow-sm overflow-hidden">
      <div className="flex w-full shrink-0 items-center justify-center border-b border-white/40 px-2 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt="Moksha Sewa Admin" className="w-full object-contain mix-blend-multiply" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV_SECTIONS.map((section) => {
          const isCollapsed = collapsed[section.title];
          return (
            <div key={section.title} className="mb-1.5">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
              >
                {section.title}
                <ChevronDown className={`h-3 w-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
              {!isCollapsed && (
                <div className="mt-0.5 space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors ${active
                            ? "bg-white/70 text-slate-900 shadow-sm border border-white/50"
                            : "text-slate-600 hover:bg-white/40 hover:text-slate-900"
                          }`}
                      >
                        {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />}
                        <Icon className={`h-4 w-4 shrink-0 ${active ? "text-accent" : "text-slate-500"}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/40 px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/encodency-logo.jpg" alt="enCodency" className="w-full rounded-md object-contain" />
      </div>
    </aside>
  );
}
