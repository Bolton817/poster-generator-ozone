"use client";

import React from "react";
import { PosterDocument } from "@/features/poster/schema";
import { getTemplateById } from "@/features/templates/registry";

export interface SaintTemplateProps {
  document: PosterDocument;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Saint — Tuesday African Night / Afrobeat Template
 *
 * Implements Blueprint Section 4.3 & Stage 13:
 * - Master dimensions: 1080 × 1350 px (strict 4:5 aspect ratio)
 * - Bold, contemporary African-night and Afrobeat energy
 * - Asymmetrical geometric layout with chevron and diamond pattern rhythms
 * - Layout options: "geometric-frame" (angular framed hero) vs "pattern-pulse" (full-bleed pulse)
 * - Tuesday Headliners: DJ Neb & DVJ Jojez
 * - Tuesday Offer: "Discounts on beer buckets and cocktails."
 * - Strict conditional rendering and layout rebalancing
 */
export function SaintTemplate({
  document,
  className = "",
  style = {},
}: SaintTemplateProps) {
  const { content, styling, assets } = document;

  // Resolve palette tokens from registry
  const templateDef = getTemplateById("saint");
  const palette =
    templateDef?.palettePresets.find((p) => p.id === styling.paletteId) ||
    templateDef?.palettePresets[0] || {
      id: "saffron-ink",
      name: "Saffron & Ink",
      primary: "#eab308",
      secondary: "#ca8a04",
      accent: "#f59e0b",
      background: "#0f172a",
      text: "#f8fafc",
    };

  // Typography font family resolution
  const isGroove = styling.typographyPresetId === "afro-groove";
  const displayFontFamily = isGroove
    ? "'Source Sans 3', sans-serif"
    : "'Bebas Neue', 'Source Sans 3', sans-serif";
  const bodyFontFamily = "'Inter', sans-serif";

  // Layout & Pattern Density
  const layoutOptionId = styling.layoutOptionId || "geometric-frame";
  const isGeometricFrame = layoutOptionId === "geometric-frame";
  const density = styling.decorationOptions?.patternDensity || "medium";
  const patternOpacity =
    density === "bold" ? 0.28 : density === "subtle" ? 0.08 : 0.16;

  const focalPoint = styling.focalPoints?.background || { x: 0.5, y: 0.5 };

  // Performers resolution
  const djList = content.djNames.length > 0 ? content.djNames : ["DJ Neb", "DVJ Jojez"];
  const allPerformers = [...djList, ...content.hostNames];

  // Offer resolution
  const hasOffer = Boolean(
    content.primaryOffer.trim() || content.secondaryOffer.trim()
  );

  return (
    <div
      className={`relative w-[1080px] h-[1350px] overflow-hidden select-none flex flex-col justify-between p-16 ${className}`}
      style={{
        backgroundColor: palette.background,
        color: palette.text,
        boxSizing: "border-box",
        fontFamily: bodyFontFamily,
        ...style,
      }}
      data-testid="saint-template-root"
    >
      {/* ----------------------------------------------------
          LAYER 1: SVG Geometric Pattern Defs & Background Atmosphere
         ---------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* African Diamond/Chevron Geometric Pattern */}
          <pattern
            id="saintAfroPattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 30 L 30 0 L 60 30 L 30 60 Z"
              fill="none"
              stroke={palette.primary}
              strokeOpacity={patternOpacity}
              strokeWidth="2"
            />
            <path
              d="M 30 30 L 60 0 M 0 60 L 30 30"
              stroke={palette.accent}
              strokeOpacity={patternOpacity * 0.75}
              strokeWidth="1.5"
            />
            <polygon
              points="30,22 38,30 30,38 22,30"
              fill={palette.secondary}
              fillOpacity={patternOpacity * 0.5}
            />
          </pattern>

          {/* Asymmetric Diagonal Glow */}
          <linearGradient
            id="saintDiagonalBeam"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.primary} stopOpacity="0.3" />
            <stop offset="40%" stopColor={palette.secondary} stopOpacity="0.12" />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </linearGradient>

          {/* Title Gradient */}
          <linearGradient
            id="saintTitleGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor={palette.primary} />
            <stop offset="100%" stopColor={palette.secondary} />
          </linearGradient>
        </defs>

        {/* Full-Canvas Pattern Fill */}
        <rect width="100%" height="100%" fill="url(#saintAfroPattern)" />

        {/* Dynamic Asymmetric Geometric Angles */}
        <path
          d="M 0 0 L 680 0 L 400 1350 L 0 1350 Z"
          fill="url(#saintDiagonalBeam)"
        />
        <polygon
          points="880,0 1080,0 1080,450"
          fill={palette.primary}
          fillOpacity="0.07"
        />
        <polygon
          points="0,950 280,1350 0,1350"
          fill={palette.secondary}
          fillOpacity="0.08"
        />
      </svg>

      {/* ----------------------------------------------------
          LAYER 2: Hero Performer / Crowd Imagery
         ---------------------------------------------------- */}
      {isGeometricFrame ? (
        /* Layout Treatment A: Geometric Frame (Angular Layered Container) */
        <div
          className="absolute z-10 overflow-hidden"
          style={{
            top: "370px",
            right: "72px",
            width: "560px",
            height: "460px",
          }}
        >
          {/* Offset Shadow / Accent Frame */}
          <div
            className="absolute -inset-2 rounded-2xl transform rotate-2"
            style={{
              backgroundColor: `${palette.secondary}22`,
              border: `2px dashed ${palette.primary}55`,
            }}
          />
          {/* Main Photo Frame */}
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden border-2 shadow-2xl"
            style={{
              borderColor: `${palette.primary}88`,
              backgroundColor: `${palette.background}dd`,
            }}
          >
            {assets.backgroundAssetId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={assets.backgroundAssetId}
                alt="Performer"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
                }}
              />
            ) : (
              /* High-Energy Fallback Rhythm Graphic */
              <div
                className="w-full h-full flex flex-col items-center justify-center p-8 relative"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${palette.primary}30 0%, ${palette.background} 90%)`,
                }}
              >
                <div
                  className="w-36 h-36 rounded-full border-4 flex items-center justify-center animate-pulse"
                  style={{
                    borderColor: `${palette.primary}66`,
                    backgroundColor: `${palette.primary}15`,
                  }}
                >
                  <span
                    className="text-4xl font-bold tracking-widest"
                    style={{ color: palette.primary, fontFamily: displayFontFamily }}
                  >
                    AFRO
                  </span>
                </div>
                <div className="flex gap-2 mt-6">
                  <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: palette.primary }} />
                  <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: palette.secondary }} />
                  <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: palette.accent }} />
                </div>
              </div>
            )}
            {/* Inner Vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, transparent 50%, ${palette.background}cc 100%)`,
              }}
            />
          </div>
        </div>
      ) : (
        /* Layout Treatment B: Pattern Pulse (Full-Bleed with Atmospheric Mask) */
        assets.backgroundAssetId && (
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.backgroundAssetId}
              alt="Poster Atmosphere"
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
              style={{
                objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${palette.background}ee 0%, ${palette.background}99 50%, ${palette.background}f5 100%)`,
              }}
            />
          </div>
        )
      )}

      {/* ----------------------------------------------------
          LAYER 3: Top Navigation & Brand Header
         ---------------------------------------------------- */}
      <header className="relative z-20 flex items-center justify-between border-b pb-6" style={{ borderColor: `${palette.primary}33` }}>
        {/* Brand identity */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl shadow-lg border"
            style={{
              backgroundColor: `${palette.primary}20`,
              borderColor: `${palette.primary}60`,
              color: palette.primary,
            }}
          >
            OZ
          </div>
          <div>
            <div className="text-xl font-black tracking-widest leading-none text-white uppercase">
              OZONE LOUNGE
            </div>
            <div
              className="text-xs font-bold tracking-[0.25em] uppercase mt-1"
              style={{ color: palette.accent }}
            >
              PREMIUM NIGHTLIFE • KILIMANI
            </div>
          </div>
        </div>

        {/* Day & Genre Badge */}
        <div className="flex items-center gap-3">
          <div
            className="px-4 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase border flex items-center gap-2"
            style={{
              backgroundColor: `${palette.primary}18`,
              borderColor: `${palette.primary}50`,
              color: palette.primary,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: palette.primary }} />
            <span>{content.dayLabel.toUpperCase()} NIGHT</span>
          </div>

          <div
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase bg-white/5 border border-white/10 text-slate-300"
          >
            SAINT
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------
          LAYER 4: Main Headline & Afrobeat Title Section
         ---------------------------------------------------- */}
      <section className="relative z-20 my-auto flex flex-col justify-center">
        {/* Genre Accent Tag */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-0.5 w-12" style={{ backgroundColor: palette.primary }} />
          <span
            className="text-sm font-black tracking-[0.3em] uppercase"
            style={{ color: palette.accent }}
          >
            AFROBEAT • AMAPIANO • DANCEHALL
          </span>
        </div>

        {/* Main Event Title */}
        <h1
          className="text-[108px] font-black uppercase tracking-tight leading-[0.92] drop-shadow-2xl"
          style={{
            fontFamily: displayFontFamily,
            color: palette.text,
          }}
        >
          {content.eventTitle ? (
            content.eventTitle.replace(/\s*\(afro\)\s*/i, "")
          ) : (
            "AFRICAN NIGHT"
          )}
        </h1>

        {/* Afro Subtitle Pill with Bracket Accents */}
        <div className="flex items-center gap-4 mt-3">
          <div
            className="inline-flex items-center gap-3 px-6 py-2 rounded-xl border shadow-lg"
            style={{
              backgroundColor: `${palette.primary}20`,
              borderColor: palette.primary,
            }}
          >
            <span style={{ color: palette.secondary }} className="font-bold text-lg">&lt;</span>
            <span
              className="text-2xl font-black tracking-[0.25em] uppercase text-white"
              style={{ fontFamily: displayFontFamily }}
            >
              AFRO
            </span>
            <span style={{ color: palette.secondary }} className="font-bold text-lg">&gt;</span>
          </div>

          <span className="text-sm font-semibold tracking-wider uppercase text-slate-400">
            EVERY TUESDAY • VIBRANT CLUB EXPERIENCE
          </span>
        </div>

        {/* ----------------------------------------------------
            LAYER 5: Featured Performer Lineup Block
           ---------------------------------------------------- */}
        <div
          className="mt-12 p-6 rounded-2xl border backdrop-blur-md max-w-[560px]"
          style={{
            backgroundColor: `${palette.background}cc`,
            borderColor: `${palette.primary}40`,
            boxShadow: `0 20px 40px -15px ${palette.background}`,
          }}
        >
          <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: `${palette.primary}25` }}>
            <span
              className="text-xs font-black tracking-[0.2em] uppercase"
              style={{ color: palette.primary }}
            >
              RESIDENT AFROBEAT SELECTORS
            </span>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              LIVE ON DECKS
            </span>
          </div>

          {/* Performer Names */}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {allPerformers.map((performer, idx) => (
              <React.Fragment key={performer + idx}>
                <span
                  className="text-4xl font-black uppercase tracking-wider text-white"
                  style={{ fontFamily: displayFontFamily }}
                >
                  {performer}
                </span>
                {idx < allPerformers.length - 1 && (
                  <span
                    className="text-2xl font-bold"
                    style={{ color: palette.primary }}
                  >
                    &amp;
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          {content.customLines.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300 font-medium">
              {content.customLines.join(" • ")}
            </div>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 6: Promotional Offer & Beverage Special Card
         ---------------------------------------------------- */}
      {hasOffer && (
        <section
          className="relative z-20 mb-6 p-5 rounded-2xl border flex items-center justify-between shadow-2xl"
          style={{
            backgroundColor: `${palette.primary}12`,
            borderColor: `${palette.primary}55`,
          }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0"
              style={{
                backgroundColor: palette.primary,
                color: palette.background,
              }}
            >
              ★
            </div>
            <div className="min-w-0">
              <div
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: palette.primary }}
              >
                TUESDAY BEVERAGE SPECIAL
              </div>
              <div className="text-xl font-black text-white truncate tracking-wide mt-0.5">
                {content.primaryOffer || "Discounts on beer buckets and cocktails."}
              </div>
              {content.secondaryOffer && (
                <div className="text-xs text-slate-300 mt-0.5 font-medium">
                  {content.secondaryOffer}
                </div>
              )}
            </div>
          </div>

          <div
            className="hidden sm:flex px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border shrink-0"
            style={{
              backgroundColor: `${palette.secondary}30`,
              borderColor: palette.secondary,
              color: palette.text,
            }}
          >
            ALL NIGHT LONG
          </div>
        </section>
      )}

      {/* ----------------------------------------------------
          LAYER 7: Footer Logistics & Venue Info
         ---------------------------------------------------- */}
      <footer
        className="relative z-20 pt-6 border-t flex items-center justify-between text-xs"
        style={{ borderColor: `${palette.primary}33` }}
      >
        {/* Logistics: Date & Time */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SCHEDULE
            </span>
            <span className="text-sm font-black text-white">
              {content.dateText || "EVERY TUESDAY"}
            </span>
          </div>

          <div className="h-6 w-px bg-white/20" />

          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              DOORS OPEN
            </span>
            <span className="text-sm font-black text-white">
              {content.startTime || "6:00 PM TILL LATE"}
            </span>
          </div>
        </div>

        {/* Venue, Contact & Social Handle */}
        <div className="flex items-center gap-5 text-right">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LOCATION
            </span>
            <span className="text-sm font-black text-white">
              {content.venueName || "OZONE LOUNGE"}
              {content.locationText ? ` • ${content.locationText}` : ""}
            </span>
          </div>

          <div
            className="px-4 py-2 rounded-xl font-mono text-xs font-black tracking-wider uppercase border"
            style={{
              backgroundColor: `${palette.primary}18`,
              borderColor: `${palette.primary}40`,
              color: palette.primary,
            }}
          >
            {content.socialHandle || "@ozonelounge"}
          </div>
        </div>
      </footer>
    </div>
  );
}
