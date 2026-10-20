# Ozone Lounge Poster Generator — Font Inventory & Typography Catalogue

## Overview
This document tracks all font families, weights, licensed roles, file formats, and licensing notes supported by the Ozone Lounge Poster Generator in accordance with **Stage 06** of the Technical Design Document (TDD v1.0).

---

## Font Family Registry

| Family ID | Display Name | Format | Weights Available | Primary Roles | File Path | License / Provenance | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `inter` | Inter | TTF | 400 (Regular), 600 (SemiBold), 700 (Bold) | `body`, `label`, `numeral` | `/fonts/Inter-Variable.ttf` | SIL Open Font License (OFL) | Active / Verified File |
| `source-sans` | Source Sans 3 Bold | OTF | 700 (Bold) | `display`, `heading`, `label` | `/fonts/SourceSans3-Bold.otf` | SIL Open Font License (OFL) | Active / Verified File |
| `bebas-neue` | Bebas Neue | TTF | 400 (Bold Headline / Display) | `display`, `numeral` | `/fonts/BebasNeue-Regular.ttf` | SIL Open Font License (OFL) | Active / Verified File |

---

## Role Definitions & Typographic Hierarchy

1. **`display`**:
   - Used for the primary event title (e.g. "Old Classics & Sundowners", "Groovy Wednesday", "Karaoke Night").
   - Characterized by distinct personality, high visual weight, and strong brand presence.
2. **`heading`**:
   - Used for weekday label (e.g. "Monday", "Tuesday"), offer banner headers, and performer section titles.
3. **`body`**:
   - Used for supporting copy, venue information ("Ozone Lounge"), contact numbers, and entry conditions.
   - Optimized for maximum legibility at small sizes.
4. **`numeral`**:
   - Used for start times (e.g. "4:00 PM"), dates ("24 OCT"), and percentage discounts.
   - High legibility, tabular or monospace alignment characteristics where applicable.

---

## Loading & Performance Rules
1. **On-Demand Loading**: Fonts are not loaded simultaneously. Only the fonts required by the active template's chosen typography preset are loaded into the document DOM.
2. **Preflight Readiness**: Before rasterization/export in Stage 07 & Stage 12, the system awaits `document.fonts.ready` and verifies loaded font faces via `document.fonts.check()` to eliminate font-swap visual defects.
3. **Graceful Fallbacks**: If a custom font fails to fetch, the canvas falls back to standard system sans-serif (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) with an explicit operator warning.
