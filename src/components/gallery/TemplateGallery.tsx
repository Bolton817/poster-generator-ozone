"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, Search, Eye, X, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getTemplatesInOrder, TemplateDefinition } from "@/features/templates/registry";
import { TemplateDetailsModal } from "./TemplateDetailsModal";
import { TemplateContactSheetModal } from "./TemplateContactSheetModal";

export type DaySegmentFilter = "all" | "weekdays" | "weekend";

export function TemplateGallery() {
  const templates = getTemplatesInOrder();

  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<DaySegmentFilter>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
  const [showContactSheet, setShowContactSheet] = useState(false);

  // Filter templates by day segment and search query
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // 1. Day Segment Filter
      // Weekdays: Monday (1), Tuesday (2), Wednesday (3), Thursday (4)
      // Weekend: Friday (5), Saturday (6), Sunday (0)
      if (segmentFilter === "weekdays" && (tpl.dayOfWeek < 1 || tpl.dayOfWeek > 4)) {
        return false;
      }
      if (segmentFilter === "weekend" && (tpl.dayOfWeek !== 5 && tpl.dayOfWeek !== 6 && tpl.dayOfWeek !== 0)) {
        return false;
      }

      // 2. Search Query Filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = tpl.name.toLowerCase().includes(q);
      const matchTitle = tpl.eventTitle.toLowerCase().includes(q);
      const matchTag = tpl.tag.toLowerCase().includes(q);
      const matchDay = tpl.dayLabel.toLowerCase().includes(q);
      const matchDj = tpl.defaults.content.djNames.some((dj) => dj.toLowerCase().includes(q));
      const matchHost = tpl.defaults.content.hostNames.some((h) => h.toLowerCase().includes(q));
      const matchOffer = tpl.defaults.content.primaryOffer.toLowerCase().includes(q);

      return matchName || matchTitle || matchTag || matchDay || matchDj || matchHost || matchOffer;
    });
  }, [templates, segmentFilter, searchQuery]);

  const weekdayCount = useMemo(
    () => templates.filter((t) => t.dayOfWeek >= 1 && t.dayOfWeek <= 4).length,
    [templates]
  );
  const weekendCount = useMemo(
    () => templates.filter((t) => t.dayOfWeek === 5 || t.dayOfWeek === 6 || t.dayOfWeek === 0).length,
    [templates]
  );

  return (
    <div className="space-y-6" data-testid="template-gallery-root">
      {/* Page Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Weekly Event Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Seven distinct creative identities organized Monday through Sunday. Driven by the single-source template registry.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContactSheet(true)}
            className="border-slate-700 bg-slate-900/60 text-slate-200 hover:text-white gap-1.5"
            data-testid="contact-sheet-btn"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span>Contact Sheet &amp; Matrix</span>
          </Button>

          <Link href="/app/drafts">
            <Button variant="secondary" size="sm">
              View Saved Drafts
            </Button>
          </Link>
        </div>
      </div>

      {/* Discoverability Controls Toolbar: Search & Day Segment Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        {/* Day Segment Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSegmentFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              segmentFilter === "all"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            data-testid="filter-all"
          >
            All ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setSegmentFilter("weekdays")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              segmentFilter === "weekdays"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            data-testid="filter-weekdays"
          >
            Weekdays ({weekdayCount})
          </button>
          <button
            type="button"
            onClick={() => setSegmentFilter("weekend")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              segmentFilter === "weekend"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            data-testid="filter-weekend"
          >
            Weekend ({weekendCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates, DJs, offers..."
            className="pl-9 pr-8 text-xs bg-slate-950 border-slate-800"
            data-testid="template-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:border-amber-500/40 transition-all shadow-lg overflow-hidden"
              data-testid={`template-card-${tpl.id}`}
            >
              <div className="relative z-10 space-y-3">
                {/* Header Day Badge & Name */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-semibold text-amber-400">
                    <Calendar className="w-3 h-3" />
                    {tpl.dayLabel}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {tpl.name}
                  </span>
                </div>

                {/* 4:5 Aspect Ratio Vector Thumbnail */}
                {tpl.thumbnailUrl && (
                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950/80 group-hover:border-amber-500/40 transition-colors shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tpl.thumbnailUrl}
                      alt={`${tpl.name} preview`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Quick Preview Hover Overlay */}
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(tpl)}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-300 backdrop-blur-[2px] cursor-pointer"
                      title="Quick details & palette breakdown"
                      data-testid={`quick-view-${tpl.id}`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Quick Details</span>
                    </button>
                  </div>
                )}

                {/* Event Title & Tag */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {tpl.eventTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {tpl.tag}
                  </p>
                </div>

                {/* Palette Swatches */}
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tpl.palettePresets.map((p) => (
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

              {/* Bottom Actions */}
              <div className="relative z-10 pt-4 mt-5 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className="text-[11px] font-medium text-slate-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Details</span>
                </button>

                <Link
                  href={`/app/templates/${tpl.id}`}
                  className="text-amber-400 hover:text-amber-300 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 text-xs font-bold"
                  data-testid={`customize-btn-${tpl.id}`}
                >
                  <span>Customize</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <p className="text-sm font-semibold text-slate-300">
            No templates found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or segment filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSegmentFilter("all");
            }}
            className="mt-2 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Selected Template Details Modal */}
      <TemplateDetailsModal
        template={selectedTemplate}
        open={Boolean(selectedTemplate)}
        onClose={() => setSelectedTemplate(null)}
      />

      {/* Full Weekly Fleet Contact Sheet Modal */}
      <TemplateContactSheetModal
        open={showContactSheet}
        onClose={() => setShowContactSheet(false)}
      />
    </div>
  );
}
