"use client";

import React from "react";
import { PosterDocument } from "@/features/poster/schema";
import { getTemplateById } from "@/features/templates/registry";

export interface ShelbyTemplateProps {
  document: PosterDocument;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Shelby — Thursday Karaoke Night / Stage / Performers Template
 *
 * Implements Blueprint Section 4.5 & Stage 15:
 * - Master dimensions: 1080 × 1350 px (strict 4:5 aspect ratio)
 * - Theatrical karaoke-night energy, evoking looking toward a lit stage
 * - Strict role separation: Displays Hosts (Bellah Harriet & Tito Wagithomo)
 *   and DJ (DJ Fab) in clearly separated modules — never merged into one line.
 * - Unmistakable singer offer handling: Separates "Free tequila shots for singers"
 *   from discounts on gin, rum and vodka so the singer condition is unmistakable.
 * - Layout options: "spotlight-cone" (centered dramatic cone) vs "split-role-stage" (crossing dual spots)
 * - Stage lighting motifs: Overhead spotlight cones, vintage microphone emblem, stage truss.
 */
export function ShelbyTemplate({
  document,
  className = "",
  style = {},
}: ShelbyTemplateProps) {
  const { content, styling, assets } = document;

  // Resolve palette tokens from registry
  const templateDef = getTemplateById("shelby");
  const palette =
    templateDef?.palettePresets.find((p) => p.id === styling.paletteId) ||
    templateDef?.palettePresets[0] || {
      id: "stage-crimson",
      name: "Stage Crimson",
      primary: "#e11d48",
      secondary: "#f43f5e",
      accent: "#fda4af",
      background: "#120206",
      text: "#fff1f2",
    };

  // Typography font resolution
  const isBroadway = styling.typographyPresetId === "broadway-lights";
  const displayFontFamily = isBroadway
    ? "'Source Sans 3', sans-serif"
    : "'Bebas Neue', 'Source Sans 3', sans-serif";
  const bodyFontFamily = "'Inter', sans-serif";
  const labelFontFamily = isBroadway
    ? "'Bebas Neue', 'Source Sans 3', sans-serif"
    : "'Inter', sans-serif";

  // Layout & Decoration resolution
  const layoutOptionId = styling.layoutOptionId || "spotlight-cone";
  const isSplitStage = layoutOptionId === "split-role-stage";

  const spotlightIntensity = styling.decorationOptions?.spotlightIntensity || "dramatic";
  const spotOpacity = spotlightIntensity === "subtle" ? 0.22 : 0.38;

  const focalPoint = styling.focalPoints?.background || { x: 0.5, y: 0.5 };

  // Roles & Performers resolution
  const hostList = content.hostNames.length > 0 ? content.hostNames : ["Bellah Harriet", "Tito Wagithomo"];
  const djList = content.djNames.length > 0 ? content.djNames : ["DJ Fab"];
  const hasHosts = hostList.length > 0;
  const hasDjs = djList.length > 0;
  const hasAnyPerformer = hasHosts || hasDjs;

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
      data-testid="shelby-template-root"
    >
      {/* ----------------------------------------------------
          LAYER 1: Theatrical Stage Atmosphere & Spotlights
         ---------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Main Stage Spotlight Cone */}
          <linearGradient
            id="shelbySpotCone"
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.accent} stopOpacity={spotOpacity * 1.2} />
            <stop offset="40%" stopColor={palette.primary} stopOpacity={spotOpacity * 0.5} />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </linearGradient>

          {/* Left Crossing Spotlight Cone */}
          <linearGradient
            id="shelbyLeftCross"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.secondary} stopOpacity={spotOpacity * 0.7} />
            <stop offset="60%" stopColor={palette.primary} stopOpacity={spotOpacity * 0.2} />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </linearGradient>

          {/* Right Crossing Spotlight Cone */}
          <linearGradient
            id="shelbyRightCross"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={palette.secondary} stopOpacity={spotOpacity * 0.7} />
            <stop offset="60%" stopColor={palette.primary} stopOpacity={spotOpacity * 0.2} />
            <stop offset="100%" stopColor={palette.background} stopOpacity="0" />
          </linearGradient>

          {/* Golden Badge Gradient for Singer Tequila Offer */}
          <linearGradient
            id="shelbyGoldRibbon"
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

        {/* Overhead Stage Lighting Truss Bar */}
        <line
          x1="50"
          y1="50"
          x2="1030"
          y2="50"
          stroke={palette.primary}
          strokeOpacity="0.4"
          strokeWidth="4"
        />
        <circle cx="270" cy="50" r="7" fill={palette.accent} />
        <circle cx="540" cy="50" r="9" fill="#ffffff" />
        <circle cx="810" cy="50" r="7" fill={palette.accent} />

        {/* Theatrical Spotlight Cones */}
        {isSplitStage ? (
          /* Dual Crossing Spotlights (Split Role Focus) */
          <>
            <polygon points="270,50 330,50 820,1280 440,1280" fill="url(#shelbyLeftCross)" />
            <polygon points="750,50 810,50 260,1280 640,1280" fill="url(#shelbyRightCross)" />
          </>
        ) : (
          /* Overhead Centered Stage Spotlight */
          <>
            <polygon points="480,50 600,50 1020,1320 60,1320" fill="url(#shelbySpotCone)" />
            <polygon points="200,50 270,50 840,1180 560,1180" fill="url(#shelbyLeftCross)" />
            <polygon points="810,50 880,50 240,1180 520,1180" fill="url(#shelbyRightCross)" />
          </>
        )}

        {/* Warm Stage Floor Reflection Oval */}
        <ellipse
          cx="540"
          cy="1240"
          rx="440"
          ry="65"
          fill={palette.primary}
          fillOpacity="0.14"
        />

        {/* Outer Theatrical Frame Border */}
        <rect
          x="44"
          y="44"
          width="992"
          height="1262"
          rx="24"
          fill="none"
          stroke={palette.primary}
          strokeOpacity="0.35"
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
          strokeOpacity="0.15"
          strokeWidth="1.2"
        />

        {/* Decorative Corner Stage Brackets */}
        <path
          d="M 44 110 L 44 44 L 110 44"
          fill="none"
          stroke={palette.primary}
          strokeOpacity="0.8"
          strokeWidth="4"
        />
        <path
          d="M 970 44 L 1036 44 L 1036 110"
          fill="none"
          stroke={palette.primary}
          strokeOpacity="0.8"
          strokeWidth="4"
        />
        <path
          d="M 44 1240 L 44 1306 L 110 1306"
          fill="none"
          stroke={palette.primary}
          strokeOpacity="0.8"
          strokeWidth="4"
        />
        <path
          d="M 970 1306 L 1036 1306 L 1036 1240"
          fill="none"
          stroke={palette.primary}
          strokeOpacity="0.8"
          strokeWidth="4"
        />
      </svg>

      {/* ----------------------------------------------------
          LAYER 2: Stage / Performer / Crowd Photo
         ---------------------------------------------------- */}
      {assets.backgroundAssetId && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assets.backgroundAssetId}
            alt="Stage Atmosphere"
            className="w-full h-full object-cover"
            style={{
              objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
              opacity: 0.25,
              mixBlendMode: "luminosity",
            }}
          />
          {/* Dark Stage Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 30%, transparent 20%, ${palette.background}ee 75%, ${palette.background} 100%)`,
            }}
          />
        </div>
      )}

      {/* ----------------------------------------------------
          LAYER 3: Top Header (Branding, Stage Badge, Date/Time)
         ---------------------------------------------------- */}
      <header className="relative z-10 flex items-center justify-between">
        {/* Ozone Lounge Branding */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl border"
            style={{
              backgroundColor: `${palette.primary}25`,
              borderColor: `${palette.primary}88`,
              color: palette.accent,
              boxShadow: `0 0 24px ${palette.primary}44`,
            }}
          >
            OZ
          </div>
          <div>
            <h2
              className="text-2xl font-black tracking-widest uppercase leading-none text-white"
              style={{ letterSpacing: "0.15em" }}
            >
              {content.venueName || "OZONE LOUNGE"}
            </h2>
            <p
              className="text-xs font-bold tracking-widest uppercase mt-1"
              style={{ color: palette.accent, letterSpacing: "0.24em" }}
            >
              THURSDAY LIVE STAGE
            </p>
          </div>
        </div>

        {/* Day Pill & Date/Time Badge */}
        <div className="flex flex-col items-end gap-1.5">
          <div
            className="px-5 py-2 rounded-full border text-xs font-black tracking-widest uppercase flex items-center gap-2"
            style={{
              backgroundColor: `${palette.primary}25`,
              borderColor: palette.accent,
              color: palette.text,
              boxShadow: `0 0 20px ${palette.primary}44`,
              fontFamily: labelFontFamily,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: palette.accent }}
            />
            {content.dayLabel || "THURSDAY"} KARAOKE NIGHT
          </div>

          {hasDateTime && (
            <div
              className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5"
              style={{ color: palette.accent }}
            >
              {[content.dateText, content.startTime].filter(Boolean).join(" • ")}
            </div>
          )}
        </div>
      </header>

      {/* ----------------------------------------------------
          LAYER 4: Central Stage Visual & Headline
         ---------------------------------------------------- */}
      <section className="relative z-10 flex flex-col items-center text-center my-auto py-1">
        {/* Vintage Microphone Motif */}
        <div className="relative mb-3 flex flex-col items-center">
          {/* Spotlight Aura Glow Ring */}
          <div
            className="w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-2xl relative"
            style={{
              borderColor: palette.accent,
              backgroundColor: `${palette.primary}25`,
              boxShadow: `0 0 35px ${palette.primary}66`,
            }}
          >
            {/* Vintage Pill Microphone SVG */}
            <svg
              className="w-10 h-10"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Mic pill body */}
              <rect
                x="14"
                y="6"
                width="12"
                height="20"
                rx="6"
                fill={palette.secondary}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <line x1="15" y1="12" x2="25" y2="12" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" />
              <line x1="15" y1="16" x2="25" y2="16" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" />
              <line x1="15" y1="20" x2="25" y2="20" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" />
              {/* U-shape cradle stand */}
              <path
                d="M 10 16 Q 10 28 20 28 Q 30 28 30 16"
                stroke={palette.accent}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line x1="20" y1="28" x2="20" y2="35" stroke={palette.accent} strokeWidth="3" />
              <line x1="13" y1="35" x2="27" y2="35" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Oversized Event Headline */}
        <h1
          className="text-8xl font-black uppercase tracking-tight leading-none mb-3"
          style={{
            fontFamily: displayFontFamily,
            background: `linear-gradient(135deg, #ffffff 15%, ${palette.accent} 55%, ${palette.primary} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 25px ${palette.primary}88, 0 0 45px ${palette.accent}44`,
            filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.85))",
          }}
        >
          {content.eventTitle || "KARAOKE NIGHT"}
        </h1>

        {/* Sing-Along Subtitle */}
        <div className="flex items-center justify-center gap-4 mt-1">
          <span className="w-8 h-0.5" style={{ backgroundColor: palette.primary }} />
          <p
            className="text-sm font-black tracking-widest uppercase"
            style={{
              color: palette.accent,
              letterSpacing: "0.26em",
              fontFamily: labelFontFamily,
            }}
          >
            {content.customLines && content.customLines.length > 0
              ? content.customLines[0]
              : "SING YOUR HEART OUT • LIVE STAGE VIBES"}
          </p>
          <span className="w-8 h-0.5" style={{ backgroundColor: palette.primary }} />
        </div>
      </section>

      {/* ----------------------------------------------------
          LAYER 5: Strict Role Separation (Hosts & DJ Panels)
          Blueprint 4.5 Mandate: "keep host names and DJ name
          in separate editable fields to prevent them becoming
          one difficult-to-scan line. hosts and DJ in clearly
          separated roles."
         ---------------------------------------------------- */}
      {hasAnyPerformer && (
        <section
          className="relative z-10 my-3 p-5 rounded-2xl border-2 shadow-2xl flex items-center justify-between"
          style={{
            backgroundColor: "#1c050eee",
            borderColor: `${palette.primary}88`,
            boxShadow: `0 0 30px ${palette.primary}33`,
          }}
          data-testid="shelby-performer-panel"
        >
          {/* Section A: Hosts Role */}
          {hasHosts && (
            <div
              className={`flex-1 pr-6 ${hasDjs ? "border-r border-rose-900/50" : ""}`}
              data-testid="shelby-hosts-module"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${palette.primary}33`,
                    borderColor: palette.accent,
                    color: palette.accent,
                    fontFamily: labelFontFamily,
                  }}
                >
                  <span>🎤</span> STAGE HOSTS
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300/70">
                  MASTERS OF CEREMONY
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {hostList.map((host, idx) => (
                  <React.Fragment key={idx}>
                    <span
                      className="text-2xl font-black uppercase tracking-wide text-white"
                      style={{
                        fontFamily: displayFontFamily,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {host}
                    </span>
                    {idx < hostList.length - 1 && (
                      <span className="text-xl font-bold" style={{ color: palette.accent }}>
                        &amp;
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Section B: DJ / Sound Role */}
          {hasDjs && (
            <div
              className={`flex-1 ${hasHosts ? "pl-6" : ""}`}
              data-testid="shelby-dj-module"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5"
                  style={{
                    backgroundColor: "#8b5cf633",
                    borderColor: "#c4b5fd",
                    color: "#f5f3ff",
                    fontFamily: labelFontFamily,
                  }}
                >
                  <span>🎧</span> AUDIO &amp; DECKS
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/70">
                  RESIDENT SELECTOR
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {djList.map((dj, idx) => (
                  <React.Fragment key={idx}>
                    <span
                      className="text-2xl font-black uppercase tracking-wide text-white"
                      style={{
                        fontFamily: displayFontFamily,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {dj}
                    </span>
                    {idx < djList.length - 1 && (
                      <span className="text-xl font-bold text-purple-400">
                        &amp;
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ----------------------------------------------------
          LAYER 6: Unmistakable Singer Offer Modules
          Blueprint 4.5 Mandate: "separate 'Free tequila shots
          for singers' from the discounts on gin, rum and vodka
          so the condition is unmistakable."
         ---------------------------------------------------- */}
      {hasAnyOffer && (
        <section
          className="relative z-10 my-3 flex flex-col gap-3"
          data-testid="shelby-offer-container"
        >
          {/* Card A: Singer VIP Tequila Offer (Unmistakable Condition) */}
          {hasPrimaryOffer && (
            <div
              className="relative rounded-2xl overflow-hidden border-2 shadow-2xl flex items-stretch"
              style={{
                backgroundColor: "#220410",
                borderColor: "#eab308",
                boxShadow: "0 0 24px rgba(234, 179, 8, 0.28)",
              }}
              data-testid="shelby-singer-offer-card"
            >
              {/* Left Gold Tequila / Stage Performer Stripe */}
              <div
                className="w-20 shrink-0 flex flex-col items-center justify-center p-3 font-black text-slate-950"
                style={{
                  background: "linear-gradient(180deg, #fef08a 0%, #eab308 50%, #ca8a04 100%)",
                }}
              >
                <span className="text-2xl leading-none">🎤</span>
                <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-center leading-tight">
                  SINGERS
                </span>
              </div>

              {/* Offer Details */}
              <div className="flex-1 p-5 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[11px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded"
                    style={{
                      backgroundColor: "rgba(234, 179, 8, 0.2)",
                      color: "#facc15",
                      fontFamily: labelFontFamily,
                      letterSpacing: "0.15em",
                    }}
                  >
                    FOR SINGERS ONLY • ON STAGE PRIVILEGE
                  </span>
                  <span
                    className="text-xs font-black uppercase tracking-wider text-amber-400"
                    style={{ fontFamily: labelFontFamily }}
                  >
                    COMPLIMENTARY
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

          {/* Card B: General Spirits Discounts Strip */}
          {hasSecondaryOffer && (
            <div
              className="relative rounded-xl overflow-hidden border p-4 flex items-center justify-between"
              style={{
                backgroundColor: "#16030bcc",
                borderColor: `${palette.primary}99`,
                boxShadow: `0 0 16px ${palette.primary}25`,
              }}
              data-testid="shelby-spirits-offer-card"
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
                      color: palette.accent,
                      fontFamily: labelFontFamily,
                      letterSpacing: "0.18em",
                    }}
                  >
                    BAR PRIVILEGES
                  </div>
                  <p className="text-base font-bold text-white tracking-wide">
                    {content.secondaryOffer}
                  </p>
                </div>
              </div>

              <div
                className="px-3 py-1 rounded-full border text-[11px] font-extrabold uppercase shrink-0"
                style={{
                  backgroundColor: `${palette.primary}25`,
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
          LAYER 7: Footer Operational Logistics
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
            <span style={{ color: palette.accent }}>
              {[content.locationText, content.contactText].filter(Boolean).join(" • ")}
            </span>
          )}

          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
            style={{
              backgroundColor: `${palette.primary}25`,
              color: palette.accent,
            }}
          >
            FREE ENTRY • LIVE AUDIENCE WELCOME
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
