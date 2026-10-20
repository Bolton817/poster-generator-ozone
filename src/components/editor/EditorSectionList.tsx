"use client";

import React from "react";
import { EventDetailsSection } from "./sections/EventDetailsSection";
import { LineupSection } from "./sections/LineupSection";
import { OfferSection } from "./sections/OfferSection";
import { ArtworkSection } from "./sections/ArtworkSection";
import { TypographySection } from "./sections/TypographySection";
import { ColoursSection } from "./sections/ColoursSection";
import { PublishingSection } from "./sections/PublishingSection";

export function EditorSectionList() {
  return (
    <div className="space-y-3 pb-8" data-testid="editor-section-list">
      <EventDetailsSection />
      <LineupSection />
      <OfferSection />
      <ArtworkSection />
      <TypographySection />
      <ColoursSection />
      <PublishingSection />
    </div>
  );
}
