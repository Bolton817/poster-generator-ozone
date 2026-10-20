import { FontFamilyDefinition, TypographyPreset } from "./types";

export const FONT_CATALOGUE: Record<string, FontFamilyDefinition> = {
  inter: {
    id: "inter",
    displayName: "Inter",
    cssFamily: "Inter",
    category: "sans-serif",
    variants: [
      {
        weight: 400,
        style: "normal",
        src: "/fonts/Inter-Variable.ttf",
        format: "truetype",
      },
      {
        weight: 600,
        style: "normal",
        src: "/fonts/Inter-Variable.ttf",
        format: "truetype",
      },
      {
        weight: 700,
        style: "normal",
        src: "/fonts/Inter-Variable.ttf",
        format: "truetype",
      },
    ],
    supportedRoles: ["body", "heading", "numeral"],
    license: "SIL Open Font License 1.1",
  },
  "source-sans": {
    id: "source-sans",
    displayName: "Source Sans 3 Bold",
    cssFamily: "Source Sans 3",
    category: "sans-serif",
    variants: [
      {
        weight: 700,
        style: "normal",
        src: "/fonts/SourceSans3-Bold.otf",
        format: "opentype",
      },
    ],
    supportedRoles: ["display", "heading", "body"],
    license: "SIL Open Font License 1.1",
  },
  "bebas-neue": {
    id: "bebas-neue",
    displayName: "Bebas Neue",
    cssFamily: "Bebas Neue",
    category: "display",
    variants: [
      {
        weight: 400,
        style: "normal",
        src: "/fonts/BebasNeue-Regular.ttf",
        format: "truetype",
      },
    ],
    supportedRoles: ["display", "numeral"],
    license: "SIL Open Font License 1.1",
  },
};

export const TYPOGRAPHY_PRESETS: Record<string, TypographyPreset> = {
  "modern-bold": {
    id: "modern-bold",
    name: "Modern Punchy",
    description: "Impactful condensed display with clean geometric sans-serif body",
    displayFontId: "bebas-neue",
    headingFontId: "source-sans",
    bodyFontId: "inter",
    numeralFontId: "bebas-neue",
  },
  "editorial-clean": {
    id: "editorial-clean",
    name: "Clean Editorial",
    description: "Balanced sans-serif hierarchy for maximum multi-role legibility",
    displayFontId: "source-sans",
    headingFontId: "source-sans",
    bodyFontId: "inter",
    numeralFontId: "inter",
  },
};

export function getFontById(id: string): FontFamilyDefinition | undefined {
  return FONT_CATALOGUE[id];
}

export function getAllFonts(): FontFamilyDefinition[] {
  return Object.values(FONT_CATALOGUE);
}

export function getTypographyPresetById(id: string): TypographyPreset | undefined {
  return TYPOGRAPHY_PRESETS[id];
}
