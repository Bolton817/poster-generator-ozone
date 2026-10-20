/**
 * Poster Editor Validation & Non-blocking Character Guidance Rules
 *
 * Implements TDD Stage 08 (Page 74):
 * - Live length warnings that avoid silent copy truncation
 * - Friday empty offer guidance
 * - Focal point bounds checking
 */

import { PosterDocument } from "../poster/schema";
import { ValidationWarning } from "./types";

export const TITLE_WARNING_THRESHOLD = 45;
export const LINEUP_NAME_WARNING_THRESHOLD = 28;
export const OFFER_WARNING_THRESHOLD = 60;

/**
 * Validates a PosterDocument and generates real-time non-blocking warnings.
 */
export function validatePosterDocument(doc: PosterDocument): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // 1. Event Title Guidance
  const title = doc.content.eventTitle?.trim() || "";
  if (!title) {
    warnings.push({
      field: "eventTitle",
      message: "Event title is empty. A prominent title is recommended.",
      severity: "warning",
    });
  } else if (title.length > TITLE_WARNING_THRESHOLD) {
    warnings.push({
      field: "eventTitle",
      message: `Event title (${title.length} chars) exceeds recommended ${TITLE_WARNING_THRESHOLD} chars and may wrap across multiple lines.`,
      severity: "warning",
    });
  }

  // 2. Lineup Name Guidance
  doc.content.djNames.forEach((name, i) => {
    if (name.length > LINEUP_NAME_WARNING_THRESHOLD) {
      warnings.push({
        field: `djNames[${i}]`,
        message: `DJ "${name}" exceeds ${LINEUP_NAME_WARNING_THRESHOLD} characters and may wrap.`,
        severity: "warning",
      });
    }
  });

  doc.content.hostNames.forEach((name, i) => {
    if (name.length > LINEUP_NAME_WARNING_THRESHOLD) {
      warnings.push({
        field: `hostNames[${i}]`,
        message: `Host "${name}" exceeds ${LINEUP_NAME_WARNING_THRESHOLD} characters and may wrap.`,
        severity: "warning",
      });
    }
  });

  // 3. Offer Copy Guidance
  if (doc.content.primaryOffer && doc.content.primaryOffer.length > OFFER_WARNING_THRESHOLD) {
    warnings.push({
      field: "primaryOffer",
      message: `Primary offer (${doc.content.primaryOffer.length} chars) exceeds recommended ${OFFER_WARNING_THRESHOLD} chars.`,
      severity: "warning",
    });
  }

  if (doc.content.secondaryOffer && doc.content.secondaryOffer.length > OFFER_WARNING_THRESHOLD) {
    warnings.push({
      field: "secondaryOffer",
      message: `Secondary offer (${doc.content.secondaryOffer.length} chars) exceeds recommended ${OFFER_WARNING_THRESHOLD} chars.`,
      severity: "warning",
    });
  }

  // 4. Friday Special Offer Notice (Decision 06 & TDD page 52)
  if (doc.templateId === "lothbrok") {
    if (!doc.content.primaryOffer && !doc.content.secondaryOffer) {
      warnings.push({
        field: "offer",
        message: "Flight Fridays is offer-free by default per the brief. Any custom promotion entered will render dynamically.",
        severity: "info",
      });
    }
  }

  // 5. Focal Point Bounds
  if (doc.styling.focalPoints) {
    Object.entries(doc.styling.focalPoints).forEach(([slot, fp]) => {
      if (fp.x < 0 || fp.x > 1 || fp.y < 0 || fp.y > 1) {
        warnings.push({
          field: `focalPoints.${slot}`,
          message: `Focal point for ${slot} (${fp.x}, ${fp.y}) is outside valid normalized range [0, 1].`,
          severity: "warning",
        });
      }
    });
  }

  return warnings;
}
