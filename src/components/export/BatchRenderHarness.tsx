"use client";

import React, { forwardRef } from "react";
import { PosterDocument } from "@/features/poster/schema";
import { getTemplateRenderer } from "@/features/templates/renderers";
import { POSTER_MASTER_WIDTH, POSTER_MASTER_HEIGHT } from "@/features/canvas/constants";

export interface BatchRenderHarnessProps {
  document: PosterDocument | null;
}

/**
 * Off-screen harness for batch poster rendering.
 * Renders an unscaled master canvas (1080x1350 px) outside the visible viewport
 * so that html-to-image can capture crisp master graphics without altering the live UI.
 */
export const BatchRenderHarness = forwardRef<HTMLDivElement, BatchRenderHarnessProps>(
  function BatchRenderHarness({ document }, ref) {
    if (!document) return null;

    const Renderer = getTemplateRenderer(document.templateId);

    return (
      <div
        style={{
          position: "fixed",
          left: "-10000px",
          top: "0",
          width: `${POSTER_MASTER_WIDTH}px`,
          height: `${POSTER_MASTER_HEIGHT}px`,
          zIndex: -9999,
          pointerEvents: "none",
          visibility: "visible",
          overflow: "hidden",
        }}
        aria-hidden="true"
        data-export-root="true"
      >
        <div
          ref={ref}
          id="ozone-batch-export-node"
          style={{
            position: "relative",
            width: `${POSTER_MASTER_WIDTH}px`,
            height: `${POSTER_MASTER_HEIGHT}px`,
            overflow: "hidden",
          }}
        >
          <Renderer document={document} />
        </div>
      </div>
    );
  }
);
