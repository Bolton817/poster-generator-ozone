"use client";

import React from "react";
import { PosterDocument } from "@/features/poster/schema";
import { getTemplateById } from "@/features/templates/registry";

export interface EscobarTemplateProps {
  document: PosterDocument;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Escobar — Saturday Fiesta / Weekend Celebration / Layered Colour Blocks Template
 *
 * Implements Blueprint Section 4.7 & Stage 17:
 * - Master dimensions: 1080 × 1350 px (strict 4:5 aspect ratio)
 * - Celebratory weekend energy; vivid colour and layered light
 * - Layered colour blocks & dynamic radiant light orbs
 * - Prominent resident performer block: DVJ Jojez (with DVJ badge)
 * - Special beverage promotion: "Discounts on whiskey bottles and cognac."
 * - Layout options: "color-blocks" (layered fiesta panels) vs "fiesta-glow" (radiant orbs & atmospheric aura)
 * - Curated palettes: Fiesta Citrus, Coral Electric, Purple & Gold
 */
export function EscobarTemplate({
  document,
  className = "",
  style = {},
}: EscobarTemplateProps) {
  const { content, styling, assets } = document;

  // Resolve palette tokens from registry
  const templateDef = getTemplateById("escobar");
  const palette =
    templateDef?.palettePresets.find((p) => p.id === styling.paletteId) ||
    templateDef?.palettePresets[0] || {
      id: "fiesta-citrus",
      name: "Fiesta Citrus",
      primary: "#f59e0b",
      secondary: "#ef4444",
      accent: "#10b981",
      background: "#180a04",
      text: "#fffbeb",
    };

  // Typography font resolution
  const isVibrant = styling.typographyPresetId === "fiesta-vibrant";
  const displayFontFamily = isVibrant
    ? "'Source Sans 3', sans-serif"
    : "'Bebas Neue', 'Source Sans 3', sans-serif";
  const bodyFontFamily = "'Inter', sans-serif";
  const labelFontFamily = isVibrant
    ? "'Bebas Neue', 'Source Sans 3', sans-serif"
    : "'Source Sans 3', 'Inter', sans-serif";

  // Layout & Decoration resolution
  const layoutOptionId = styling.layoutOptionId || "color-blocks";
  const isColorBlocks = layoutOptionId === "color-blocks";
  const isFiestaGlow = layoutOptionId === "fiesta-glow";

  const lightOrbs = styling.decorationOptions?.lightOrbs !== false;
  const confettiAccents = styling.decorationOptions?.confettiAccents !== false;
  const cardElevation = styling.decorationOptions?.cardElevation !== false;

  const focalPoint = styling.focalPoints?.background || { x: 0.5, y: 0.5 };

  // Performers resolution (DVJ Jojez default per brief)
  const djList = content.djNames.length > 0 ? content.djNames : ["DVJ Jojez"];
  const allPerformers = [...djList, ...content.hostNames];

  // Offers resolution ("Discounts on whiskey bottles and cognac." default per brief)
  const hasPrimaryOffer = Boolean(content.primaryOffer?.trim());
  const hasSecondaryOffer = Boolean(content.secondaryOffer?.trim());
  const hasAnyOffer = hasPrimaryOffer || hasSecondaryOffer;

  // Logistics resolution
  const hasDateTime = Boolean(content.dateText?.trim() || content.startTime?.trim());

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
      data-testid="escobar-template-root"
    >
      {/* ----------------------------------------------------
          LAYER 0: Celebratory Atmosphere & Layered Color Blocks
         ---------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Primary Fiesta Gradient */}
          <linearGradient id="escobarFiestaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.primary} />
            <stop offset="60%" stopColor={palette.secondary} />
            <stop offset="100%" stopColor={palette.accent} />
          </linearGradient>

          {/* Reverse Fiesta Ribbon Gradient */}
          <linearGradient id="escobarRibbonGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.secondary} />
            <stop offset="50%" stopColor={palette.primary} />
            <stop offset="100%" stopColor={palette.accent} />
          </linearGradient>

          {/* Ambient Glow Orb 1 */}
          <radialGradient id="escobarOrb1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.primary} stopOpacity={isFiestaGlow ? 0.5 : 0.35} />
            <stop offset="65%" stopColor={palette.primary} stopOpacity={isFiestaGlow ? 0.2 : 0.1} />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </radialGradient>

          {/* Ambient Glow Orb 2 */}
          <radialGradient id="escobarOrb2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.secondary} stopOpacity={isFiestaGlow ? 0.45 : 0.3} />
            <stop offset="70%" stopColor={palette.secondary} stopOpacity={isFiestaGlow ? 0.18 : 0.08} />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </radialGradient>

          {/* Ambient Glow Orb 3 */}
          <radialGradient id="escobarOrb3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.accent} stopOpacity={isFiestaGlow ? 0.4 : 0.25} />
            <stop offset="60%" stopColor={palette.accent} stopOpacity={isFiestaGlow ? 0.15 : 0.05} />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </radialGradient>

          {/* Card Glassmorphic Background Gradient */}
          <linearGradient id="escobarCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.primary} stopOpacity="0.12" />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0.85" />
          </linearGradient>

          {/* Festive Drop Shadow & Glow Filter */}
          <filter id="escobarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Atmospheric Layer */}
        {lightOrbs && (
          <g>
            <circle cx="200" cy="240" r="320" fill="url(#escobarOrb1)" />
            <circle cx="880" cy="420" r="360" fill="url(#escobarOrb2)" />
            <circle cx="540" cy="1150" r="420" fill="url(#escobarOrb3)" />
            {isFiestaGlow && (
              <>
                <circle cx="950" cy="150" r="280" fill="url(#escobarOrb1)" />
                <circle cx="120" cy="850" r="300" fill="url(#escobarOrb2)" />
              </>
            )}
          </g>
        )}

        {/* Color Blocks Architecture */}
        {isColorBlocks && (
          <g opacity="0.85">
            {/* Top Right Angular Fiesta Tier */}
            <polygon
              points="450,0 1080,0 1080,320 600,320"
              fill={palette.primary}
              fillOpacity="0.08"
            />
            <line
              x1="450"
              y1="320"
              x2="1080"
              y2="320"
              stroke={palette.primary}
              strokeOpacity="0.35"
              strokeWidth="2.5"
            />

            {/* Left Diagonal Festive Ribbon */}
            <polygon
              points="0,180 340,180 220,380 0,380"
              fill={palette.secondary}
              fillOpacity="0.09"
            />
            <polygon
              points="300,175 315,175 195,385 180,385"
              fill={palette.secondary}
              fillOpacity="0.35"
            />

            {/* Bottom Stepped Tier */}
            <polygon
              points="0,1180 500,1180 380,1350 0,1350"
              fill={palette.accent}
              fillOpacity="0.08"
            />
            <line
              x1="0"
              y1="1180"
              x2="500"
              y2="1180"
              stroke={palette.accent}
              strokeOpacity="0.3"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Fiesta Confetti & Sparkle Accents */}
        {confettiAccents && (
          <g opacity="0.65">
            {/* Sparkle Stars & Diamonds */}
            <polygon points="120,240 125,248 135,250 126,257 128,266 120,260 112,266 114,257 105,250 115,248" fill={palette.primary} />
            <polygon points="980,210 983,217 992,218 985,224 987,232 980,227 973,232 975,224 968,218 977,217" fill={palette.accent} />
            <polygon points="80,950 83,957 92,958 85,964 87,972 80,967 73,972 75,964 68,958 77,957" fill={palette.secondary} />
            <polygon points="1000,980 1004,989 1014,990 1006,997 1008,1007 1000,1001 992,1007 994,997 986,990 996,989" fill={palette.primary} />

            {/* Confetti Circles & Rectangles */}
            <circle cx="160" cy="180" r="5" fill={palette.primary} />
            <circle cx="920" cy="160" r="4" fill={palette.accent} />
            <circle cx="890" cy="360" r="6" fill={palette.secondary} />
            <circle cx="90" cy="450" r="4" fill={palette.primary} />
            <circle cx="990" cy="650" r="5" fill={palette.accent} />
            <circle cx="140" cy="800" r="4.5" fill={palette.secondary} />
            <circle cx="940" cy="1150" r="5" fill={palette.primary} />

            {/* Confetti Ribbon Bars */}
            <rect x="180" y="320" width="16" height="6" rx="2" fill={palette.accent} transform="rotate(25 180 320)" />
            <rect x="850" y="280" width="18" height="6" rx="2" fill={palette.primary} transform="rotate(-30 850 280)" />
            <rect x="920" y="860" width="16" height="5" rx="2" fill={palette.secondary} transform="rotate(45 920 860)" />
            <rect x="110" y="1100" width="18" height="6" rx="2" fill={palette.accent} transform="rotate(-15 110 1100)" />
          </g>
        )}

        {/* Master Poster Border Framing */}
        <rect
          x="44"
          y="44"
          width="992"
          height="1262"
          rx="18"
          fill="none"
          stroke={palette.primary}
          strokeOpacity="0.25"
          strokeWidth="2.5"
        />
        <rect
          x="52"
          y="52"
          width="976"
          height="1246"
          rx="12"
          fill="none"
          stroke={palette.secondary}
          strokeOpacity="0.15"
          strokeWidth="1.2"
        />
      </svg>

      {/* ----------------------------------------------------
          LAYER 1: Header Logistics & Branding Bar
         ---------------------------------------------------- */}
      <header className="relative z-10 flex items-center justify-between border-b pb-6"
        style={{ borderColor: `${palette.primary}33` }}
      >
        <div className="flex items-center gap-4">
          {/* Ozone Gold Emblem */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border"
            style={{
              background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
              color: "#180a04",
              borderColor: `${palette.primary}66`,
              boxShadow: `0 8px 24px ${palette.primary}33`,
            }}
          >
            OZ
          </div>

          <div>
            <h2
              className="text-2xl font-black tracking-wider uppercase"
              style={{
                fontFamily: displayFontFamily,
                color: palette.text,
                letterSpacing: "0.12em",
              }}
            >
              {content.venueName || "OZONE LOUNGE"}
            </h2>
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{
                fontFamily: labelFontFamily,
                color: palette.primary,
                letterSpacing: "0.18em",
              }}
            >
              Saturday Weekend Celebration
            </p>
          </div>
        </div>

        {/* Saturday Calendar Pill & Optional Date/Time */}
        <div className="flex items-center gap-3">
          {hasDateTime && (
            <div
              className="px-4 py-2 rounded-xl border text-xs font-bold tracking-wider uppercase backdrop-blur-md"
              style={{
                backgroundColor: `${palette.background}b3`,
                borderColor: `${palette.primary}40`,
                color: palette.text,
              }}
            >
              {content.dateText && <span>{content.dateText}</span>}
              {content.dateText && content.startTime && <span className="mx-1.5 opacity-50">•</span>}
              {content.startTime && <span>{content.startTime}</span>}
            </div>
          )}

          <div
            className="px-6 py-2.5 rounded-full border text-sm font-black tracking-widest uppercase shadow-md"
            style={{
              backgroundColor: `${palette.primary}26`,
              borderColor: palette.primary,
              color: palette.primary,
              boxShadow: `0 0 16px ${palette.primary}33`,
            }}
          >
            {content.dayLabel || "SATURDAY"}
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------
          LAYER 2: Hero Visual Area / Party Frame
         ---------------------------------------------------- */}
      <section
        className={`relative z-10 w-full rounded-3xl overflow-hidden border transition-all duration-300 ${
          hasAnyOffer ? "h-[450px]" : "h-[540px]"
        }`}
        style={{
          borderColor: `${palette.primary}40`,
          backgroundColor: `${palette.background}ee`,
          boxShadow: cardElevation
            ? `0 24px 60px -15px ${palette.background}, 0 0 40px ${palette.primary}20`
            : "none",
        }}
      >
        {/* Background Image Slot or Fallback Graphic */}
        {assets.backgroundAssetId ? (
          <div
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${assets.backgroundAssetId})`,
              backgroundPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Deep Warm Fiesta Canvas Texture */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${palette.primary}20, ${palette.secondary}15 50%, ${palette.background} 90%)`,
              }}
            />

            {/* Stylized Festive Graphic Motifs */}
            <svg
              className="w-full h-full opacity-35"
              viewBox="0 0 800 500"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Concentric Radiant Fiesta Rings */}
              <circle cx="400" cy="250" r="220" fill="none" stroke={palette.primary} strokeWidth="1.5" strokeDasharray="6,6" />
              <circle cx="400" cy="250" r="160" fill="none" stroke={palette.secondary} strokeWidth="2" />
              <circle cx="400" cy="250" r="100" fill="none" stroke={palette.accent} strokeWidth="2.5" strokeDasharray="8,4" />

              {/* Radiant Fiesta Starburst */}
              <polygon
                points="400,100 425,200 525,225 425,250 400,350 375,250 275,225 375,200"
                fill={palette.primary}
                fillOpacity="0.4"
              />
              <polygon
                points="400,140 415,220 490,235 415,250 400,330 385,250 310,235 385,220"
                fill={palette.secondary}
                fillOpacity="0.5"
              />
            </svg>

            {/* Subtle Hero Placeholder Stamp */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span
                className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border"
                style={{
                  backgroundColor: `${palette.primary}20`,
                  borderColor: `${palette.primary}50`,
                  color: palette.primary,
                }}
              >
                LIVE FIESTA EXPERIENCE
              </span>
              <p
                className="text-xs uppercase tracking-wider font-semibold opacity-70"
                style={{ color: palette.text }}
              >
                Vibrant Nightlife • Premium Sound &amp; Vision
              </p>
            </div>
          </div>
        )}

        {/* Ambient Hero Gradient Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${palette.background} 0%, transparent 60%, ${palette.background}55 100%)`,
          }}
        />

        {/* Overlay Title Block Anchored Inside Hero Base */}
        <div className="absolute bottom-6 left-8 right-8 flex flex-col items-start gap-1 z-20">
          <div className="flex items-center gap-2.5">
            <span
              className="px-3.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider"
              style={{
                backgroundColor: palette.secondary,
                color: "#ffffff",
              }}
            >
              WEEKEND SPECIAL
            </span>
            <span
              className="text-xs font-black tracking-widest uppercase"
              style={{
                color: palette.primary,
                fontFamily: labelFontFamily,
                letterSpacing: "0.2em",
              }}
            >
              SATURDAY NIGHT EXTRAVAGANZA
            </span>
          </div>

          <h1
            className="text-6xl md:text-7xl font-black uppercase tracking-tight leading-none drop-shadow-2xl"
            style={{
              fontFamily: displayFontFamily,
              color: palette.text,
              textShadow: `0 4px 20px #000000, 0 0 30px ${palette.primary}40`,
            }}
          >
            {content.eventTitle || "SATURDAY FIESTA"}
          </h1>
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 3: Resident Performer Block (DVJ Jojez)
         ---------------------------------------------------- */}
      <section
        className="relative z-10 rounded-2xl p-6 border transition-all"
        style={{
          background: `linear-gradient(135deg, ${palette.primary}18, ${palette.background}fa)`,
          borderColor: `${palette.primary}44`,
          boxShadow: cardElevation
            ? `0 16px 36px -10px ${palette.background}, 0 0 24px ${palette.primary}15`
            : "none",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* DVJ Tag Badge with Video / Audio Icon flair */}
            <div
              className="px-5 py-3 rounded-xl font-black text-xl flex items-center justify-center shadow-lg border"
              style={{
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                color: "#180a04",
                borderColor: `${palette.primary}88`,
                letterSpacing: "0.08em",
              }}
            >
              DVJ
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{
                    color: palette.primary,
                    fontFamily: labelFontFamily,
                    letterSpacing: "0.2em",
                  }}
                >
                  FEATURING RESIDENT VIDEO DJ
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.accent }} />
              </div>

              <h3
                className="text-4xl font-black tracking-wide uppercase"
                style={{
                  fontFamily: displayFontFamily,
                  color: palette.text,
                  letterSpacing: "0.05em",
                }}
              >
                {allPerformers.join(" & ") || "DVJ Jojez"}
              </h3>
            </div>
          </div>

          {/* Equalizer Wave Graphic */}
          <div className="flex items-end gap-1.5 h-10 px-4 py-1.5 rounded-xl border bg-black/40"
            style={{ borderColor: `${palette.primary}33` }}
          >
            <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: palette.accent }} />
            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: palette.primary }} />
            <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: palette.secondary }} />
            <div className="w-1.5 h-9 rounded-full" style={{ backgroundColor: palette.primary }} />
            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: palette.accent }} />
            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: palette.secondary }} />
            <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: palette.primary }} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 4: Beverage Promotional Offer Card (Whiskey & Cognac)
         ---------------------------------------------------- */}
      {hasAnyOffer && (
        <section
          className="relative z-10 rounded-2xl p-6 border overflow-hidden transition-all"
          style={{
            background: `linear-gradient(135deg, ${palette.secondary}20 0%, ${palette.background}f5 100%)`,
            borderColor: `${palette.secondary}66`,
            boxShadow: cardElevation
              ? `0 20px 40px -12px ${palette.background}, 0 0 28px ${palette.secondary}22`
              : "none",
          }}
          data-testid="escobar-offer-container"
        >
          {/* Left Fiesta Accent Stripe */}
          <div
            className="absolute left-0 top-0 bottom-0 w-2.5"
            style={{
              background: `linear-gradient(to bottom, ${palette.primary}, ${palette.secondary}, ${palette.accent})`,
            }}
          />

          <div className="flex items-center justify-between pl-4">
            <div className="space-y-1.5 max-w-[760px]">
              {/* Offer Header Pill */}
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-0.5 rounded text-[11px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: `${palette.secondary}33`,
                    borderColor: `${palette.secondary}77`,
                    borderWidth: 1,
                    color: palette.secondary,
                  }}
                >
                  WEEKEND DRINKS SPECIAL
                </span>
                <span
                  className="text-[11px] font-bold tracking-widest uppercase opacity-75"
                  style={{ color: palette.primary }}
                >
                  PREMIUM BOTTLE SERVICE
                </span>
              </div>

              {/* Primary Offer Headline */}
              {hasPrimaryOffer && (
                <p
                  className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight"
                  style={{
                    fontFamily: displayFontFamily,
                    color: palette.text,
                    letterSpacing: "0.04em",
                  }}
                >
                  {content.primaryOffer}
                </p>
              )}

              {/* Secondary Offer Supporting Copy */}
              {hasSecondaryOffer && (
                <p
                  className="text-sm font-semibold opacity-90"
                  style={{ color: palette.primary }}
                >
                  {content.secondaryOffer}
                </p>
              )}

              {!hasSecondaryOffer && hasPrimaryOffer && (
                <p
                  className="text-xs font-medium tracking-wide opacity-75"
                  style={{ color: palette.primary }}
                >
                  Special bottle pricing all night long • Celebrate in style with friends
                </p>
              )}
            </div>

            {/* Stylized Whiskey Bottle & Snifter Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner"
              style={{
                backgroundColor: `${palette.primary}15`,
                borderColor: `${palette.primary}40`,
              }}
            >
              <svg
                className="w-9 h-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke={palette.primary}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Whiskey Bottle */}
                <path d="M 8 2 L 12 2 L 12 5 L 14 8 L 14 20 L 6 20 L 6 8 L 8 5 Z" />
                <line x1="6" y1="13" x2="14" y2="13" stroke={palette.secondary} strokeWidth="1.5" />
                {/* Cognac Snifter Glass */}
                <path d="M 16 11 C 16 15 19 15 19 11 Z" fill={`${palette.primary}33`} />
                <path d="M 16 11 C 16 15.5 21 15.5 21 11" />
                <line x1="18.5" y1="15.5" x2="18.5" y2="19" />
                <line x1="16.5" y1="19" x2="20.5" y2="19" />
              </svg>
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------
          LAYER 5: Footer Logistics & Social Information
         ---------------------------------------------------- */}
      <footer
        className="relative z-10 flex items-center justify-between border-t pt-5"
        style={{ borderColor: `${palette.primary}33` }}
      >
        <div className="space-y-1">
          <p
            className="text-base font-black tracking-wider uppercase"
            style={{
              fontFamily: displayFontFamily,
              color: palette.text,
              letterSpacing: "0.08em",
            }}
          >
            {content.venueName || "OZONE LOUNGE"}
          </p>
          <p
            className="text-xs font-semibold tracking-wide opacity-80"
            style={{ color: palette.text }}
          >
            {content.locationText || "DOORS OPEN 6:00 PM • STRICTLY 21+ • DRESS CODE: FIESTA CHIC"}
            {content.contactText && <span className="mx-2">•</span>}
            {content.contactText}
          </p>
        </div>

        {/* Social Handle & Web Callout */}
        <div className="text-right space-y-0.5">
          <p
            className="text-sm font-black tracking-widest uppercase"
            style={{
              fontFamily: labelFontFamily,
              color: palette.primary,
              letterSpacing: "0.15em",
            }}
          >
            {content.socialHandle || "@OZONELOUNGE"}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-60"
            style={{ color: palette.text }}
          >
            VIP BOOTH RESERVATIONS RECOMMENDED
          </p>
        </div>
      </footer>
    </div>
  );
}
