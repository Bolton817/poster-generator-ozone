/**
 * Pre-Export Inspection Checklist Logic
 *
 * Implements Production Decision Register:
 * - Decision 04: Date & Start Time optional with preflight advisory warnings
 * - Decision 05: Venue / Location / Contact conditional rendering
 * - Decision 06: Friday Flight Fridays offer-free policy
 * - TDD Section III / Stage 09: Reddington wine exclusion qualification
 */

import { PosterDocument } from "../poster/schema";
import { ChecklistItem, PreExportEvaluation } from "./types";

export function evaluatePreExportChecklist(
  document: PosterDocument
): PreExportEvaluation {
  const { content, templateId } = document;
  const items: ChecklistItem[] = [];

  // 1. Event Title
  if (content.eventTitle && content.eventTitle.trim().length > 0) {
    items.push({
      id: "title",
      label: "Event Title",
      status: "ready",
      detail: content.eventTitle,
    });
  } else {
    items.push({
      id: "title",
      label: "Event Title",
      status: "warning",
      detail: "Title is empty. Template default may be displayed.",
    });
  }

  // 2. Performer Lineup
  const allPerformers = [...content.djNames, ...content.hostNames];
  if (allPerformers.length > 0) {
    items.push({
      id: "lineup",
      label: "Performer Lineup",
      status: "ready",
      detail: allPerformers.join(" & "),
    });
  } else {
    items.push({
      id: "lineup",
      label: "Performer Lineup",
      status: "warning",
      detail: "No DJs or hosts configured for this event.",
    });
  }

  // 3. Promotional Offer & Qualifications
  const isFriday =
    templateId === "lothbrok" || content.dayLabel.toLowerCase() === "friday";
  const hasOffer = Boolean(
    content.primaryOffer.trim() || content.secondaryOffer.trim()
  );

  if (isFriday && !hasOffer) {
    items.push({
      id: "offer",
      label: "Promotional Offer",
      status: "ready",
      detail: "Flight Fridays policy: offer-free composition by default.",
    });
  } else if (hasOffer) {
    const isReddington =
      templateId === "reddington" ||
      content.dayLabel.toLowerCase() === "monday";
    const specifiesWineExclusion =
      /excluding wine/i.test(content.primaryOffer) ||
      /excluding wine/i.test(content.secondaryOffer);

    if (isReddington && specifiesWineExclusion) {
      items.push({
        id: "offer",
        label: "Promotional Offer",
        status: "ready",
        detail: `${content.primaryOffer} (High-contrast "Excluding wine" pill active)`,
      });
    } else {
      items.push({
        id: "offer",
        label: "Promotional Offer",
        status: "ready",
        detail: content.primaryOffer || content.secondaryOffer,
      });
    }
  } else {
    items.push({
      id: "offer",
      label: "Promotional Offer",
      status: "info",
      detail: "No offer configured. Composition will rebalance without offer card.",
    });
  }

  // 4. Logistics: Event Date (Decision 04)
  if (content.dateText && content.dateText.trim().length > 0) {
    items.push({
      id: "date",
      label: "Event Date",
      status: "ready",
      detail: content.dateText,
    });
  } else {
    items.push({
      id: "date",
      label: "Event Date",
      status: "warning",
      detail: "Date omitted. Poster will show recurring weekday schedule.",
    });
  }

  // 5. Logistics: Start Time (Decision 04)
  if (content.startTime && content.startTime.trim().length > 0) {
    items.push({
      id: "time",
      label: "Start Time",
      status: "ready",
      detail: content.startTime,
    });
  } else {
    items.push({
      id: "time",
      label: "Start Time",
      status: "warning",
      detail: "Time omitted. Poster will show template default schedule.",
    });
  }

  // 6. Venue & Social Handle (Decision 05)
  if (content.venueName && content.venueName.trim().length > 0) {
    items.push({
      id: "venue",
      label: "Venue Name",
      status: "ready",
      detail: content.venueName,
    });
  } else {
    items.push({
      id: "venue",
      label: "Venue Name",
      status: "info",
      detail: "Venue name omitted.",
    });
  }

  const readyCount = items.filter((i) => i.status === "ready").length;
  const warningCount = items.filter((i) => i.status === "warning").length;

  return {
    items,
    isReadyForExport: true, // Non-blocking: operators can export even with advisory notices
    readyCount,
    warningCount,
  };
}
