"use client";

import React from "react";
import { PosterDocument } from "@/features/poster/schema";
import { getTemplateById } from "@/features/templates/registry";

export interface PinkmanTemplateProps {
  document: PosterDocument;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Pinkman — Sunday Old Skool Sundays / Nostalgic Vinyl / Vintage Beer Bucket Template
 *
 * Implements Blueprint Section 4.8 & Stage 18:
 * - Master dimensions: 1080 × 1350 px (strict 4:5 aspect ratio)
 * - Nostalgic, relaxed old-school music culture; warm, familiar throwback aesthetic
 * - Concentric vinyl record grooves, turntable spindle label, 45 RPM adapter motif
 * - Prominent resident performer block: DJ Ngash (Old Skool Specialist / All Vinyl Classics)
 * - Beverage special offer handling: "Discounts on beer buckets."
 * - Layout options: "vinyl-grooves" (turntable & record grooves) vs "retro-cassette" (analog tape & cassettes)
 * - Curated palettes: Amber Memory, Faded Teal, Brick & Cream
 */
export function PinkmanTemplate({
  document,
  className = "",
  style = {},
}: PinkmanTemplateProps) {
  const { content, styling, assets } = document;

  // Resolve palette tokens from registry
  const templateDef = getTemplateById("pinkman");
  const palette =
    templateDef?.palettePresets.find((p) => p.id === styling.paletteId) ||
    templateDef?.palettePresets[0] || {
      id: "amber-memory",
      name: "Amber Memory",
      primary: "#d97706",
      secondary: "#b45309",
      accent: "#f59e0b",
      background: "#1c1407",
      text: "#fef3c7",
    };

  // Typography font resolution
  const isAnalog = styling.typographyPresetId === "analog-classic";
  const displayFontFamily = isAnalog
    ? "'Source Sans 3', sans-serif"
    : "'Bebas Neue', 'Source Sans 3', sans-serif";
  const bodyFontFamily = "'Inter', sans-serif";
  const labelFontFamily = isAnalog
    ? "'Bebas Neue', 'Source Sans 3', sans-serif"
    : "'Source Sans 3', 'Inter', sans-serif";

  // Layout & Decoration resolution
  const layoutOptionId = styling.layoutOptionId || "vinyl-grooves";
  const isVinylGrooves = layoutOptionId === "vinyl-grooves";
  const isRetroCassette = layoutOptionId === "retro-cassette";

  const showVinylRecord = styling.decorationOptions?.vinylRecord !== false;
  const showVintageGrooves = styling.decorationOptions?.vintageGrooves !== false;
  const showWarmTexture = styling.decorationOptions?.warmTexture !== false;

  const focalPoint = styling.focalPoints?.background || { x: 0.5, y: 0.5 };

  // Performers resolution (DJ Ngash default per brief)
  const djList = content.djNames.length > 0 ? content.djNames : ["DJ Ngash"];
  const allPerformers = [...djList, ...content.hostNames];

  // Offers resolution ("Discounts on beer buckets." default per brief)
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
      data-testid="pinkman-template-root"
    >
      {/* ----------------------------------------------------
          LAYER 0: Nostalgic Vinyl Atmosphere & Micro-grooves
         ---------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Warm Vintage Gradient */}
          <linearGradient id="pinkmanVintageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.accent} />
            <stop offset="50%" stopColor={palette.primary} />
            <stop offset="100%" stopColor={palette.secondary} />
          </linearGradient>

          {/* Vinyl Disc Center Label Radial */}
          <radialGradient id="pinkmanCenterLabel" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.accent} />
            <stop offset="45%" stopColor={palette.primary} />
            <stop offset="85%" stopColor={palette.secondary} />
            <stop offset="100%" stopColor={palette.background} />
          </radialGradient>

          {/* Ambient Warm Vinyl Aura */}
          <radialGradient id="pinkmanWarmAura" cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor={palette.primary} stopOpacity={showWarmTexture ? 0.35 : 0.2} />
            <stop offset="60%" stopColor={palette.secondary} stopOpacity={showWarmTexture ? 0.15 : 0.08} />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </radialGradient>

          {/* Card Glassmorphic Background Gradient */}
          <linearGradient id="pinkmanCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.primary} stopOpacity="0.12" />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0.88" />
          </linearGradient>

          {/* Vintage Subtle Glow Filter */}
          <filter id="pinkmanVintageGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Atmospheric Layer */}
        <circle cx="540" cy="460" r="480" fill="url(#pinkmanWarmAura)" />

        {/* Concentric Vinyl Grooves (Vinyl Layout Mode) */}
        {showVinylRecord && isVinylGrooves && (
          <g transform="translate(540, 440)" opacity="0.38">
            {/* Outer Vinyl Disc Body */}
            <circle cx="0" cy="0" r="380" fill="#0c0803" stroke={palette.primary} strokeOpacity="0.3" strokeWidth="2" />

            {/* Concentric Sound Track Grooves */}
            {showVintageGrooves && (
              <>
                <circle cx="0" cy="0" r="350" fill="none" stroke={palette.accent} strokeOpacity="0.15" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="320" fill="none" stroke={palette.primary} strokeOpacity="0.22" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="290" fill="none" stroke={palette.accent} strokeOpacity="0.12" strokeWidth="1" />
                <circle cx="0" cy="0" r="260" fill="none" stroke={palette.primary} strokeOpacity="0.18" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="230" fill="none" stroke={palette.accent} strokeOpacity="0.15" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="200" fill="none" stroke={palette.primary} strokeOpacity="0.25" strokeWidth="1.8" />
                <circle cx="0" cy="0" r="170" fill="none" stroke={palette.accent} strokeOpacity="0.18" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="140" fill="none" stroke={palette.primary} strokeOpacity="0.2" strokeWidth="1" />

                {/* Turntable Reflection Flares */}
                <polygon points="0,0 -90,-380 90,-380" fill={palette.text} fillOpacity="0.03" />
                <polygon points="0,0 -90,380 90,380" fill={palette.text} fillOpacity="0.03" />
              </>
            )}

            {/* Turntable Tonearm Geometry Accent */}
            <g transform="translate(420, -260)" opacity="0.65">
              <circle cx="0" cy="0" r="24" fill={palette.secondary} stroke={palette.accent} strokeWidth="2" />
              <line x1="0" y1="0" x2="-160" y2="200" stroke={palette.text} strokeWidth="5" strokeLinecap="round" />
              <rect x="-190" y="190" width="40" height="20" rx="4" fill={palette.primary} transform="rotate(-35 -170 200)" />
            </g>
          </g>
        )}

        {/* Analog Cassette Tape Geometry (Cassette Layout Mode) */}
        {isRetroCassette && (
          <g transform="translate(540, 440)" opacity="0.32">
            <rect x="-360" y="-220" width="720" height="440" rx="28" fill="#0d0904" stroke={palette.primary} strokeOpacity="0.3" strokeWidth="2" />
            <rect x="-260" y="-140" width="520" height="280" rx="16" fill="none" stroke={palette.accent} strokeOpacity="0.2" strokeWidth="1.5" />
            {/* Left Spool */}
            <circle cx="-130" cy="0" r="70" fill="none" stroke={palette.primary} strokeWidth="2.5" />
            <circle cx="-130" cy="0" r="24" fill={palette.accent} fillOpacity="0.4" />
            {/* Right Spool */}
            <circle cx="130" cy="0" r="70" fill="none" stroke={palette.primary} strokeWidth="2.5" />
            <circle cx="130" cy="0" r="24" fill={palette.accent} fillOpacity="0.4" />
            {/* Center Tape Window */}
            <rect x="-60" y="-30" width="120" height="60" rx="6" fill="#000000" fillOpacity="0.5" stroke={palette.secondary} strokeWidth="1" />
          </g>
        )}

        {/* Master Poster Double Border Framing */}
        <rect
          x="44"
          y="44"
          width="992"
          height="1262"
          rx="18"
          fill="none"
          stroke={palette.primary}
          strokeOpacity="0.28"
          strokeWidth="2.5"
        />
        <rect
          x="52"
          y="52"
          width="976"
          height="1246"
          rx="12"
          fill="none"
          stroke={palette.accent}
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
          {/* Ozone Retro Vinyl Emblem */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${palette.accent}, ${palette.secondary})`,
              color: "#1c1407",
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
              Sunday Old Skool Sessions
            </p>
          </div>
        </div>

        {/* Sunday Calendar Badge & Optional Date/Time */}
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
              color: palette.accent,
              boxShadow: `0 0 16px ${palette.primary}33`,
            }}
          >
            {content.dayLabel || "SUNDAY"}
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------
          LAYER 2: Hero Visual Area / Retro Turntable Frame
         ---------------------------------------------------- */}
      <section
        className={`relative z-10 w-full rounded-3xl overflow-hidden border transition-all duration-300 ${
          hasAnyOffer ? "h-[450px]" : "h-[540px]"
        }`}
        style={{
          borderColor: `${palette.primary}40`,
          backgroundColor: `${palette.background}ee`,
          boxShadow: `0 24px 60px -15px ${palette.background}, 0 0 40px ${palette.primary}20`,
        }}
      >
        {/* Background Image Slot or Fallback Vinyl Graphic */}
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
            {/* Deep Warm Vintage Canvas Texture */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${palette.primary}25, ${palette.secondary}15 55%, ${palette.background} 95%)`,
              }}
            />

            {/* Stylized Center Turntable Spindle Motif */}
            <div className="relative flex items-center justify-center">
              <svg className="w-80 h-80 opacity-40" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                <circle cx="150" cy="150" r="140" fill="none" stroke={palette.primary} strokeWidth="2" strokeDasharray="8,6" />
                <circle cx="150" cy="150" r="110" fill="none" stroke={palette.accent} strokeWidth="1.5" />
                <circle cx="150" cy="150" r="80" fill="none" stroke={palette.secondary} strokeWidth="2" strokeDasharray="4,4" />
                <circle cx="150" cy="150" r="50" fill="url(#pinkmanCenterLabel)" stroke={palette.accent} strokeWidth="2" />
                <circle cx="150" cy="150" r="15" fill="#1c1407" stroke={palette.primary} strokeWidth="1.5" />
                <circle cx="150" cy="150" r="5" fill="#000000" />
              </svg>

              {/* Center Vinyl Label Stamp */}
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span
                  className="px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase border"
                  style={{
                    backgroundColor: `${palette.primary}33`,
                    borderColor: palette.accent,
                    color: palette.text,
                  }}
                >
                  33 ⅓ RPM • STEREO
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-80"
                  style={{ color: palette.text }}
                >
                  Original Analog Master
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ambient Gradient Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${palette.background} 0%, transparent 60%, ${palette.background}66 100%)`,
          }}
        />

        {/* Overlay Title Block Anchored Inside Hero Base */}
        <div className="absolute bottom-6 left-8 right-8 flex flex-col items-start gap-1 z-20">
          <div className="flex items-center gap-2.5">
            <span
              className="px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider"
              style={{
                backgroundColor: palette.secondary,
                color: "#ffffff",
              }}
            >
              RETRO CLASSICS
            </span>
            <span
              className="text-xs font-black tracking-widest uppercase"
              style={{
                color: palette.accent,
                fontFamily: labelFontFamily,
                letterSpacing: "0.2em",
              }}
            >
              VINYL • DISCO • SOUL • R&amp;B
            </span>
          </div>

          <h1
            className="text-6xl md:text-7xl font-black uppercase tracking-tight leading-none drop-shadow-2xl"
            style={{
              fontFamily: displayFontFamily,
              color: palette.text,
              textShadow: `0 4px 20px #000000, 0 0 30px ${palette.primary}44`,
            }}
          >
            {content.eventTitle || "OLD SKOOL SUNDAYS"}
          </h1>
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 3: Resident Performer Block (DJ Ngash)
         ---------------------------------------------------- */}
      <section
        className="relative z-10 rounded-2xl p-6 border transition-all"
        style={{
          background: `linear-gradient(135deg, ${palette.primary}18, ${palette.background}fa)`,
          borderColor: `${palette.primary}44`,
          boxShadow: `0 16px 36px -10px ${palette.background}, 0 0 24px ${palette.primary}15`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Vintage Turntable Vinyl Badge */}
            <div
              className="w-16 h-16 rounded-xl font-black text-xl flex items-center justify-center shadow-lg border relative overflow-hidden"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${palette.accent}, ${palette.secondary})`,
                color: "#1c1407",
                borderColor: `${palette.primary}88`,
              }}
            >
              {/* Mini Vinyl Record Graphic inside Badge */}
              <svg className="w-12 h-12" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#1c1407" stroke="#f59e0b" strokeWidth="1" />
                <circle cx="20" cy="20" r="14" fill="none" stroke="#d97706" strokeWidth="0.8" />
                <circle cx="20" cy="20" r="10" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
                <circle cx="20" cy="20" r="7" fill="#d97706" />
                <circle cx="20" cy="20" r="2.5" fill="#000000" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{
                    color: palette.accent,
                    fontFamily: labelFontFamily,
                    letterSpacing: "0.2em",
                  }}
                >
                  RESIDENT VINYL SELECTA
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }} />
              </div>

              <h3
                className="text-4xl font-black tracking-wide uppercase"
                style={{
                  fontFamily: displayFontFamily,
                  color: palette.text,
                  letterSpacing: "0.05em",
                }}
              >
                {allPerformers.join(" & ") || "DJ Ngash"}
              </h3>
            </div>
          </div>

          {/* Analog 45 RPM Speed Tag & Needle Marker */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-black/40"
            style={{ borderColor: `${palette.primary}33` }}
          >
            <span
              className="text-xs font-mono font-bold uppercase tracking-wider"
              style={{ color: palette.accent }}
            >
              ALL-VINYL SET
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              45 RPM
            </span>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 4: Beer Bucket Promotional Offer Card
         ---------------------------------------------------- */}
      {hasAnyOffer && (
        <section
          className="relative z-10 rounded-2xl p-6 border overflow-hidden transition-all"
          style={{
            background: `linear-gradient(135deg, ${palette.secondary}20 0%, ${palette.background}f5 100%)`,
            borderColor: `${palette.secondary}66`,
            boxShadow: `0 20px 40px -12px ${palette.background}, 0 0 28px ${palette.secondary}22`,
          }}
          data-testid="pinkman-offer-container"
        >
          {/* Left Vintage Amber Accent Stripe */}
          <div
            className="absolute left-0 top-0 bottom-0 w-2.5"
            style={{
              background: `linear-gradient(to bottom, ${palette.accent}, ${palette.primary}, ${palette.secondary})`,
            }}
          />

          <div className="flex items-center justify-between pl-4">
            <div className="space-y-1.5 max-w-[760px]">
              {/* Offer Header Pill */}
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-0.5 rounded text-[11px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: `${palette.primary}33`,
                    borderColor: `${palette.primary}77`,
                    borderWidth: 1,
                    color: palette.accent,
                  }}
                >
                  SUNDAY BEER SPECIAL
                </span>
                <span
                  className="text-[11px] font-bold tracking-widest uppercase opacity-75"
                  style={{ color: palette.accent }}
                >
                  ICE COLD BUCKET SERVICE
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
                  style={{ color: palette.accent }}
                >
                  {content.secondaryOffer}
                </p>
              )}

              {!hasSecondaryOffer && hasPrimaryOffer && (
                <p
                  className="text-xs font-medium tracking-wide opacity-75"
                  style={{ color: palette.accent }}
                >
                  Ice cold bucket specials all day • Perfect accompaniment to throwback classics
                </p>
              )}
            </div>

            {/* Stylized Beer Bucket / Bottle Graphic */}
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
                stroke={palette.accent}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Ice Bucket Silhouette */}
                <polygon points="4,10 20,10 18,22 6,22" />
                {/* Bucket Handle */}
                <path d="M 3 10 C 3 4 21 4 21 10" />
                {/* Cold Bottles in Ice */}
                <line x1="8" y1="5" x2="8" y2="10" strokeWidth="2" stroke={palette.primary} />
                <line x1="12" y1="3" x2="12" y2="10" strokeWidth="2" stroke={palette.accent} />
                <line x1="16" y1="6" x2="16" y2="10" strokeWidth="2" stroke={palette.primary} />
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
            {content.locationText || "GATES OPEN 4:00 PM • RELAXED SUNDAY VIBES • NO NOISE RESTRICTIONS"}
            {content.contactText && <span className="mx-2">•</span>}
            {content.contactText}
          </p>
        </div>

        {/* Social Handle & Record Lounge Tag */}
        <div className="text-right space-y-0.5">
          <p
            className="text-sm font-black tracking-widest uppercase"
            style={{
              fontFamily: labelFontFamily,
              color: palette.accent,
              letterSpacing: "0.15em",
            }}
          >
            {content.socialHandle || "@OZONELOUNGE"}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-60"
            style={{ color: palette.text }}
          >
            VINYL &amp; RETRO CLASSICS LOUNGE
          </p>
        </div>
      </footer>
    </div>
  );
}
