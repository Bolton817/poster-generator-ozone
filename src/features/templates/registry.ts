import {
  TemplateId,
  PosterDocument,
  PosterDocumentSchema,
} from "../poster/schema";

export interface PalettePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface TypographyPreset {
  id: string;
  name: string;
  displayFont: string;
  bodyFont: string;
  labelFont: string;
}

export interface LayoutOption {
  id: string;
  name: string;
  description?: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 1 = Mon ... 6 = Sat, 0 = Sun
  dayLabel: string;
  eventTitle: string;
  tag: string;
  description: string;
  templateVersion: number;
  palettePresets: PalettePreset[];
  typographyPresets: TypographyPreset[];
  layoutOptions: LayoutOption[];
  supportedImageSlots: Array<"background" | "performer" | "texture">;
  thumbnailUrl?: string;
  defaults: PosterDocument;
}

// ----------------------------------------------------
// Canonical Document Factory
// ----------------------------------------------------

export function createDefaultPosterDocument(
  templateId: TemplateId,
  name?: string
): PosterDocument {
  const tpl = TEMPLATES_REGISTRY[templateId];
  if (!tpl) {
    throw new Error(`Unknown template ID: "${templateId}"`);
  }

  return {
    schemaVersion: 1,
    templateId,
    templateVersion: tpl.templateVersion,
    name: name || `${tpl.dayLabel} — ${tpl.eventTitle}`,
    canvas: {
      width: 1080,
      height: 1350,
      format: "portrait-4x5",
    },
    content: {
      dayLabel: tpl.dayLabel,
      eventTitle: tpl.eventTitle,
      dateText: "",
      startTime: "",
      venueName: "Ozone Lounge",
      locationText: "",
      contactText: "",
      socialHandle: "@ozonelounge",
      primaryOffer: tpl.defaults.content.primaryOffer,
      secondaryOffer: tpl.defaults.content.secondaryOffer,
      djNames: [...tpl.defaults.content.djNames],
      hostNames: [...tpl.defaults.content.hostNames],
      customLines: [],
    },
    assets: {
      logoAssetId: null,
      backgroundAssetId: null,
      secondaryAssetIds: [],
    },
    styling: {
      paletteId: tpl.palettePresets[0]?.id || "default",
      typographyPresetId: tpl.typographyPresets[0]?.id || "default",
      layoutOptionId: tpl.layoutOptions[0]?.id || "default",
      decorationOptions: {},
      focalPoints: {
        background: { x: 0.5, y: 0.5 },
      },
    },
  };
}

// ----------------------------------------------------
// The Seven Weekly Template Definitions
// ----------------------------------------------------

export const TEMPLATES_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  reddington: {
    id: "reddington",
    name: "Reddington",
    dayOfWeek: 1,
    dayLabel: "Monday",
    eventTitle: "Old Classics & Sundowners",
    tag: "Best for Monday Sundowners",
    description: "Retro classics, sunset colours and vintage music aesthetics.",
    templateVersion: 1,
    thumbnailUrl: "/template-thumbnails/reddington.svg",
    palettePresets: [
      {
        id: "sunset-ember",
        name: "Sunset Ember",
        primary: "#f97316",
        secondary: "#fdba74",
        accent: "#fbbf24",
        background: "#1c1917",
        text: "#fafaf9",
      },
      {
        id: "golden-hour",
        name: "Golden Hour",
        primary: "#eab308",
        secondary: "#fde047",
        accent: "#d97706",
        background: "#18181b",
        text: "#f4f4f5",
      },
      {
        id: "vinyl-noir",
        name: "Vinyl Noir",
        primary: "#d4d4d8",
        secondary: "#71717a",
        accent: "#e4e4e7",
        background: "#09090b",
        text: "#ffffff",
      },
    ],
    typographyPresets: [
      {
        id: "retro-groove",
        name: "Retro Groove & Sturdy Sans",
        displayFont: "serif",
        bodyFont: "sans-serif",
        labelFont: "sans-serif",
      },
    ],
    layoutOptions: [
      { id: "full-bleed-sunset", name: "Full Bleed Sunset" },
      { id: "vinyl-anchor", name: "Vinyl Anchor" },
    ],
    supportedImageSlots: ["background", "texture"],
    defaults: {
      schemaVersion: 1,
      templateId: "reddington",
      templateVersion: 1,
      name: "Monday — Old Classics & Sundowners",
      canvas: { width: 1080, height: 1350, format: "portrait-4x5" },
      content: {
        dayLabel: "Monday",
        eventTitle: "Old Classics & Sundowners",
        dateText: "",
        startTime: "",
        venueName: "Ozone Lounge",
        locationText: "",
        contactText: "",
        socialHandle: "@ozonelounge",
        primaryOffer: "Discounts on all drinks, excluding wine.",
        secondaryOffer: "",
        djNames: ["Monsieur Pierre"],
        hostNames: [],
        customLines: [],
      },
      assets: { logoAssetId: null, backgroundAssetId: null, secondaryAssetIds: [] },
      styling: {
        paletteId: "sunset-ember",
        typographyPresetId: "retro-groove",
        layoutOptionId: "full-bleed-sunset",
        decorationOptions: { showVinylDecal: true },
        focalPoints: { background: { x: 0.5, y: 0.5 } },
      },
    },
  },

  saint: {
    id: "saint",
    name: "Saint",
    dayOfWeek: 2,
    dayLabel: "Tuesday",
    eventTitle: "African Night (Afro)",
    tag: "Best for Afrobeat Nights",
    description: "African-inspired patterns, Afrobeat energy and bold colours.",
    templateVersion: 1,
    palettePresets: [
      {
        id: "saffron-ink",
        name: "Saffron & Ink",
        primary: "#eab308",
        secondary: "#ca8a04",
        accent: "#f59e0b",
        background: "#0f172a",
        text: "#f8fafc",
      },
      {
        id: "electric-azure",
        name: "Electric Azure",
        primary: "#06b6d4",
        secondary: "#0284c7",
        accent: "#38bdf8",
        background: "#030712",
        text: "#f9fafb",
      },
      {
        id: "terracotta-pulse",
        name: "Terracotta Pulse",
        primary: "#f97316",
        secondary: "#ea580c",
        accent: "#fb923c",
        background: "#1c1917",
        text: "#fafaf9",
      },
    ],
    typographyPresets: [
      {
        id: "bold-afrobeat",
        name: "Geometric Afro Display",
        displayFont: "sans-serif",
        bodyFont: "sans-serif",
        labelFont: "sans-serif",
      },
    ],
    layoutOptions: [
      { id: "geometric-frame", name: "Geometric Frame" },
      { id: "pattern-pulse", name: "Pattern Pulse" },
    ],
    supportedImageSlots: ["background", "texture"],
    defaults: {
      schemaVersion: 1,
      templateId: "saint",
      templateVersion: 1,
      name: "Tuesday — African Night (Afro)",
      canvas: { width: 1080, height: 1350, format: "portrait-4x5" },
      content: {
        dayLabel: "Tuesday",
        eventTitle: "African Night (Afro)",
        dateText: "",
        startTime: "",
        venueName: "Ozone Lounge",
        locationText: "",
        contactText: "",
        socialHandle: "@ozonelounge",
        primaryOffer: "Discounts on beer buckets and cocktails.",
        secondaryOffer: "",
        djNames: ["DJ Neb", "DVJ Jojez"],
        hostNames: [],
        customLines: [],
      },
      assets: { logoAssetId: null, backgroundAssetId: null, secondaryAssetIds: [] },
      styling: {
        paletteId: "saffron-ink",
        typographyPresetId: "bold-afrobeat",
        layoutOptionId: "geometric-frame",
        decorationOptions: { patternDensity: "medium" },
        focalPoints: { background: { x: 0.5, y: 0.5 } },
      },
    },
  },

  lannister: {
    id: "lannister",
    name: "Lannister",
    dayOfWeek: 3,
    dayLabel: "Wednesday",
    eventTitle: "Groovy Wednesday",
    tag: "Best for Midweek Groove",
    description: "Groovy disco aesthetics, neon lights and dance-floor energy.",
    templateVersion: 1,
    palettePresets: [
      {
        id: "ultraviolet-club",
        name: "Ultraviolet Club",
        primary: "#a855f7",
        secondary: "#c084fc",
        accent: "#e879f9",
        background: "#090514",
        text: "#fdf4ff",
      },
      {
        id: "lime-magenta",
        name: "Lime & Magenta",
        primary: "#84cc16",
        secondary: "#ec4899",
        accent: "#a3e635",
        background: "#080c05",
        text: "#f7fee7",
      },
      {
        id: "cyan-after-dark",
        name: "Cyan After Dark",
        primary: "#06b6d4",
        secondary: "#22d3ee",
        accent: "#67e8f9",
        background: "#041017",
        text: "#ecfeff",
      },
    ],
    typographyPresets: [
      {
        id: "disco-expanded",
        name: "Disco Headline & Modern Sans",
        displayFont: "sans-serif",
        bodyFont: "sans-serif",
        labelFont: "sans-serif",
      },
    ],
    layoutOptions: [
      { id: "neon-glow-center", name: "Neon Glow Center" },
      { id: "separated-offer-card", name: "Separated Offer Card" },
    ],
    supportedImageSlots: ["background", "texture"],
    defaults: {
      schemaVersion: 1,
      templateId: "lannister",
      templateVersion: 1,
      name: "Wednesday — Groovy Wednesday",
      canvas: { width: 1080, height: 1350, format: "portrait-4x5" },
      content: {
        dayLabel: "Wednesday",
        eventTitle: "Groovy Wednesday",
        dateText: "",
        startTime: "",
        venueName: "Ozone Lounge",
        locationText: "",
        contactText: "",
        socialHandle: "@ozonelounge",
        primaryOffer: "Free koroga chicken on the house.",
        secondaryOffer: "Discounts on whiskey bottles, cognac and beer buckets.",
        djNames: ["DJ Donben", "DJ Vin"],
        hostNames: [],
        customLines: [],
      },
      assets: { logoAssetId: null, backgroundAssetId: null, secondaryAssetIds: [] },
      styling: {
        paletteId: "ultraviolet-club",
        typographyPresetId: "disco-expanded",
        layoutOptionId: "neon-glow-center",
        decorationOptions: { glowStrength: "high" },
        focalPoints: { background: { x: 0.5, y: 0.5 } },
      },
    },
  },

  shelby: {
    id: "shelby",
    name: "Shelby",
    dayOfWeek: 4,
    dayLabel: "Thursday",
    eventTitle: "Karaoke Night",
    tag: "Best for Karaoke Night",
    description: "Microphones, stage spotlights and a lively sing-along atmosphere.",
    templateVersion: 1,
    palettePresets: [
      {
        id: "stage-crimson",
        name: "Stage Crimson",
        primary: "#e11d48",
        secondary: "#f43f5e",
        accent: "#fda4af",
        background: "#120206",
        text: "#fff1f2",
      },
      {
        id: "midnight-violet",
        name: "Midnight Violet",
        primary: "#8b5cf6",
        secondary: "#a78bfa",
        accent: "#c4b5fd",
        background: "#0c061a",
        text: "#f5f3ff",
      },
      {
        id: "spotlight-gold",
        name: "Spotlight Gold",
        primary: "#eab308",
        secondary: "#fde047",
        accent: "#facc15",
        background: "#141003",
        text: "#fefce8",
      },
    ],
    typographyPresets: [
      {
        id: "theatrical-stage",
        name: "Dramatic Headline & Condensed Roles",
        displayFont: "serif",
        bodyFont: "sans-serif",
        labelFont: "sans-serif",
      },
    ],
    layoutOptions: [
      { id: "spotlight-cone", name: "Spotlight Cone" },
      { id: "split-role-stage", name: "Split Role Stage" },
    ],
    supportedImageSlots: ["background", "performer"],
    defaults: {
      schemaVersion: 1,
      templateId: "shelby",
      templateVersion: 1,
      name: "Thursday — Karaoke Night",
      canvas: { width: 1080, height: 1350, format: "portrait-4x5" },
      content: {
        dayLabel: "Thursday",
        eventTitle: "Karaoke Night",
        dateText: "",
        startTime: "",
        venueName: "Ozone Lounge",
        locationText: "",
        contactText: "",
        socialHandle: "@ozonelounge",
        primaryOffer: "Free tequila shots for singers.",
        secondaryOffer: "Discounts on gin, rum and vodka.",
        djNames: ["DJ Fab"],
        hostNames: ["Bellah Harriet", "Tito Wagithomo"],
        customLines: [],
      },
      assets: { logoAssetId: null, backgroundAssetId: null, secondaryAssetIds: [] },
      styling: {
        paletteId: "stage-crimson",
        typographyPresetId: "theatrical-stage",
        layoutOptionId: "spotlight-cone",
        decorationOptions: { spotlightAngle: 45 },
        focalPoints: { background: { x: 0.5, y: 0.5 } },
      },
    },
  },

  lothbrok: {
    id: "lothbrok",
    name: "Lothbrok",
    dayOfWeek: 5,
    dayLabel: "Friday",
    eventTitle: "Flight Fridays",
    tag: "Best for Premium Fridays",
    description: "Premium nightlife, energetic DJ visuals and a high-energy Friday atmosphere.",
    templateVersion: 1,
    palettePresets: [
      {
        id: "black-chrome",
        name: "Black & Chrome",
        primary: "#f8fafc",
        secondary: "#94a3b8",
        accent: "#e2e8f0",
        background: "#020617",
        text: "#ffffff",
      },
      {
        id: "ice-blue",
        name: "Ice Blue",
        primary: "#38bdf8",
        secondary: "#7dd3fc",
        accent: "#bae6fd",
        background: "#082f49",
        text: "#f0f9ff",
      },
      {
        id: "aubergine-luxe",
        name: "Aubergine Luxe",
        primary: "#c084fc",
        secondary: "#e879f9",
        accent: "#f0abfc",
        background: "#180520",
        text: "#fae8ff",
      },
    ],
    typographyPresets: [
      {
        id: "premium-sharp",
        name: "Striking Premium Display",
        displayFont: "sans-serif",
        bodyFont: "sans-serif",
        labelFont: "sans-serif",
      },
    ],
    layoutOptions: [
      { id: "diagonal-split", name: "Diagonal Split" },
      { id: "hero-focus-no-offer", name: "Balanced Hero (No Offer)" },
    ],
    supportedImageSlots: ["background"],
    defaults: {
      schemaVersion: 1,
      templateId: "lothbrok",
      templateVersion: 1,
      name: "Friday — Flight Fridays",
      canvas: { width: 1080, height: 1350, format: "portrait-4x5" },
      content: {
        dayLabel: "Friday",
        eventTitle: "Flight Fridays",
        dateText: "",
        startTime: "",
        venueName: "Ozone Lounge",
        locationText: "",
        contactText: "",
        socialHandle: "@ozonelounge",
        primaryOffer: "", // Intentionally empty per brief
        secondaryOffer: "",
        djNames: ["DJ Slim D", "Mistabrand"],
        hostNames: [],
        customLines: [],
      },
      assets: { logoAssetId: null, backgroundAssetId: null, secondaryAssetIds: [] },
      styling: {
        paletteId: "black-chrome",
        typographyPresetId: "premium-sharp",
        layoutOptionId: "hero-focus-no-offer",
        decorationOptions: { metallicAccents: true },
        focalPoints: { background: { x: 0.5, y: 0.5 } },
      },
    },
  },

  escobar: {
    id: "escobar",
    name: "Escobar",
    dayOfWeek: 6,
    dayLabel: "Saturday",
    eventTitle: "Saturday Fiesta",
    tag: "Best for Saturday Fiesta",
    description: "Fiesta energy, colourful lights and a vibrant weekend celebration.",
    templateVersion: 1,
    palettePresets: [
      {
        id: "fiesta-citrus",
        name: "Fiesta Citrus",
        primary: "#f59e0b",
        secondary: "#ef4444",
        accent: "#10b981",
        background: "#180a04",
        text: "#fffbeb",
      },
      {
        id: "coral-electric",
        name: "Coral Electric",
        primary: "#fb7185",
        secondary: "#f43f5e",
        accent: "#fda4af",
        background: "#17040a",
        text: "#fff1f2",
      },
      {
        id: "purple-gold",
        name: "Purple & Gold",
        primary: "#eab308",
        secondary: "#a855f7",
        accent: "#facc15",
        background: "#13041c",
        text: "#fdf4ff",
      },
    ],
    typographyPresets: [
      {
        id: "celebration-heavy",
        name: "Festive Rounded & Condensed",
        displayFont: "sans-serif",
        bodyFont: "sans-serif",
        labelFont: "sans-serif",
      },
    ],
    layoutOptions: [
      { id: "color-blocks", name: "Layered Color Blocks" },
      { id: "fiesta-burst", name: "Fiesta Burst" },
    ],
    supportedImageSlots: ["background", "texture"],
    defaults: {
      schemaVersion: 1,
      templateId: "escobar",
      templateVersion: 1,
      name: "Saturday — Saturday Fiesta",
      canvas: { width: 1080, height: 1350, format: "portrait-4x5" },
      content: {
        dayLabel: "Saturday",
        eventTitle: "Saturday Fiesta",
        dateText: "",
        startTime: "",
        venueName: "Ozone Lounge",
        locationText: "",
        contactText: "",
        socialHandle: "@ozonelounge",
        primaryOffer: "Discounts on whiskey bottles and cognac.",
        secondaryOffer: "",
        djNames: ["DVJ Jojez"],
        hostNames: [],
        customLines: [],
      },
      assets: { logoAssetId: null, backgroundAssetId: null, secondaryAssetIds: [] },
      styling: {
        paletteId: "fiesta-citrus",
        typographyPresetId: "celebration-heavy",
        layoutOptionId: "color-blocks",
        decorationOptions: { lightOrbs: true },
        focalPoints: { background: { x: 0.5, y: 0.5 } },
      },
    },
  },

  pinkman: {
    id: "pinkman",
    name: "Pinkman",
    dayOfWeek: 0,
    dayLabel: "Sunday",
    eventTitle: "Old Skool Sundays",
    tag: "Best for Old Skool Sundays",
    description: "Throwback music, vinyl records, nostalgic classics and relaxed Sunday vibes.",
    templateVersion: 1,
    palettePresets: [
      {
        id: "amber-memory",
        name: "Amber Memory",
        primary: "#d97706",
        secondary: "#b45309",
        accent: "#f59e0b",
        background: "#1c1407",
        text: "#fef3c7",
      },
      {
        id: "faded-teal",
        name: "Faded Teal",
        primary: "#14b8a6",
        secondary: "#0f766e",
        accent: "#2dd4bf",
        background: "#041a18",
        text: "#ccfbf1",
      },
      {
        id: "brick-cream",
        name: "Brick & Cream",
        primary: "#dc2626",
        secondary: "#ea580c",
        accent: "#fed7aa",
        background: "#1a0808",
        text: "#fff7ed",
      },
    ],
    typographyPresets: [
      {
        id: "throwback-nostalgia",
        name: "Vintage Headline & Clean Body",
        displayFont: "serif",
        bodyFont: "sans-serif",
        labelFont: "sans-serif",
      },
    ],
    layoutOptions: [
      { id: "cassette-vinyl-motif", name: "Vinyl / Cassette Motif" },
      { id: "nostalgic-grid", name: "Nostalgic Grid" },
    ],
    supportedImageSlots: ["background", "texture"],
    defaults: {
      schemaVersion: 1,
      templateId: "pinkman",
      templateVersion: 1,
      name: "Sunday — Old Skool Sundays",
      canvas: { width: 1080, height: 1350, format: "portrait-4x5" },
      content: {
        dayLabel: "Sunday",
        eventTitle: "Old Skool Sundays",
        dateText: "",
        startTime: "",
        venueName: "Ozone Lounge",
        locationText: "",
        contactText: "",
        socialHandle: "@ozonelounge",
        primaryOffer: "Discounts on beer buckets.",
        secondaryOffer: "",
        djNames: ["DJ Ngash"],
        hostNames: [],
        customLines: [],
      },
      assets: { logoAssetId: null, backgroundAssetId: null, secondaryAssetIds: [] },
      styling: {
        paletteId: "amber-memory",
        typographyPresetId: "throwback-nostalgia",
        layoutOptionId: "cassette-vinyl-motif",
        decorationOptions: { showRecordGrooves: true },
        focalPoints: { background: { x: 0.5, y: 0.5 } },
      },
    },
  },
};

// ----------------------------------------------------
// Ordered Template IDs (Monday to Sunday)
// ----------------------------------------------------

export const ORDERED_TEMPLATE_IDS: TemplateId[] = [
  "reddington",
  "saint",
  "lannister",
  "shelby",
  "lothbrok",
  "escobar",
  "pinkman",
];

// ----------------------------------------------------
// Single Source Query Utilities
// ----------------------------------------------------

export function getTemplatesInOrder(): TemplateDefinition[] {
  return ORDERED_TEMPLATE_IDS.map((id) => TEMPLATES_REGISTRY[id]);
}

export function getTemplateById(id: string): TemplateDefinition | undefined {
  if (id in TEMPLATES_REGISTRY) {
    return TEMPLATES_REGISTRY[id as TemplateId];
  }
  return undefined;
}

export function validatePosterDocument(data: unknown) {
  return PosterDocumentSchema.safeParse(data);
}
