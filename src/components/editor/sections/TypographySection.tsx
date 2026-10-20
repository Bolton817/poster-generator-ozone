"use client";

import React from "react";
import { useEditor } from "@/features/editor/editor-context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Type, Check } from "lucide-react";

export function TypographySection() {
  const { state, setTypographyPreset, template } = useEditor();
  const { document } = state;

  const currentPresetId = document.styling.typographyPresetId;

  return (
    <CollapsibleSection
      title="Typography Presets"
      subtitle={`${template.typographyPresets.length} curated pairings`}
      icon={<Type className="w-4 h-4" />}
    >
      <div className="space-y-3 p-4">
        <p className="text-xs text-slate-400">
          Curated font pairings designed for {template.name}&apos;s visual hierarchy.
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          {template.typographyPresets.map((preset) => {
            const isSelected = preset.id === currentPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTypographyPreset(preset.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono space-x-2">
                    <span>Title: <strong>{preset.displayFont}</strong></span>
                    <span>·</span>
                    <span>Body: <strong>{preset.bodyFont}</strong></span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </CollapsibleSection>
  );
}
