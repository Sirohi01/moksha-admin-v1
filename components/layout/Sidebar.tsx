"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NAV_SECTIONS, NavItem } from "./navigation";

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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const initialState = Object.fromEntries(
      NAV_SECTIONS.filter((s) => s.title !== "Overview").map((s) => [s.title, s.title !== "Masters"])
    );
    return initialState;
  });

  const [nestedCollapsed, setNestedCollapsed] = useState<Record<string, boolean>>({});

  // Auto-expand sections that contain the active route and close others (Accordion behavior)
  useEffect(() => {
    setNestedCollapsed((prev) => {
      const next: Record<string, boolean> = { ...prev };
      
      const checkItem = (item: NavItem): boolean => {
        let isItemActive = isActive(pathname, item.href, searchParams as any);
        let hasActiveChild = false;
        if (item.children?.length) {
          for (const child of item.children) {
            if (checkItem(child)) hasActiveChild = true;
          }
          // Open if it has an active child OR if the parent itself is active
          next[item.label] = !(isItemActive || hasActiveChild);
        }
        
        return isItemActive || hasActiveChild;
      };

      NAV_SECTIONS.forEach((section) => {
        section.items.forEach(checkItem);
      });
      
      // Only update if there are actual changes to avoid unnecessary renders
      const hasChanges = Object.keys(next).some((key) => next[key] !== prev[key]);
      return hasChanges ? next : prev;
    });

    setCollapsed((prev) => {
      const next: Record<string, boolean> = { ...prev };
      
      NAV_SECTIONS.forEach((section) => {
        let sectionHasActive = false;
        
        const checkItem = (item: NavItem): boolean => {
          let isItemActive = isActive(pathname, item.href, searchParams as any);
          let hasActiveChild = false;
          if (item.children?.length) {
            for (const child of item.children) {
              if (checkItem(child)) hasActiveChild = true;
            }
          }
          return isItemActive || hasActiveChild;
        };
        
        section.items.forEach((item) => {
          if (checkItem(item)) sectionHasActive = true;
        });
        
        if (sectionHasActive) {
          next[section.title] = false; // Open active sections
        }
      });
      
      const hasChanges = Object.keys(next).some((key) => next[key] !== prev[key]);
      return hasChanges ? next : prev;
    });
  }, [pathname, searchParams]);

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleNested = (key: string) => {
    setNestedCollapsed((prev) => {
      const isCollapsed = prev[key] ?? true;
      if (isCollapsed) {
        // We are opening this one. Close all others!
        const next: Record<string, boolean> = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = true;
        });
        next[key] = false;
        return next;
      } else {
        // We are closing this one.
        return { ...prev, [key]: true };
      }
    });
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const active = isActive(pathname, item.href, searchParams);
    const Icon = item.icon;

    if (item.children?.length) {
      const isOpen = !(nestedCollapsed[item.label] ?? true);
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
              className={`flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors ${
                active
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
              {item.children.map((child) => {
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
        className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors ${
          active
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
                className="flex w-full items-center justify-between px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
              >
                {section.title}
                <ChevronDown className={`h-3 w-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
              {!isCollapsed && (
                <div className="mt-0.5 space-y-1.5">
                  {section.items.map((item) => renderNavItem(item))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200/70 px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/encodency-logo.jpg" alt="enCodency" className="w-full rounded-md object-contain" />
      </div>
    </aside>
  );
}
