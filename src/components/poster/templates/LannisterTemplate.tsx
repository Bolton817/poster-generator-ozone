"use client";

import React from "react";
import { PosterDocument } from "@/features/poster/schema";
import { getTemplateById } from "@/features/templates/registry";

export interface LannisterTemplateProps {
  document: PosterDocument;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Lannister — Wednesday Groovy Wednesday / Disco / Dual-offer Template
 *
 * Implements Blueprint Section 4.4 & Stage 14:
 * - Master dimensions: 1080 × 1350 px (strict 4:5 aspect ratio)
 * - Visually loud midweek disco party aesthetic with neon glow and rhythm
 * - Dual-offer layout: Strictly separates "Free koroga chicken on the house" (primary)
 *   from bottle/cognac/beer-bucket discounts (secondary) — never merged into one paragraph.
 * - High-contrast DJ panel for DJ Donben & DJ Vin
 * - Layout options: "neon-glow-center" (centered disco spotlight) vs "separated-offer-card" (asymmetric split)
 * - Glow strength presets: "low" | "medium" | "high"
 * - Dynamic layout rebalancing when offers or event logistics are empty
 */
export function LannisterTemplate({
  document,
  className = "",
  style = {},
}: LannisterTemplateProps) {
  const { content, styling, assets } = document;

  // Resolve palette tokens from registry
  const templateDef = getTemplateById("lannister");
  const palette =
    templateDef?.palettePresets.find((p) => p.id === styling.paletteId) ||
    templateDef?.palettePresets[0] || {
      id: "ultraviolet-club",
      name: "Ultraviolet Club",
      primary: "#a855f7",
      secondary: "#c084fc",
      accent: "#e879f9",
      background: "#090514",
      text: "#fdf4ff",
    };

  // Resolve typography fonts
  const isNeonPunch = styling.typographyPresetId === "neon-punch";
  const displayFontFamily = isNeonPunch
    ? "'Source Sans 3', sans-serif"
    : "'Bebas Neue', 'Source Sans 3', sans-serif";
  const bodyFontFamily = "'Inter', sans-serif";
  const labelFontFamily = isNeonPunch
    ? "'Bebas Neue', 'Source Sans 3', sans-serif"
    : "'Inter', sans-serif";

  // Layout & Glow Tokens
  const layoutOptionId = styling.layoutOptionId || "neon-glow-center";
  const isCentered = layoutOptionId === "neon-glow-center";

  const glowStrength = styling.decorationOptions?.glowStrength || "high";
  const glowConfig = {
    high: {
      textShadow: `0 0 20px ${palette.primary}, 0 0 40px ${palette.accent}`,
      boxGlow: `0 0 30px ${palette.primary}44`,
      spotlightOpacity: 0.38,
      beamOpacity: 0.28,
      tubeOpacity: 0.85,
    },
    medium: {
      textShadow: `0 0 12px ${palette.primary}, 0 0 24px ${palette.accent}88`,
      boxGlow: `0 0 18px ${palette.primary}33`,
      spotlightOpacity: 0.24,
      beamOpacity: 0.16,
      tubeOpacity: 0.6,
    },
    low: {
      textShadow: `0 0 6px ${palette.primary}aa`,
      boxGlow: `0 0 10px ${palette.primary}22`,
      spotlightOpacity: 0.14,
      beamOpacity: 0.08,
      tubeOpacity: 0.35,
    },
  }[glowStrength as "high" | "medium" | "low"] || {
    textShadow: `0 0 20px ${palette.primary}`,
    boxGlow: `0 0 30px ${palette.primary}44`,
    spotlightOpacity: 0.35,
    beamOpacity: 0.25,
    tubeOpacity: 0.8,
  };

  const focalPoint = styling.focalPoints?.background || { x: 0.5, y: 0.5 };

  // Performers resolution
  const djList = content.djNames.length > 0 ? content.djNames : ["DJ Donben", "DJ Vin"];
  const allPerformers = [...djList, ...content.hostNames];

  // Offers resolution
  const hasPrimaryOffer = Boolean(content.primaryOffer?.trim());
  const hasSecondaryOffer = Boolean(content.secondaryOffer?.trim());
  const hasAnyOffer = hasPrimaryOffer || hasSecondaryOffer;

  // Logistics resolution
  const hasDateTime = Boolean(content.dateText?.trim() || content.startTime?.trim());
  const hasLocationOrContact = Boolean(
    content.locationText?.trim() || content.contactText?.trim()
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
      data-testid="lannister-template-root"
    >
      {/* ----------------------------------------------------
          LAYER 1: SVG Disco Atmosphere, Spotlight & Beams
         ---------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle Retro Disco Grid Pattern */}
          <pattern
            id="lannisterDiscoGrid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 40 L 40 40 M 40 0 L 40 40"
              fill="none"
              stroke={palette.primary}
              strokeOpacity="0.07"
              strokeWidth="1"
            />
          </pattern>

          {/* Central Disco Spotlight Cone */}
          <linearGradient
            id="lannisterSpotCone"
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.accent} stopOpacity={glowConfig.spotlightOpacity} />
            <stop offset="45%" stopColor={palette.primary} stopOpacity={glowConfig.spotlightOpacity * 0.4} />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </linearGradient>

          {/* Title Gradient */}
          <linearGradient
            id="lannisterTitleGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor={palette.accent} />
            <stop offset="100%" stopColor={palette.primary} />
          </linearGradient>

          {/* Golden Badge Gradient for Primary Food Offer */}
          <linearGradient
            id="lannisterGoldBadge"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {/* Disco Grid Floor Background */}
        <rect width="100%" height="100%" fill="url(#lannisterDiscoGrid)" />

        {/* Radial Glow Orb from Top */}
        <circle
          cx={isCentered ? "540" : "360"}
          cy="120"
          r="420"
          fill={palette.primary}
          fillOpacity={glowConfig.spotlightOpacity * 0.45}
        />
        <circle
          cx={isCentered ? "540" : "360"}
          cy="120"
          r="220"
          fill={palette.accent}
          fillOpacity={glowConfig.spotlightOpacity * 0.55}
        />

        {/* Central Spotlight Cone */}
        <polygon
          points={
            isCentered
              ? "480,0 600,0 1020,1350 60,1350"
              : "300,0 420,0 840,1350 0,1350"
          }
          fill="url(#lannisterSpotCone)"
        />

        {/* Radiant Laser Beams / Light Trails */}
        <line
          x1={isCentered ? "540" : "360"}
          y1="80"
          x2="40"
          y2="760"
          stroke={palette.secondary}
          strokeOpacity={glowConfig.beamOpacity}
          strokeWidth="2.5"
        />
        <line
          x1={isCentered ? "540" : "360"}
          y1="80"
          x2="1040"
          y2="760"
          stroke={palette.secondary}
          strokeOpacity={glowConfig.beamOpacity}
          strokeWidth="2.5"
        />
        <line
          x1={isCentered ? "540" : "360"}
          y1="80"
          x2="0"
          y2="1050"
          stroke={palette.accent}
          strokeOpacity={glowConfig.beamOpacity * 0.8}
          strokeWidth="2"
        />
        <line
          x1={isCentered ? "540" : "360"}
          y1="80"
          x2="1080"
          y2="1050"
          stroke={palette.accent}
          strokeOpacity={glowConfig.beamOpacity * 0.8}
          strokeWidth="2"
        />

        {/* Neon Perimeter Frame Tubes */}
        <rect
          x="44"
          y="44"
          width="992"
          height="1262"
          rx="24"
          fill="none"
          stroke={palette.primary}
          strokeOpacity={glowConfig.tubeOpacity * 0.4}
          strokeWidth="2"
        />
        <rect
          x="52"
          y="52"
          width="976"
          height="1246"
          rx="20"
          fill="none"
          stroke={palette.accent}
          strokeOpacity={glowConfig.tubeOpacity * 0.25}
          strokeWidth="1.2"
        />

        {/* Corner Neon Light Accents */}
        <path
          d="M 44 110 L 44 44 L 110 44"
          fill="none"
          stroke={palette.accent}
          strokeOpacity={glowConfig.tubeOpacity}
          strokeWidth="4"
        />
        <path
          d="M 970 44 L 1036 44 L 1036 110"
          fill="none"
          stroke={palette.accent}
          strokeOpacity={glowConfig.tubeOpacity}
          strokeWidth="4"
        />
        <path
          d="M 44 1240 L 44 1306 L 110 1306"
          fill="none"
          stroke={palette.accent}
          strokeOpacity={glowConfig.tubeOpacity}
          strokeWidth="4"
        />
        <path
          d="M 970 1306 L 1036 1306 L 1036 1240"
          fill="none"
          stroke={palette.accent}
          strokeOpacity={glowConfig.tubeOpacity}
          strokeWidth="4"
        />
      </svg>

      {/* ----------------------------------------------------
          LAYER 2: Hero Performer / Crowd Imagery
         ---------------------------------------------------- */}
      {assets.backgroundAssetId && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assets.backgroundAssetId}
            alt="Event Atmosphere"
            className="w-full h-full object-cover"
            style={{
              objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
              opacity: 0.28,
              mixBlendMode: "luminosity",
            }}
          />
          {/* Vignette & Radial Spotlight Blend Over Photo */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 30%, transparent 20%, ${palette.background}dd 75%, ${palette.background} 100%)`,
            }}
          />
        </div>
      )}

      {/* ----------------------------------------------------
          LAYER 3: Top Header (Branding, Day Badge, Date/Time)
         ---------------------------------------------------- */}
      <header className="relative z-10 flex items-center justify-between">
        {/* Ozone Lounge Branding */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border"
            style={{
              backgroundColor: `${palette.primary}22`,
              borderColor: `${palette.primary}88`,
              color: palette.accent,
              boxShadow: glowConfig.boxGlow,
            }}
          >
            OZ
          </div>
          <div>
            <h2
              className="text-2xl font-black tracking-widest uppercase leading-none"
              style={{ color: "#ffffff", letterSpacing: "0.15em" }}
            >
              {content.venueName || "OZONE LOUNGE"}
            </h2>
            <p
              className="text-xs font-bold tracking-widest uppercase mt-1"
              style={{ color: palette.secondary, letterSpacing: "0.22em" }}
            >
              WEDNESDAY DISCO
            </p>
          </div>
        </div>

        {/* Day Pill & Date/Time Badge */}
        <div className="flex flex-col items-end gap-1.5">
          <div
            className="px-5 py-2 rounded-full border text-xs font-black tracking-widest uppercase flex items-center gap-2"
            style={{
              backgroundColor: `${palette.primary}22`,
              borderColor: palette.accent,
              color: palette.text,
              boxShadow: glowConfig.boxGlow,
              fontFamily: labelFontFamily,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: palette.accent }}
            />
            {content.dayLabel || "WEDNESDAY"} DISCO PARTY
          </div>

          {hasDateTime && (
            <div
              className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5"
              style={{ color: palette.secondary }}
            >
              {[content.dateText, content.startTime].filter(Boolean).join(" • ")}
            </div>
          )}
        </div>
      </header>

      {/* ----------------------------------------------------
          LAYER 4: Center Visual Focal: Disco Motif & Oversized Title
         ---------------------------------------------------- */}
      <section className="relative z-10 flex flex-col items-center text-center my-auto py-2">
        {/* Disco Ball Motif Graphic */}
        <div className="relative mb-3 flex flex-col items-center">
          {/* Hanging cord */}
          <div
            className="w-0.5 h-8 -mt-6 mb-1"
            style={{ backgroundColor: `${palette.primary}88` }}
          />
          {/* Mirrored Disco Ball Orb */}
          <div
            className="w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-xl relative overflow-hidden"
            style={{
              borderColor: palette.accent,
              backgroundColor: "#160b29",
              boxShadow: glowConfig.boxGlow,
            }}
          >
            {/* Disco facets grid lines */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `linear-gradient(${palette.secondary} 1px, transparent 1px), linear-gradient(90deg, ${palette.secondary} 1px, transparent 1px)`,
                backgroundSize: "6px 6px",
              }}
            />
            <span
              className="relative text-xl font-bold select-none"
              style={{ color: palette.accent }}
            >
              ✦
            </span>
          </div>
        </div>

        {/* Oversized Event Title */}
        <h1
          className="text-8xl font-black uppercase tracking-tight leading-none mb-3"
          style={{
            fontFamily: displayFontFamily,
            background: `linear-gradient(135deg, #ffffff 10%, ${palette.accent} 50%, ${palette.primary} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: glowConfig.textShadow,
            filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.8))",
          }}
        >
          {content.eventTitle || "GROOVY WEDNESDAY"}
        </h1>

        {/* Subtitle / Equalizer Bars Accents */}
        <div className="flex items-center justify-center gap-4 mt-1">
          <div className="flex items-center gap-1 opacity-70">
            <span className="w-1 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
            <span className="w-1 h-5 rounded-full" style={{ backgroundColor: palette.accent }} />
            <span className="w-1 h-2 rounded-full" style={{ backgroundColor: palette.secondary }} />
          </div>

          <p
            className="text-sm font-black tracking-widest uppercase"
            style={{
              color: palette.secondary,
              letterSpacing: "0.28em",
              fontFamily: labelFontFamily,
            }}
          >
            {content.customLines && content.customLines.length > 0
              ? content.customLines[0]
              : "DISCO • CLASSICS • RETRO DANCE-FLOOR BEATS"}
          </p>

          <div className="flex items-center gap-1 opacity-70">
            <span className="w-1 h-2 rounded-full" style={{ backgroundColor: palette.secondary }} />
            <span className="w-1 h-5 rounded-full" style={{ backgroundColor: palette.accent }} />
            <span className="w-1 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 5: Dual-Offer Module (Strictly Separated Cards)
          Blueprint 4.4 Mandate: "Make Free koroga chicken on the house
          a distinct primary offer. Show the bottle/cognac/beer-bucket
          discounts as secondary copy, not as one dense paragraph."
         ---------------------------------------------------- */}
      {hasAnyOffer && (
        <section
          className={`relative z-10 my-4 flex flex-col gap-3.5 ${
            isCentered ? "w-full max-w-[880px] mx-auto" : "w-full"
          }`}
          data-testid="lannister-dual-offer-container"
        >
          {/* Card A: Primary Food Highlight Card */}
          {hasPrimaryOffer && (
            <div
              className="relative rounded-2xl overflow-hidden border-2 shadow-2xl flex items-stretch"
              style={{
                backgroundColor: "#160b2b",
                borderColor: "#eab308",
                boxShadow: `0 0 24px rgba(234, 179, 8, 0.25)`,
              }}
              data-testid="lannister-primary-offer-card"
            >
              {/* Left VIP Gold Stripe with Icon */}
              <div
                className="w-20 shrink-0 flex flex-col items-center justify-center p-3 font-black text-slate-950"
                style={{
                  background: "linear-gradient(180deg, #fef08a 0%, #eab308 50%, #ca8a04 100%)",
                }}
              >
                <span className="text-2xl leading-none">★</span>
                <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-center leading-tight">
                  HOUSE VIP
                </span>
              </div>

              {/* Main Primary Offer Content */}
              <div className="flex-1 p-5 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[11px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded"
                    style={{
                      backgroundColor: "rgba(234, 179, 8, 0.18)",
                      color: "#facc15",
                      fontFamily: labelFontFamily,
                      letterSpacing: "0.15em",
                    }}
                  >
                    PRIMARY COMPLIMENTARY SPECIAL
                  </span>
                  <span
                    className="text-xs font-black uppercase tracking-wider text-amber-400"
                    style={{ fontFamily: labelFontFamily }}
                  >
                    ON THE HOUSE
                  </span>
                </div>
                <h3
                  className="text-2xl font-black uppercase tracking-tight text-white leading-snug"
                  style={{
                    fontFamily: displayFontFamily,
                    letterSpacing: "0.04em",
                  }}
                >
                  {content.primaryOffer}
                </h3>
              </div>
            </div>
          )}

          {/* Card B: Secondary Drink Discounts Strip */}
          {hasSecondaryOffer && (
            <div
              className="relative rounded-xl overflow-hidden border p-4 flex items-center justify-between"
              style={{
                backgroundColor: "#110722cc",
                borderColor: `${palette.primary}99`,
                boxShadow: glowConfig.boxGlow,
              }}
              data-testid="lannister-secondary-offer-card"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg shrink-0 border"
                  style={{
                    backgroundColor: `${palette.primary}25`,
                    borderColor: `${palette.accent}66`,
                    color: palette.accent,
                  }}
                >
                  🍸
                </div>
                <div>
                  <div
                    className="text-[10px] font-bold tracking-widest uppercase mb-0.5"
                    style={{
                      color: palette.secondary,
                      fontFamily: labelFontFamily,
                      letterSpacing: "0.18em",
                    }}
                  >
                    BEVERAGE PRIVILEGES
                  </div>
                  <p className="text-base font-bold text-white tracking-wide">
                    {content.secondaryOffer}
                  </p>
                </div>
              </div>

              <div
                className="px-3 py-1 rounded-full border text-[11px] font-extrabold uppercase shrink-0"
                style={{
                  backgroundColor: `${palette.primary}20`,
                  borderColor: palette.accent,
                  color: palette.accent,
                  fontFamily: labelFontFamily,
                }}
              >
                SPECIAL DISCOUNTS
              </div>
            </div>
          )}
        </section>
      )}

      {/* ----------------------------------------------------
          LAYER 6: High-Contrast DJ & Lineup Panel
         ---------------------------------------------------- */}
      <section
        className="relative z-10 my-3 p-5 rounded-2xl border-2 flex items-center justify-between shadow-2xl"
        style={{
          backgroundColor: "#150926ee",
          borderColor: `${palette.secondary}88`,
          boxShadow: glowConfig.boxGlow,
        }}
        data-testid="lannister-dj-panel"
      >
        <div className="flex items-center gap-6">
          {/* Label Badge */}
          <div className="flex flex-col">
            <span
              className="text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-full border inline-block text-center"
              style={{
                backgroundColor: `${palette.primary}33`,
                borderColor: palette.primary,
                color: palette.accent,
                fontFamily: labelFontFamily,
                letterSpacing: "0.15em",
              }}
            >
              ON THE DECKS
            </span>
            <span
              className="text-[9px] font-bold tracking-widest uppercase mt-1 text-center"
              style={{ color: palette.secondary }}
            >
              RESIDENT LINEUP
            </span>
          </div>

          {/* Performer Names */}
          <div className="flex flex-wrap items-center gap-3">
            {allPerformers.map((name, index) => (
              <React.Fragment key={index}>
                <span
                  className="text-3xl font-black uppercase tracking-wide text-white"
                  style={{
                    fontFamily: displayFontFamily,
                    letterSpacing: "0.05em",
                  }}
                >
                  {name}
                </span>
                {index < allPerformers.length - 1 && (
                  <span
                    className="text-2xl font-black"
                    style={{ color: palette.accent }}
                  >
                    &amp;
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Equalizer Wave Accent Graphic */}
        <div className="flex items-center gap-1.5 shrink-0 opacity-80 pl-4">
          <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: palette.primary }} />
          <span className="w-1.5 h-10 rounded-full" style={{ backgroundColor: palette.secondary }} />
          <span className="w-1.5 h-14 rounded-full" style={{ backgroundColor: palette.accent }} />
          <span className="w-1.5 h-8 rounded-full" style={{ backgroundColor: "#ffffff" }} />
          <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: palette.primary }} />
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 7: Footer & Operational Logistics
         ---------------------------------------------------- */}
      <footer
        className="relative z-10 pt-4 border-t flex items-center justify-between text-xs font-semibold"
        style={{
          borderColor: `${palette.primary}40`,
          color: palette.text,
        }}
      >
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-wider uppercase text-white">
            {content.venueName || "OZONE LOUNGE"}
          </span>

          {hasLocationOrContact && (
            <span style={{ color: palette.secondary }}>
              {[content.locationText, content.contactText].filter(Boolean).join(" • ")}
            </span>
          )}

          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
            style={{
              backgroundColor: `${palette.primary}20`,
              color: palette.accent,
            }}
          >
            FREE ENTRY • MIDWEEK VIBES
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span
            className="font-bold tracking-wider"
            style={{ color: palette.accent }}
          >
            {content.socialHandle || "@ozonelounge"}
          </span>
        </div>
      </footer>
    </div>
  );
}
