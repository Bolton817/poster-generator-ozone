export type FontFormat = "truetype" | "opentype";

export type FontRole = "display" | "heading" | "body" | "numeral" | "accent";

export interface FontVariant {
  weight: number;
  style: "normal" | "italic";
  src: string; // URL path, e.g. "/fonts/Inter-Variable.ttf"
  format: FontFormat;
}

export interface FontFamilyDefinition {
  id: string; // Stable internal identifier, e.g. "inter", "source-sans", "bebas-neue"
  displayName: string;
  cssFamily: string; // CSS font-family name registered in @font-face
  category: "sans-serif" | "serif" | "display" | "monospace";
  variants: FontVariant[];
  supportedRoles: FontRole[];
  license: string;
  isCustomUploaded?: boolean;
}

export interface TypographyPreset {
  id: string;
  name: string;
  description: string;
  displayFontId: string;
  headingFontId: string;
  bodyFontId: string;
  numeralFontId: string;
}
