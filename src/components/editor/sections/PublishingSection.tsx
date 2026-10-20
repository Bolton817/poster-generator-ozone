"use client";

import React from "react";
import { useEditor } from "@/features/editor/editor-context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Input } from "@/components/ui/Input";
import { Share2, Info } from "lucide-react";

export function PublishingSection() {
  const { state, setContentField } = useEditor();
  const { document } = state;

  return (
    <CollapsibleSection
      title="Publishing & Logistics"
      subtitle="Date, time, venue, and contact details"
      icon={<Share2 className="w-4 h-4" />}
    >
      <div className="space-y-4 p-4">
        {/* Preflight Guidance Notice */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Optional fields left blank will be hidden cleanly from poster artwork without leaving empty gaps or placeholder labels.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="editor-date-text"
            label="Date Text"
            value={document.content.dateText}
            onChange={(e) => setContentField("dateText", e.target.value)}
            placeholder="e.g. Every Monday, 24 Oct"
          />

          <Input
            id="editor-start-time"
            label="Start Time"
            value={document.content.startTime}
            onChange={(e) => setContentField("startTime", e.target.value)}
            placeholder="e.g. 4:00 PM Till Late"
          />
        </div>

        <Input
          id="editor-venue-name"
          label="Venue Name"
          value={document.content.venueName}
          onChange={(e) => setContentField("venueName", e.target.value)}
          placeholder="Ozone Lounge"
        />

        <Input
          id="editor-location-text"
          label="Location / Address"
          value={document.content.locationText}
          onChange={(e) => setContentField("locationText", e.target.value)}
          placeholder="e.g. Kilimani, Nairobi"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="editor-contact-text"
            label="Contact / Reservations"
            value={document.content.contactText}
            onChange={(e) => setContentField("contactText", e.target.value)}
            placeholder="e.g. +254 700 000 000"
          />

          <Input
            id="editor-social-handle"
            label="Social Handle"
            value={document.content.socialHandle}
            onChange={(e) => setContentField("socialHandle", e.target.value)}
            placeholder="@ozonelounge"
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
