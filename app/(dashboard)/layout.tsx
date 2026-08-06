"use client";

import { useState } from "react";
import RequireAdminAuth from "@/components/auth/RequireAdminAuth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AdminFooter from "@/components/layout/AdminFooter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <RequireAdminAuth>
      <div className="flex h-screen overflow-hidden bg-surface-bg">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute inset-y-0 left-0">
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto px-4 pb-4 pt-3 lg:px-5 lg:pb-5 lg:pt-3">{children}</main>
          <AdminFooter />
        </div>
      </div>
    </RequireAdminAuth>
  );
}
