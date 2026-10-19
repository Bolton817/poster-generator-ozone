"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FolderOpen, Sliders } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/app/templates",
    label: "Templates",
    icon: LayoutGrid,
  },
  {
    href: "/app/drafts",
    label: "Drafts",
    icon: FolderOpen,
  },
  {
    href: "/app/settings",
    label: "Settings",
    icon: Sliders,
  },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation Tabs (Horizontal Top Bar under Header) */}
      <nav className="hidden sm:block border-b border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? "border-amber-400 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Sticky with safe-area spacing) */}
      <nav
        aria-label="Mobile navigation"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-3 h-16 items-center px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-colors min-h-[48px] ${
                  isActive
                    ? "text-amber-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
