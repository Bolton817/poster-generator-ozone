"use client";

import React from "react";
import { PosterDocument } from "@/features/poster/schema";
import { getTemplateById } from "@/features/templates/registry";

export interface ReddingtonTemplateProps {
  document: PosterDocument;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reddington — Monday Old Classics & Sundowners Template
 *
 * Implements TDD Section III (Page 48) & Stage 09 Vertical Slice:
 * - Master dimensions: 1080 × 1350 px
 * - Warm sunset retro aesthetic with sun-disc / vinyl concentric anchor
 * - Monsieur Pierre DJ lineup block
 * - Ticket-style promotional offer panel with prominent "Excluding wine" qualification badge
 * - Conditional layout rebalancing when offers or optional fields are blank
 */
export function ReddingtonTemplate({
  document,
  className = "",
  style = {},
}: ReddingtonTemplateProps) {
  const { content, styling, assets } = document;

  // Resolve palette tokens from registry
  const templateDef = getTemplateById("reddington");
  const palette =
    templateDef?.palettePresets.find((p) => p.id === styling.paletteId) ||
    templateDef?.palettePresets[0] || {
      id: "sunset-ember",
      name: "Sunset Ember",
      primary: "#f97316",
      secondary: "#fdba74",
      accent: "#fbbf24",
      background: "#1c1917",
      text: "#fafaf9",
    };

  const focalPoint = styling.focalPoints?.background || { x: 0.5, y: 0.5 };

  // Parse qualification text (e.g., 'Excluding wine') if bundled in primaryOffer
  let primaryOfferText = content.primaryOffer;
  let qualificationText = content.secondaryOffer;
  if (!qualificationText && /excluding wine/i.test(primaryOfferText)) {
    primaryOfferText = primaryOfferText.replace(/,?\s*excluding wine\.?/i, "").trim();
    qualificationText = "Excluding wine";
  }

  const hasOffer = Boolean(primaryOfferText || qualificationText);

  return (
    <div
      className={`relative w-[1080px] h-[1350px] overflow-hidden select-none flex flex-col justify-between p-16 ${className}`}
      style={{
        backgroundColor: palette.background,
        color: palette.text,
        boxSizing: "border-box",
        ...style,
      }}
      data-testid="reddington-template-root"
    >
      {/* ----------------------------------------------------
          LAYER 1: Background Imagery & Sun-Disc Atmosphere
         ---------------------------------------------------- */}
      {assets.backgroundAssetId ? (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assets.backgroundAssetId}
            alt="Poster Background"
            className="w-full h-full object-cover"
            style={{
              objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
            }}
          />
          {/* Gradient Tint & Dark Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${palette.background}cc 0%, ${palette.background}88 40%, ${palette.background}f2 100%)`,
            }}
          />
        </div>
      ) : (
        /* Rich Radial Sunset / Golden Hour Gradient Fallback */
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${palette.primary}25 0%, ${palette.background} 75%)`,
          }}
        />
      )}

      {/* Sun Disc & Concentric Vinyl Grooves Anchor */}
      <div
        className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, ${palette.accent}20 0%, ${palette.primary}10 45%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      <div className="absolute top-[220px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-20">
        <svg viewBox="0 0 600 600" width="100%" height="100%">
          <circle cx="300" cy="300" r="280" fill="none" stroke={palette.primary} strokeWidth="1" strokeDasharray="6 4" />
          <circle cx="300" cy="300" r="230" fill="none" stroke={palette.primary} strokeWidth="1.5" />
          <circle cx="300" cy="300" r="170" fill="none" stroke={palette.accent} strokeWidth="1" />
          <circle cx="300" cy="300" r="110" fill="none" stroke={palette.primary} strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Subtle Analog Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#000000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        }}
      />

      {/* ----------------------------------------------------
          LAYER 2: Brand Header & Day Identity
         ---------------------------------------------------- */}
      <header
        className="relative z-10 flex items-center justify-between pb-8"
        style={{ borderBottom: `1px solid ${palette.primary}33` }}
      >
        <div className="flex items-center gap-5">
          {assets.logoAssetId ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 p-2 border border-white/10 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assets.logoAssetId} alt="Ozone Lounge Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl tracking-tighter"
              style={{
                backgroundColor: `${palette.primary}22`,
                border: `1.5px solid ${palette.primary}55`,
                color: palette.primary,
              }}
            >
              OZ
            </div>
          )}

          <div>
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: palette.primary,
              }}
              className="text-4xl tracking-wider block"
            >
              {content.venueName || "OZONE LOUNGE"}
            </span>
            <span
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              className="text-xs font-bold tracking-[0.25em] text-zinc-400 uppercase block"
            >
              {content.dayLabel ? `${content.dayLabel} Sundowners` : "Monday Sundowners"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="text-3xl tracking-wider block text-zinc-100"
          >
            {content.dayLabel ? content.dayLabel.toUpperCase() : "MONDAY"}
          </span>
          <span
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              color: palette.accent,
            }}
            className="text-xs font-bold tracking-widest uppercase block"
          >
            Reddington
          </span>
        </div>
      </header>

      {/* ----------------------------------------------------
          LAYER 3: Hero Headline & Performer Lineup
         ---------------------------------------------------- */}
      <main className="relative z-10 my-auto text-center flex flex-col items-center">
        {/* Curated Category Ribbon */}
        <div
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold tracking-[0.25em] uppercase mb-8 shadow-lg"
          style={{
            backgroundColor: `${palette.primary}18`,
            border: `1px solid ${palette.primary}44`,
            color: palette.accent,
          }}
        >
          <span>OLD CLASSICS &amp; SUNDOWNERS</span>
        </div>

        {/* Big Retro Display Title */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "96px",
            lineHeight: "0.92",
            letterSpacing: "0.02em",
            color: palette.primary,
          }}
          className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] mb-8 max-w-[940px] break-words uppercase"
        >
          {content.eventTitle || "OLD CLASSICS & SUNDOWNERS"}
        </h1>

        {/* Lineup Panel: Monsieur Pierre & Guest Performers */}
        {(content.djNames.length > 0 || content.hostNames.length > 0) && (
          <div className="flex flex-col items-center gap-3 mt-2">
            <div className="flex items-center gap-4">
              <div className="h-px w-16" style={{ backgroundColor: `${palette.primary}44` }} />
              <span
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                className="text-xs font-bold tracking-[0.25em] text-zinc-400 uppercase"
              >
                SPECIAL GUEST &amp; SELECTOR
              </span>
              <div className="h-px w-16" style={{ backgroundColor: `${palette.primary}44` }} />
            </div>

            {content.djNames.length > 0 && (
              <div
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                className="text-5xl tracking-wide text-zinc-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              >
                {content.djNames.join(" & ")}
              </div>
            )}

            {content.hostNames.length > 0 && (
              <div
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-sm font-medium text-zinc-300 tracking-wider"
              >
                Hosted by <strong className="text-zinc-100">{content.hostNames.join(" & ")}</strong>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            LAYER 4: Ticket / Ribbon Promotional Offer Card
            (Includes mandatory "Excluding wine" qualification badge)
           ---------------------------------------------------- */}
        {hasOffer && (
          <div
            className="mt-12 w-full max-w-[800px] p-8 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-md"
            style={{
              backgroundColor: "rgba(18, 14, 12, 0.90)",
              border: `1.5px solid ${palette.primary}55`,
            }}
          >
            {/* Ticket Notches */}
            <div
              className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
              style={{ backgroundColor: palette.background }}
            />
            <div
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
              style={{ backgroundColor: palette.background }}
            />

            <div className="flex items-center justify-between gap-6 px-4">
              <div className="text-left flex-1 min-w-0">
                <span
                  style={{
                    fontFamily: "'Source Sans 3', sans-serif",
                    color: palette.accent,
                  }}
                  className="text-xs font-bold uppercase tracking-[0.2em] block mb-1"
                >
                  HAPPY HOUR PROMOTION
                </span>
                <span
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-2xl font-bold text-zinc-100 block truncate"
                >
                  {primaryOfferText || "Discounts on all drinks"}
                </span>
              </div>

              {/* High-Contrast Qualification Badge ("Excluding wine") */}
              {qualificationText && (
                <div
                  className="px-5 py-2.5 rounded-xl shrink-0 flex items-center justify-center shadow-md"
                  style={{
                    backgroundColor: `${palette.primary}25`,
                    border: `1.5px solid ${palette.primary}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Source Sans 3', sans-serif",
                      color: palette.secondary,
                    }}
                    className="text-sm font-extrabold uppercase tracking-widest whitespace-nowrap"
                  >
                    {qualificationText}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ----------------------------------------------------
          LAYER 5: Practical Logistics Safe Footer
         ---------------------------------------------------- */}
      <footer
        className="relative z-10 flex items-center justify-between pt-8 text-xs text-zinc-400"
        style={{ borderTop: `1px solid ${palette.primary}33` }}
      >
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
          {content.dateText && <span className="font-semibold text-zinc-200">{content.dateText}</span>}
          {content.dateText && content.startTime && <span> · </span>}
          {content.startTime && <span>{content.startTime}</span>}
          {!content.dateText && !content.startTime && (
            <span className="font-semibold text-zinc-300">Every Monday · 4:00 PM Till Late</span>
          )}
        </div>

        <div style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="font-semibold text-zinc-200">{content.venueName || "Ozone Lounge"}</span>
          {content.locationText && <span> · {content.locationText}</span>}
          {content.contactText && <span> · {content.contactText}</span>}
          {content.socialHandle && (
            <span style={{ color: palette.accent }} className="font-medium ml-1">
              {content.socialHandle}
            </span>
          )}
        </div>

        <div
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            color: palette.primary,
          }}
          className="text-[11px] font-bold tracking-widest uppercase"
        >
          1080 × 1350 MASTER
        </div>
      </footer>
    </div>
  );
}
