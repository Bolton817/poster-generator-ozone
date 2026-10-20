"use client";

import React from "react";
import { PosterDocument } from "@/features/poster/schema";
import { getTemplateById } from "@/features/templates/registry";

export interface LothbrokTemplateProps {
  document: PosterDocument;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Lothbrok — Friday Flight Fridays / Premium Nightlife / Offer-Free Rebalancing Template
 *
 * Implements Blueprint Section 4.6, Decision 06 & Stage 16:
 * - Master dimensions: 1080 × 1350 px (strict 4:5 aspect ratio)
 * - Premium, fast-moving Friday nightlife; strong contrast and confident typography
 * - Decision 06 Offer-Free Architecture:
 *   No offer was supplied in the source brief. If offers are blank, hide the offer
 *   component completely and rebalance the layout. Never print "No special offer provided yet"
 *   or render empty cards.
 * - Prominent headliner DJ block for DJ Slim D & Mistabrand
 * - Layout options: "hero-focus-no-offer" (balanced hero) vs "diagonal-split" (12-degree angled cut)
 * - Metallic chrome accents, aerodynamic speed lines and flight chevrons
 */
export function LothbrokTemplate({
  document,
  className = "",
  style = {},
}: LothbrokTemplateProps) {
  const { content, styling, assets } = document;

  // Resolve palette tokens from registry
  const templateDef = getTemplateById("lothbrok");
  const palette =
    templateDef?.palettePresets.find((p) => p.id === styling.paletteId) ||
    templateDef?.palettePresets[0] || {
      id: "black-chrome",
      name: "Black & Chrome",
      primary: "#f8fafc",
      secondary: "#94a3b8",
      accent: "#e2e8f0",
      background: "#020617",
      text: "#ffffff",
    };

  // Typography font resolution
  const isNightlife = styling.typographyPresetId === "nightlife-condensed";
  const displayFontFamily = isNightlife
    ? "'Source Sans 3', sans-serif"
    : "'Bebas Neue', 'Source Sans 3', sans-serif";
  const bodyFontFamily = "'Inter', sans-serif";
  const labelFontFamily = isNightlife
    ? "'Bebas Neue', 'Source Sans 3', sans-serif"
    : "'Inter', sans-serif";

  // Layout & Decoration resolution
  const layoutOptionId = styling.layoutOptionId || "hero-focus-no-offer";
  const isDiagonalSplit = layoutOptionId === "diagonal-split";

  const focalPoint = styling.focalPoints?.background || { x: 0.5, y: 0.5 };

  // Performers resolution
  const djList = content.djNames.length > 0 ? content.djNames : ["DJ Slim D", "Mistabrand"];
  const allPerformers = [...djList, ...content.hostNames];

  // Offers resolution (Decision 06: Blank by default)
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
      data-testid="lothbrok-template-root"
    >
      {/* ----------------------------------------------------
          LAYER 1: Aerodynamic Nightlife Atmosphere & Metallic Slices
         ---------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Metallic Chrome Gradient */}
          <linearGradient
            id="lothbrokChromeGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor={palette.accent} />
            <stop offset="70%" stopColor={palette.secondary} />
            <stop offset="100%" stopColor={palette.primary} />
          </linearGradient>

          {/* Diagonal Aerodynamic Slice Beam */}
          <linearGradient
            id="lothbrokSliceBeam"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.primary} stopOpacity="0.25" />
            <stop offset="45%" stopColor={palette.secondary} stopOpacity="0.1" />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </linearGradient>

          {/* Ambient Top Glow */}
          <radialGradient
            id="lothbrokAmbientGlow"
            cx="50%"
            cy="15%"
            r="60%"
          >
            <stop offset="0%" stopColor={palette.secondary} stopOpacity="0.18" />
            <stop offset="60%" stopColor={palette.primary} stopOpacity="0.05" />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Top Glow Fill */}
        <rect width="100%" height="100%" fill="url(#lothbrokAmbientGlow)" />

        {/* Dynamic 12-Degree Angled Slice Geometry */}
        {isDiagonalSplit ? (
          <>
            <polygon points="0,0 720,0 360,1350 0,1350" fill="url(#lothbrokSliceBeam)" />
            <polygon points="720,0 726,0 366,1350 360,1350" fill={palette.primary} fillOpacity="0.4" />
          </>
        ) : (
          <>
            <polygon points="0,0 540,0 270,1350 0,1350" fill="url(#lothbrokSliceBeam)" />
            <polygon points="1080,0 540,0 810,1350 1080,1350" fill="url(#lothbrokSliceBeam)" />
          </>
        )}

        {/* Aerodynamic Speed Lines Across Canvas */}
        <line x1="60" y1="280" x2="1020" y2="280" stroke={palette.secondary} strokeOpacity="0.15" strokeWidth="1.5" />
        <line x1="280" y1="288" x2="1020" y2="288" stroke={palette.primary} strokeOpacity="0.3" strokeWidth="1" />
        <line x1="520" y1="296" x2="1020" y2="296" stroke={palette.accent} strokeOpacity="0.4" strokeWidth="1.5" />

        <line x1="60" y1="1200" x2="600" y2="1200" stroke={palette.accent} strokeOpacity="0.3" strokeWidth="1.5" />
        <line x1="60" y1="1208" x2="760" y2="1208" stroke={palette.primary} strokeOpacity="0.2" strokeWidth="1" />
        <line x1="60" y1="1216" x2="1020" y2="1216" stroke={palette.secondary} strokeOpacity="0.12" strokeWidth="1" />

        {/* Flight Wing Chevrons (Right Header Accent) */}
        <g transform="translate(980, 110)" opacity="0.6">
          <path d="M 0 0 L 20 20 L 0 40" fill="none" stroke={palette.primary} strokeWidth="3" />
          <path d="M 16 0 L 36 20 L 16 40" fill="none" stroke={palette.secondary} strokeWidth="3" />
        </g>

        {/* Double Metallic Perimeter Frame */}
        <rect
          x="44"
          y="44"
          width="992"
          height="1262"
          rx="16"
          fill="none"
          stroke={palette.secondary}
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        <rect
          x="52"
          y="52"
          width="976"
          height="1246"
          rx="12"
          fill="none"
          stroke={palette.primary}
          strokeOpacity="0.15"
          strokeWidth="1"
        />

        {/* Corner Metallic Polished Brackets */}
        <path d="M 44 100 L 44 44 L 100 44" fill="none" stroke={palette.primary} strokeOpacity="0.9" strokeWidth="3.5" />
        <path d="M 980 44 L 1036 44 L 1036 100" fill="none" stroke={palette.primary} strokeOpacity="0.9" strokeWidth="3.5" />
        <path d="M 44 1250 L 44 1306 L 100 1306" fill="none" stroke={palette.primary} strokeOpacity="0.9" strokeWidth="3.5" />
        <path d="M 980 1306 L 1036 1306 L 1036 1250" fill="none" stroke={palette.primary} strokeOpacity="0.9" strokeWidth="3.5" />
      </svg>

      {/* ----------------------------------------------------
          LAYER 2: Hero Nightlife / DJ Imagery
         ---------------------------------------------------- */}
      {assets.backgroundAssetId && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assets.backgroundAssetId}
            alt="Friday Nightlife Atmosphere"
            className="w-full h-full object-cover"
            style={{
              objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
              opacity: 0.28,
              mixBlendMode: "luminosity",
            }}
          />
          {/* Dark Metallic Nightlife Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 35%, transparent 25%, ${palette.background}ee 75%, ${palette.background} 100%)`,
            }}
          />
        </div>
      )}

      {/* ----------------------------------------------------
          LAYER 3: Top Header (Branding, Flight Badge, Date/Time)
         ---------------------------------------------------- */}
      <header className="relative z-10 flex items-center justify-between">
        {/* Ozone Lounge Branding */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl shadow-2xl border"
            style={{
              backgroundColor: `${palette.secondary}20`,
              borderColor: `${palette.primary}88`,
              color: palette.primary,
              boxShadow: `0 0 24px ${palette.secondary}33`,
            }}
          >
            OZ
          </div>
          <div>
            <h2
              className="text-2xl font-black tracking-widest uppercase leading-none text-white"
              style={{ letterSpacing: "0.18em" }}
            >
              {content.venueName || "OZONE LOUNGE"}
            </h2>
            <p
              className="text-xs font-bold tracking-widest uppercase mt-1"
              style={{ color: palette.secondary, letterSpacing: "0.26em" }}
            >
              FRIDAY FLIGHT NIGHTLIFE
            </p>
          </div>
        </div>

        {/* Day Pill & Date/Time Badge */}
        <div className="flex flex-col items-end gap-1.5">
          <div
            className="px-5 py-2 rounded-lg border text-xs font-black tracking-widest uppercase flex items-center gap-2"
            style={{
              backgroundColor: `${palette.secondary}20`,
              borderColor: palette.primary,
              color: palette.text,
              boxShadow: `0 0 20px ${palette.secondary}33`,
              fontFamily: labelFontFamily,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: palette.primary }}
            />
            {content.dayLabel || "FRIDAY"} TAKEOFF
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
          LAYER 4: Central Visual & Oversized Headline
         ---------------------------------------------------- */}
      <section className="relative z-10 flex flex-col items-center text-center my-auto py-2">
        {/* Aerodynamic Flight Wing Icon */}
        <div className="relative mb-3 flex flex-col items-center">
          <div
            className="w-16 h-16 rounded-xl border flex items-center justify-center shadow-2xl relative"
            style={{
              borderColor: palette.primary,
              backgroundColor: `${palette.background}dd`,
              boxShadow: `0 0 30px ${palette.secondary}44`,
            }}
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="16,4 28,14 20,24 16,20 12,24 4,14" fill={palette.primary} />
              <circle cx="16" cy="14" r="3" fill={palette.background} />
            </svg>
          </div>
        </div>

        {/* Oversized Event Headline */}
        <h1
          className="text-8xl font-black uppercase tracking-tight leading-none mb-3"
          style={{
            fontFamily: displayFontFamily,
            background: `linear-gradient(135deg, #ffffff 20%, ${palette.primary} 50%, ${palette.secondary} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 30px ${palette.secondary}66`,
            filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.9))",
          }}
        >
          {content.eventTitle || "FLIGHT FRIDAYS"}
        </h1>

        {/* Aerodynamic Subtitle */}
        <div className="flex items-center justify-center gap-4 mt-1">
          <span className="w-12 h-0.5" style={{ backgroundColor: palette.secondary }} />
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
              : "HIGH-ALTITUDE SOUNDS • SOUNDTRACK TO THE WEEKEND"}
          </p>
          <span className="w-12 h-0.5" style={{ backgroundColor: palette.secondary }} />
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 5: Prominent Headliner Lineup Showcase
          (Expanded to take natural focus per Decision 06)
         ---------------------------------------------------- */}
      <section
        className="relative z-10 my-4 p-7 rounded-2xl border-2 shadow-2xl flex flex-col justify-between"
        style={{
          backgroundColor: "#080c14ee",
          borderColor: `${palette.secondary}88`,
          boxShadow: `0 0 32px ${palette.secondary}33`,
        }}
        data-testid="lothbrok-lineup-panel"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b pb-3 mb-5" style={{ borderColor: `${palette.secondary}40` }}>
          <div className="flex items-center gap-2.5">
            <span
              className="text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded border"
              style={{
                backgroundColor: `${palette.primary}18`,
                borderColor: palette.primary,
                color: palette.primary,
                fontFamily: labelFontFamily,
              }}
            >
              HEADLINE FLIGHT LINEUP
            </span>
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: palette.secondary }}>
              RESIDENT SELECTORS
            </span>
          </div>

          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: palette.secondary }} />
            <span className="w-1.5 h-7 rounded-full" style={{ backgroundColor: palette.primary }} />
            <span className="w-1.5 h-10 rounded-full" style={{ backgroundColor: "#ffffff" }} />
            <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: palette.primary }} />
            <span className="w-1.5 h-3 rounded-full" style={{ backgroundColor: palette.secondary }} />
          </div>
        </div>

        {/* Performer Names (Large High-Impact Display) */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-2">
          {allPerformers.map((performer, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center">
                <span
                  className="text-4xl font-black uppercase tracking-wider text-white"
                  style={{
                    fontFamily: displayFontFamily,
                    letterSpacing: "0.06em",
                  }}
                >
                  {performer}
                </span>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-widest mt-0.5"
                  style={{ color: palette.secondary }}
                >
                  {idx === 0 ? "RESIDENT SELECTOR" : "CO-PILOT / GUEST"}
                </span>
              </div>
              {idx < allPerformers.length - 1 && (
                <span
                  className="text-3xl font-black opacity-60"
                  style={{ color: palette.secondary }}
                >
                  &amp;
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Sound Policy Footer Accent */}
        <div className="mt-4 pt-3 border-t text-center text-xs font-bold tracking-widest uppercase" style={{ borderColor: `${palette.secondary}30`, color: palette.secondary }}>
          STRICTLY PREMIUM URBAN • AFROBEATS • AMAPIANO • HIP-HOP
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 6: Optional Offer Strip (Decision 06 Handling)
          If offers are blank (default per brief): Zero elements rendered!
          If an operator enters a promotion: Renders sleek metallic banner.
         ---------------------------------------------------- */}
      {hasAnyOffer && (
        <section
          className="relative z-10 my-2 rounded-xl border p-4 flex items-center justify-between"
          style={{
            backgroundColor: "#0d1320ee",
            borderColor: `${palette.primary}99`,
            boxShadow: `0 0 20px ${palette.secondary}33`,
          }}
          data-testid="lothbrok-custom-offer-strip"
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg shrink-0 border"
              style={{
                backgroundColor: `${palette.primary}20`,
                borderColor: palette.primary,
                color: palette.primary,
              }}
            >
              ✦
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
                FRIDAY SPECIAL PRIVILEGE
              </div>
              <p className="text-base font-bold text-white tracking-wide">
                {[content.primaryOffer, content.secondaryOffer].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>

          <div
            className="px-3 py-1 rounded border text-[11px] font-extrabold uppercase shrink-0"
            style={{
              backgroundColor: `${palette.primary}20`,
              borderColor: palette.primary,
              color: palette.primary,
              fontFamily: labelFontFamily,
            }}
          >
            LIMITED OFFER
          </div>
        </section>
      )}

      {/* ----------------------------------------------------
          LAYER 7: Footer Operational Details
         ---------------------------------------------------- */}
      <footer
        className="relative z-10 pt-4 border-t flex items-center justify-between text-xs font-semibold"
        style={{
          borderColor: `${palette.secondary}40`,
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
            className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
            style={{
              backgroundColor: `${palette.secondary}20`,
              color: palette.primary,
            }}
          >
            FREE ENTRY • DRESS CODE: SMART CASUAL
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span
            className="font-bold tracking-wider"
            style={{ color: palette.primary }}
          >
            {content.socialHandle || "@ozonelounge"}
          </span>
        </div>
      </footer>
    </div>
  );
}
