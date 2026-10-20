"use client";

import React from "react";
import { useEditor } from "@/features/editor/editor-context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Input } from "@/components/ui/Input";
import { Tag, AlertTriangle, Info } from "lucide-react";
import { OFFER_WARNING_THRESHOLD } from "@/features/editor/validation";

export function OfferSection() {
  const { state, setContentField } = useEditor();
  const { document, warnings } = state;

  const primaryWarning = warnings.find((w) => w.field === "primaryOffer");
  const secondaryWarning = warnings.find((w) => w.field === "secondaryOffer");
  const fridayInfo = warnings.find((w) => w.field === "offer");

  const primaryLength = document.content.primaryOffer.length;
  const secondaryLength = document.content.secondaryOffer.length;

  return (
    <CollapsibleSection
      title="Promotions & Offers"
      subtitle={
        document.content.primaryOffer
          ? document.content.primaryOffer
          : document.templateId === "lothbrok"
          ? "Offer-Free by Default (Balanced Layout)"
          : "Optional promotions"
      }
      icon={<Tag className="w-4 h-4" />}
    >
      <div className="space-y-4 p-4">
        {/* Friday Special Notice */}
        {fridayInfo && (
          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/80 text-xs text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>{fridayInfo.message}</span>
          </div>
        )}

        {/* Primary Offer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="editor-primary-offer" className="text-xs font-medium text-slate-300">
              Primary Offer / Highlight
            </label>
            <span
              className={`text-[11px] font-mono ${
                primaryLength > OFFER_WARNING_THRESHOLD
                  ? "text-amber-400 font-semibold"
                  : "text-slate-400"
              }`}
            >
              {primaryLength} / {OFFER_WARNING_THRESHOLD} chars
            </span>
          </div>
          <Input
            id="editor-primary-offer"
            value={document.content.primaryOffer}
            onChange={(e) => setContentField("primaryOffer", e.target.value)}
            placeholder="e.g. Discounts on all drinks, Free koroga chicken"
          />
          {primaryWarning && (
            <div className="flex items-center gap-1.5 text-amber-300 text-xs mt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{primaryWarning.message}</span>
            </div>
          )}
        </div>

        {/* Secondary Offer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="editor-secondary-offer" className="text-xs font-medium text-slate-300">
              Secondary Offer / Qualification
            </label>
            <span
              className={`text-[11px] font-mono ${
                secondaryLength > OFFER_WARNING_THRESHOLD
                  ? "text-amber-400 font-semibold"
                  : "text-slate-400"
              }`}
            >
              {secondaryLength} / {OFFER_WARNING_THRESHOLD} chars
            </span>
          </div>
          <Input
            id="editor-secondary-offer"
            value={document.content.secondaryOffer}
            onChange={(e) => setContentField("secondaryOffer", e.target.value)}
            placeholder="e.g. Excluding wine, Discounts on whiskey bottles"
          />
          {secondaryWarning && (
            <div className="flex items-center gap-1.5 text-amber-300 text-xs mt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{secondaryWarning.message}</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 italic">
          Tip: Leaving offer fields empty will omit the offer container cleanly from the poster without leaving empty cards.
        </p>
      </div>
    </CollapsibleSection>
  );
}
