"use client";

import React from "react";
import Link from "next/link";
import { getTemplatesInOrder } from "@/features/templates/registry";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Music, Sparkles, CheckCircle2 } from "lucide-react";

export interface TemplateContactSheetModalProps {
  open: boolean;
  onClose: () => void;
}

export function TemplateContactSheetModal({
  open,
  onClose,
}: TemplateContactSheetModalProps) {
  const templates = getTemplatesInOrder();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Weekly Fleet Contact Sheet & Content Matrix"
      description="Side-by-side visual overview and data specifications for all seven Ozone Lounge templates."
      className="max-w-6xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6 pt-2">
        {/* Fleet Architecture Specs Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Master Dimensions</span>
            <p className="font-bold text-white mt-0.5">1080 × 1350 px</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Aspect Ratio</span>
            <p className="font-bold text-amber-400 mt-0.5">4:5 Social Standard</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Fleet Status</span>
            <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>7/7 Fully Custom</span>
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Architecture</span>
            <p className="font-bold text-white mt-0.5">Single-Source Registry</p>
          </div>
        </div>

        {/* 7-Template Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((tpl) => {
            const djList = tpl.defaults.content.djNames;
            const hostList = tpl.defaults.content.hostNames;
            const offer = tpl.defaults.content.primaryOffer;

            return (
              <div
                key={tpl.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3"
              >
                <div className="space-y-2.5">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-400">
                      {tpl.dayLabel}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {tpl.name}
                    </span>
                  </div>

                  {/* Artwork Preview */}
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-slate-800/80 bg-slate-900 shadow-inner">
                    {tpl.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tpl.thumbnailUrl}
                        alt={`${tpl.name} preview`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-[10px]">
                        No preview
                      </div>
                    )}
                  </div>

                  {/* Title & Tag */}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {tpl.eventTitle}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {tpl.tag}
                    </p>
                  </div>

                  {/* Performer & Offer Summary */}
                  <div className="space-y-1.5 pt-1 text-[11px] border-t border-slate-800/60">
                    <div className="flex items-start gap-1.5 text-slate-300">
                      <Music className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span className="truncate">
                        {djList.length > 0 && `DJ: ${djList.join(" & ")}`}
                        {hostList.length > 0 && `Hosts: ${hostList.join(" & ")}`}
                        {djList.length === 0 && hostList.length === 0 && "Configurable"}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-slate-300">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span className="truncate" title={offer || "Offer-free rebalance"}>
                        {offer || "Offer-free rebalancing (per brief)"}
                      </span>
                    </div>
                  </div>

                  {/* Palettes */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {tpl.palettePresets.map((p) => (
                      <span
                        key={p.id}
                        title={p.name}
                        style={{ backgroundColor: p.primary }}
                        className="w-3 h-3 rounded-full border border-slate-700 inline-block shadow-sm"
                      />
                    ))}
                    <span className="text-[10px] text-slate-500 ml-1">
                      {tpl.palettePresets.length} palettes
                    </span>
                  </div>
                </div>

                {/* Open in Editor Link */}
                <Link
                  href={`/app/templates/${tpl.id}`}
                  onClick={onClose}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 justify-between text-xs font-semibold py-1.5"
                  >
                    <span>Open Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Modal Close Button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Matrix
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
