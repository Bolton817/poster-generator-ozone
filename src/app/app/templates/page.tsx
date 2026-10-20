import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getTemplatesInOrder } from "@/features/templates/registry";

export const metadata = {
  title: "Weekly Templates — Ozone Lounge Poster Generator",
};

export default function TemplatesPage() {
  const templates = getTemplatesInOrder();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Weekly Event Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Seven distinct creative identities organized Monday through Sunday. Driven by the single-source template registry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/diagnostic/canvas-poc">
            <Button variant="secondary" size="sm" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
              Canvas & Export POC
            </Button>
          </Link>
          <Link href="/app/drafts">
            <Button variant="outline" size="sm">
              View Saved Drafts
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Templates directly from Registry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all shadow-lg overflow-hidden"
          >
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-semibold text-amber-400">
                  <Calendar className="w-3 h-3" />
                  {tpl.dayLabel}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {tpl.name}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {tpl.eventTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {tpl.tag}
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tpl.palettePresets.slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      title={p.name}
                      style={{ backgroundColor: p.primary }}
                      className="w-3.5 h-3.5 rounded-full border border-slate-700/80 inline-block shadow-sm"
                    />
                  ))}
                  <span className="text-[10px] text-slate-500 ml-1">
                    {tpl.palettePresets.length} palettes
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-6 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                1080 × 1350 px (4:5)
              </span>
              <span className="text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-xs font-semibold">
                <span>Select</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
