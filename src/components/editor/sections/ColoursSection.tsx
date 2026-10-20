"use client";

import React from "react";
import { useEditor } from "@/features/editor/editor-context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Palette, Check } from "lucide-react";

export function ColoursSection() {
  const { state, setPalette, template } = useEditor();
  const { document } = state;

  const currentPaletteId = document.styling.paletteId;

  return (
    <CollapsibleSection
      title="Colours & Palettes"
      subtitle={`${template.palettePresets.length} presets available`}
      icon={<Palette className="w-4 h-4" />}
    >
      <div className="space-y-3 p-4">
        <p className="text-xs text-slate-400">
          Curated colour combinations tailored for {template.name}&apos;s identity.
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          {template.palettePresets.map((palette) => {
            const isSelected = palette.id === currentPaletteId;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => setPalette(palette.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">
                      {palette.name}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                        Selected
                      </span>
                    )}
                  </div>

                  {/* Swatches bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 p-1 rounded-md bg-slate-950/80 border border-slate-800">
                      <span
                        title={`Primary: ${palette.primary}`}
                        style={{ backgroundColor: palette.primary }}
                        className="w-4 h-4 rounded-full border border-black/40"
                      />
                      <span
                        title={`Secondary: ${palette.secondary}`}
                        style={{ backgroundColor: palette.secondary }}
                        className="w-4 h-4 rounded-full border border-black/40"
                      />
                      <span
                        title={`Accent: ${palette.accent}`}
                        style={{ backgroundColor: palette.accent }}
                        className="w-4 h-4 rounded-full border border-black/40"
                      />
                      <span
                        title={`Background: ${palette.background}`}
                        style={{ backgroundColor: palette.background }}
                        className="w-4 h-4 rounded-full border border-black/40"
                      />
                    </div>
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
