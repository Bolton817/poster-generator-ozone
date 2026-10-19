"use client";

import React from "react";
import { useTheme } from "@/features/theme/theme-context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Sun, Moon, Monitor, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure operator workspace preferences and interface themes.
        </p>
      </div>

      {/* Theme Selection Section */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Interface Theme Preference
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The application opens in dark mode by default. Switching themes affects the operator UI only and will never alter the poster artwork colors or export output.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Dark Mode Card */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              theme === "dark"
                ? "border-amber-400 bg-amber-500/10 text-amber-300 ring-2 ring-amber-400/20"
                : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
            }`}
          >
            <Moon className="w-5 h-5" />
            <span>Dark Theme (Default)</span>
          </button>

          {/* Light Mode Card */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              theme === "light"
                ? "border-amber-400 bg-amber-500/10 text-amber-300 ring-2 ring-amber-400/20"
                : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
            }`}
          >
            <Sun className="w-5 h-5" />
            <span>Bright Theme</span>
          </button>
        </div>
      </div>

      {/* Canvas Specifications Collapsible */}
      <CollapsibleSection
        title="Canvas & Output Standard"
        subtitle="Fixed virtual master canvas rules"
        badge="Active Standard"
        defaultOpen={true}
        icon={<Monitor className="w-4 h-4" />}
      >
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">Master Dimensions:</span>
            <span className="font-mono text-white">1080 × 1350 px</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">Aspect Ratio:</span>
            <span className="font-mono text-white">4:5 (Social Feed Standard)</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">Supported Raster Exports:</span>
            <span className="font-mono text-white">PNG (Lossless) & JPEG</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-400">Preview Scaling:</span>
            <span className="text-amber-400 font-medium">Non-destructive CSS Scale</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Operator Safety Notice */}
      <CollapsibleSection
        title="Security & Operator Boundaries"
        subtitle="Role privileges and session safety"
        badge="Enforced"
        defaultOpen={false}
        icon={<Shield className="w-4 h-4" />}
      >
        <p className="text-xs text-slate-400 leading-relaxed">
          Sessions are managed server-side using secure, HTTP-only cookies. Operator accounts are provisioned exclusively by system administrators. Public self-registration is strictly disabled.
        </p>
      </CollapsibleSection>
    </div>
  );
}
