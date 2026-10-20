import { FontFamilyDefinition } from "./types";
import { getFontById, getAllFonts } from "./manifest";

const LOADED_FONTS = new Set<string>();

/**
 * Generates valid CSS @font-face rules for a font definition.
 */
export function generateFontFaceCSS(font: FontFamilyDefinition): string {
  return font.variants
    .map((variant) => {
      const formatStr = variant.format === "opentype" ? "opentype" : "truetype";
      return `@font-face {
  font-family: '${font.cssFamily}';
  font-style: ${variant.style};
  font-weight: ${variant.weight};
  font-display: swap;
  src: url('${variant.src}') format('${formatStr}');
}`;
    })
    .join("\n\n");
}

/**
 * Generates CSS @font-face rules for all registered fonts in the catalogue.
 */
export function generateAllFontFaceCSS(): string {
  return getAllFonts().map(generateFontFaceCSS).join("\n\n");
}

/**
 * Injects @font-face declarations into the document for the specified font family.
 * Runs only on the client side.
 */
export function injectFontFace(fontId: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const font = getFontById(fontId);
  if (!font) {
    console.warn(`[FontLoader] Unknown font ID: "${fontId}". Fallback to sans-serif.`);
    return false;
  }

  const styleId = `font-face-${font.id}`;
  if (document.getElementById(styleId)) {
    return true; // Already injected
  }

  try {
    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.textContent = generateFontFaceCSS(font);
    document.head.appendChild(styleEl);
    LOADED_FONTS.add(font.id);
    return true;
  } catch (err) {
    console.error(`[FontLoader] Failed to inject font-face for ${font.displayName}:`, err);
    return false;
  }
}

/**
 * Awaits font readiness in the browser using document.fonts.ready and document.fonts.check().
 * Ensures fonts are decoded before canvas rasterization/export.
 */
export async function waitForFontsReady(
  fontIds: string[] = [],
  timeoutMs: number = 3000
): Promise<{ ready: boolean; failedFonts: string[] }> {
  if (typeof window === "undefined" || !("fonts" in document)) {
    return { ready: true, failedFonts: [] };
  }

  // Inject any missing font faces
  for (const id of fontIds) {
    injectFontFace(id);
  }

  const failedFonts: string[] = [];

  const waitPromise = (async () => {
    // Wait for the browser's global font loading set to settle
    await document.fonts.ready;

    // Check specific required font faces
    for (const id of fontIds) {
      const font = getFontById(id);
      if (!font) continue;

      const isAvailable = font.variants.some((v) =>
        document.fonts.check(`${v.weight} 16px "${font.cssFamily}"`)
      );

      if (!isAvailable) {
        failedFonts.push(font.displayName);
      }
    }

    return {
      ready: failedFonts.length === 0,
      failedFonts,
    };
  })();

  const timeoutPromise = new Promise<{ ready: boolean; failedFonts: string[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        ready: false,
        failedFonts: fontIds.map((id) => getFontById(id)?.displayName || id),
      });
    }, timeoutMs);
  });

  return Promise.race([waitPromise, timeoutPromise]);
}
