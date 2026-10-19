import { z } from "zod";

// ----------------------------------------------------
// Template Identifiers
// ----------------------------------------------------

export const TemplateIdSchema = z.enum([
  "reddington",
  "saint",
  "lannister",
  "shelby",
  "lothbrok",
  "escobar",
  "pinkman",
]);

export type TemplateId = z.infer<typeof TemplateIdSchema>;

// ----------------------------------------------------
// Master Canvas Configuration
// ----------------------------------------------------

export const CanvasConfigSchema = z.object({
  width: z.literal(1080),
  height: z.literal(1350),
  format: z.literal("portrait-4x5"),
});

export type CanvasConfig = z.infer<typeof CanvasConfigSchema>;

// ----------------------------------------------------
// Event Content Specification
// ----------------------------------------------------

export const PosterContentSchema = z.object({
  dayLabel: z.string(),
  eventTitle: z.string().min(1, "Event title is required"),
  dateText: z.string().default(""),
  startTime: z.string().default(""),
  venueName: z.string().default("Ozone Lounge"),
  locationText: z.string().default(""),
  contactText: z.string().default(""),
  socialHandle: z.string().default("@ozonelounge"),
  primaryOffer: z.string().default(""),
  secondaryOffer: z.string().default(""),
  djNames: z.array(z.string()).default([]),
  hostNames: z.array(z.string()).default([]),
  customLines: z.array(z.string()).default([]),
});

export type PosterContent = z.infer<typeof PosterContentSchema>;

// ----------------------------------------------------
// Media & Asset Slot References
// ----------------------------------------------------

export const PosterAssetsSchema = z.object({
  logoAssetId: z.string().nullable().default(null),
  backgroundAssetId: z.string().nullable().default(null),
  secondaryAssetIds: z.array(z.string()).default([]),
});

export type PosterAssets = z.infer<typeof PosterAssetsSchema>;

// ----------------------------------------------------
// Normalized Focal Point Coordinates (0..1)
// ----------------------------------------------------

export const FocalPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export type FocalPoint = z.infer<typeof FocalPointSchema>;

// ----------------------------------------------------
// Styling, Palettes & Curated Decoration
// ----------------------------------------------------

export const PosterStylingSchema = z.object({
  paletteId: z.string().default("default"),
  typographyPresetId: z.string().default("default"),
  layoutOptionId: z.string().default("default"),
  decorationOptions: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  focalPoints: z.record(z.string(), FocalPointSchema).default({
    background: { x: 0.5, y: 0.5 },
  }),
});

export type PosterStyling = z.infer<typeof PosterStylingSchema>;

// ----------------------------------------------------
// Canonical PosterDocument Contract
// ----------------------------------------------------

export const PosterDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  templateId: TemplateIdSchema,
  templateVersion: z.number().int().positive().default(1),
  name: z.string().min(1, "Draft name cannot be empty"),
  canvas: CanvasConfigSchema,
  content: PosterContentSchema,
  assets: PosterAssetsSchema,
  styling: PosterStylingSchema,
  updatedAt: z.string().optional(),
});

export type PosterDocument = z.infer<typeof PosterDocumentSchema>;
