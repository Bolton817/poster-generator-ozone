"use client";

import React from "react";
import Link from "next/link";
import { TemplateDefinition } from "@/features/templates/registry";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Calendar, Music, Sparkles, ArrowRight, Tag, Palette, Type } from "lucide-react";

export interface TemplateDetailsModalProps {
  template: TemplateDefinition | null;
  open: boolean;
  onClose: () => void;
}

export function TemplateDetailsModal({
  template,
  open,
  onClose,
}: TemplateDetailsModalProps) {
  if (!template) return null;

  const defaultContent = template.defaults.content;
  const djList = defaultContent.djNames;
  const hostList = defaultContent.hostNames;
  const primaryOffer = defaultContent.primaryOffer;
  const secondaryOffer = defaultContent.secondaryOffer;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${template.dayLabel} — ${template.name}`}
      description={template.tag}
      className="max-w-2xl"
    >
      <div className="space-y-6 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Thumbnail preview */}
          <div className="sm:col-span-5 relative aspect-[4/5] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            {template.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={template.thumbnailUrl}
                alt={`${template.name} artwork preview`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                No preview available
              </div>
            )}
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-semibold text-amber-400 backdrop-blur-sm">
              {template.dayLabel}
            </span>
          </div>

          {/* Details breakdown */}
          <div className="sm:col-span-7 space-y-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 tracking-wider">
                Event Title
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {template.eventTitle}
              </h3>
              <p className="text-slate-300 mt-1.5 leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Resident Performers */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                <Music className="w-3.5 h-3.5" />
                <span>Resident Lineup</span>
              </div>
              <div className="text-slate-200 font-medium">
                {djList.length > 0 && (
                  <p>
                    <span className="text-slate-400 text-[11px]">DJ: </span>
                    {djList.join(" & ")}
                  </p>
                )}
                {hostList.length > 0 && (
                  <p>
                    <span className="text-slate-400 text-[11px]">Hosts: </span>
                    {hostList.join(" & ")}
                  </p>
                )}
                {djList.length === 0 && hostList.length === 0 && (
                  <p className="text-slate-400 italic">Lineup configurable in editor</p>
                )}
              </div>
            </div>

            {/* Promotional Offer */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Source Brief Offer</span>
              </div>
              <div className="text-slate-200">
                {primaryOffer ? (
                  <p className="font-semibold">{primaryOffer}</p>
                ) : (
                  <p className="text-slate-400 italic">
                    No promo offer in source brief (clean offer-free rebalancing)
                  </p>
                )}
                {secondaryOffer && (
                  <p className="text-slate-300 text-[11px] mt-0.5">{secondaryOffer}</p>
                )}
              </div>
            </div>

            {/* Palettes & Typography */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center gap-1 text-slate-400 font-semibold text-[10px] uppercase tracking-wider mb-1.5">
                  <Palette className="w-3 h-3 text-amber-400" />
                  <span>Curated Palettes</span>
                </div>
                <div className="space-y-1.5">
                  {template.palettePresets.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm z-20"
                          style={{ backgroundColor: p.primary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm z-10"
                          style={{ backgroundColor: p.secondary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: p.accent }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-300 truncate font-medium">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-slate-400 font-semibold text-[10px] uppercase tracking-wider mb-1.5">
                  <Type className="w-3 h-3 text-amber-400" />
                  <span>Typography Roles</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  {template.typographyPresets.map((t) => (
                    <p key={t.id} className="truncate">
                      • {t.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Back to Gallery
          </Button>
          <Link href={`/app/templates/${template.id}`} onClick={onClose}>
            <Button variant="primary" size="sm" className="gap-2">
              <span>Customize in Editor</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Dialog>
  );
}
