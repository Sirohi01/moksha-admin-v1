"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NAV_SECTIONS, NavItem } from "./navigation";
import { useAppSelector } from "@/store/hooks";

function isActive(pathname: string, href: string, searchParams?: URLSearchParams): boolean {
  if (href === "/") return pathname === "/";

  if (href.includes("?")) {
    const [basePath, query = ""] = href.split("?");
    const params = new URLSearchParams(query);

    // Pathname must match
    if (pathname !== basePath) return false;

    // Every param in the href must match the current searchParams
    let allMatch = true;
    params.forEach((value, key) => {
      let currentVal = searchParams?.get(key);
      if (key === "page" && !currentVal) {
        currentVal = "landing";
      }
      if (currentVal !== value) {
        allMatch = false;
      }
    });

    return allMatch;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const admin = useAppSelector((state) => state.auth.admin);
  const permissions = admin?.permissions ?? [];
  const isSuperAdmin = admin?.roleSlug === "super_admin";
  const selectedOrganisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const permissionSet = new Set(permissions);
  const canView = (item: NavItem) => {
    const inOrganisation = !item.organisationCodes || (selectedOrganisationCode !== null && item.organisationCodes.includes(selectedOrganisationCode));
    return inOrganisation && (isSuperAdmin || !item.requiredPermission || permissionSet.has(item.requiredPermission));
  };
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      NAV_SECTIONS.filter((s) => s.title !== "Overview").map((s) => [s.title, true])
    )
  );
  const [nestedCollapsed, setNestedCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleNested = (key: string) => {
    setNestedCollapsed((prev) => ({ ...prev, [key]: prev[key] === undefined ? false : !prev[key] }));
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (!canView(item)) return null;
    const active = isActive(pathname, item.href, searchParams);
    const Icon = item.icon;

    if (item.children?.length) {
      const isOpen = nestedCollapsed[item.label] === false;
      return (
        <div
          key={item.href}
          className={`rounded-lg border ${active ? "border-accent/20 bg-accent-soft" : "border-transparent"}`}
          style={{ marginLeft: depth * 10 }}
        >
          <div className="flex items-center gap-1.5">
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors ${active
                ? "bg-accent-soft text-accent shadow-sm border border-accent/20"
                : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
                }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-accent" : "text-slate-500"}`} />
              {item.label}
            </Link>
            <button
              type="button"
              onClick={() => toggleNested(item.label)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label={`Toggle ${item.label}`}
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
            </button>
          </div>

          {isOpen && (
            <div className="ml-2 mt-1 space-y-1 border-l border-slate-200 pl-2">
              {item.children.filter(canView).map((child) => {
                return renderNavItem(child, depth + 1);
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        style={{ marginLeft: depth * 10 }}
        className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors ${active
          ? "bg-accent-soft text-accent shadow-sm border border-accent/20"
          : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
          }`}
      >
        {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />}
        <Icon className={`h-4 w-4 shrink-0 ${active ? "text-accent" : "text-slate-500"}`} />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-white/75 backdrop-blur-xl border-r border-white/80 shadow-md overflow-hidden">
      <div className="flex w-full shrink-0 items-center justify-center border-b border-slate-200/70 px-2 py-4">
        { }
        <img src="/logo.webp" alt="Namo Gange Admin" className="w-full object-contain mix-blend-multiply" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(canView);
          if (visibleItems.length === 0) return null;
          const isCollapsed = collapsed[section.title];
          return (
            <div key={section.title} className="mb-1.5">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
              >
                {section.title}
                <ChevronDown className={`h-3 w-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
              {!isCollapsed && (
                <div className="mt-0.5 space-y-1.5">
                  {visibleItems.map((item) => renderNavItem(item))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200/70 px-4 py-3">
        { }
        <img src="/encodency-logo.jpg" alt="enCodency" className="w-full rounded-md object-contain" />
      </div>
    </aside>
  );
}
