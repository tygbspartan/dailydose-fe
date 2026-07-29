"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const close = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar — static, hidden on mobile */}
      <div className="hidden md:flex h-screen">
        <AdminSidebar />
      </div>

      {/* Mobile drawer + backdrop */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 transition-opacity",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className="absolute inset-0 bg-black/40" onClick={close} />
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-transform duration-200",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <AdminSidebar onNavigate={close} />
        </div>
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 min-h-0">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
