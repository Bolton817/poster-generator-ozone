"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  icon,
  children,
  className = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionId = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      className={`border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 backdrop-blur-sm transition-colors ${className}`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`section-${sectionId}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors cursor-pointer min-h-[52px]"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {icon && <div className="text-amber-400 shrink-0">{icon}</div>}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100 truncate">
                {title}
              </span>
              {badge && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div
          className={`p-1 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {isOpen && (
        <div
          id={`section-${sectionId}`}
          className="p-4 pt-2 border-t border-slate-800/80 space-y-4 animate-in fade-in-50 duration-150"
        >
          {children}
        </div>
      )}
    </div>
  );
}
