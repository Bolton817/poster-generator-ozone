# Ozone Lounge Poster Generator — Developer Handover Guide

**Version**: 1.0.0  
**Target Audience**: Software Engineers, Technical Maintainers & DevOps  
**Repository**: `https://github.com/Bolton817/poster-generator-ozone.git`

---

## 1. Architectural Overview

The **Ozone Lounge Poster Generator** is built as an authenticated, mobile-first web application designed to guarantee visual consistency and coordinate isolation across 7 distinct weekly entertainment templates.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  Next.js 15 App Router (React 19) · Tailwind CSS            │
│  Responsive Canvas Viewport (Fixed 1080×1350 Coordinate DOM)│
│  html-to-image Rasterization Engine · JSZip Packaging       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Next.js API Routes                     │
│  /api/auth/* · /api/drafts/* · /api/assets/upload           │
│  Server-Side Authentication & Session Validation            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                      │
│  Supabase Auth (JWT & Session Management)                   │
│  PostgreSQL (Drafts & User Metadata)                        │
│  Storage: Local FS Adapter OR Supabase Storage Bucket       │
└─────────────────────────────────────────────────────────────┘
```

### Core Architectural Invariants
1. **Master Dimension Invariant**: The master canvas is strictly fixed at `1080 × 1350 px` (4:5 portrait aspect ratio). All visual components render against this fixed unscaled coordinate space.
2. **Two-Tier Viewport Scaling**: Responsive scaling on mobile devices is handled by `CanvasViewport` and `useResponsiveCanvas` via outer reservation divs and inner CSS `transform: scale(s)` transforms from origin `(0, 0)`. The DOM dimensions are never mutated by viewport scale or pinch zoom.
3. **No Invented Copy (Decision 04/05)**: Blank logistics fields (e.g. missing dates or times) cleanly omit their visual blocks without rendering fallback placeholder text.
4. **Friday Offer Exemption (Decision 06)**: Lothbrok (Friday Flight Fridays) enforces strictly empty strings for promotional offers.
5. **Multi-Tenant Ownership Isolation (Decision 08)**: All draft mutations filter by authenticated `userId`.

---

## 2. Project Directory Structure

```
.
├── docs/                             # Architecture blueprints & operational docs
│   ├── deployment-guide.md           # Production deployment & environment setup
│   ├── developer-handover.md         # This developer guide
│   ├── known-limitations.md          # Technical and operational boundaries
│   ├── operator-quick-start.md       # Lounge operator workflow guide
│   ├── release-notes-v1.0.md         # v1.0.0 release notes and changelog
│   └── uat-acceptance-matrix.md      # Verification matrix for ACC-01 through ACC-10
├── public/                           # Static assets, fonts, vector thumbnails
│   ├── template-thumbnails/          # Dedicated SVG vector previews (7 templates)
│   └── uploads/                      # Local development file storage directory
├── scripts/                          # Automated verification and test suites
│   ├── test-stage21-deployment.ts    # Deployment and operational health test
│   └── test-stage22-uat.ts           # Canonical 10-point UAT acceptance suite
├── src/
│   ├── app/                          # Next.js 15 App Router pages & API handlers
│   │   ├── (auth)/login/             # Public authentication entrypoint
│   │   ├── app/                      # Authenticated workspace routes
│   │   │   ├── editor/page.tsx       # Interactive poster studio
│   │   │   └── page.tsx              # Template gallery & drafts list
│   │   └── api/                      # Protected REST endpoints
│   ├── components/                   # Reusable UI & presentation components
│   │   ├── canvas/                   # Diagnostic and canvas POC tools
│   │   ├── drafts/                   # Draft management modals & cards
│   │   ├── editor/                   # Editor controls, panels, toolbars
│   │   ├── gallery/                  # Weekly template cards & draft grids
│   │   ├── poster/templates/         # The 7 Dedicated React Template Renderers
│   │   └── ui/                       # Accessible UI primitives (Button, Dialog, etc.)
│   ├── features/                     # Domain modules with typed contracts
│   │   ├── auth/                     # Supabase auth hooks & session utilities
│   │   ├── canvas/                   # Master canvas constants, hooks & viewport
│   │   ├── drafts/                   # Draft CRUD actions & storage
│   │   ├── export/                   # Rasterizer, Web Share API & zip packaging
│   │   ├── poster/                   # Zod schemas (PosterDocumentSchema)
│   │   ├── preview/                  # Preflight checklist evaluation logic
│   │   └── templates/                # Registry, presets, and renderer resolvers
│   └── lib/                          # Core infrastructure & adapters
│       ├── env.ts                    # Type-safe environment validation
│       ├── logger.ts                 # Structured operational logging with redaction
│       ├── supabase/                 # Supabase client & server instances
│       └── storage/                  # Pluggable storage (Local FS vs Supabase)
```

---

## 3. Tutorial: Adding a New Template (e.g. Template 08)

To introduce a new template (e.g., `Template 08: Sunday Brunch` or `Special Event`), execute the following standard sequence:

### Step 1: Update Domain Schema
Add the new template ID union in `src/features/poster/schema.ts`:
```ts
export const TemplateIdSchema = z.enum([
  "reddington",
  "saint",
  "lannister",
  "shelby",
  "lothbrok",
  "escobar",
  "pinkman",
  "brunch", // <-- Add new template identifier
]);
export type TemplateId = z.infer<typeof TemplateIdSchema>;
```

### Step 2: Register Template in Registry
In `src/features/templates/registry.ts`:
1. Add the ID to `ORDERED_TEMPLATE_IDS`.
2. Define the `TemplateDefinition` entry in `TEMPLATES_REGISTRY`:
   - Day assignment (`dayOfWeek`, `dayLabel`).
   - Tagline, description, default event title.
   - At least 3 curated palette presets.
   - At least 2 typography pairings.
   - At least 2 layout options.
   - Canonical `defaults` document.

### Step 3: Add Vector Thumbnail
Create an SVG preview card in `public/template-thumbnails/brunch.svg` with representative branding geometry.

### Step 4: Implement Dedicated Renderer
Create `src/components/poster/templates/BrunchTemplate.tsx`:
```tsx
import React from "react";
import { PosterDocument } from "@/features/poster/schema";
import { getTemplateById } from "@/features/templates/registry";

export function BrunchTemplate({ document, className = "", style = {} }: { document: PosterDocument; className?: string; style?: React.CSSProperties }) {
  // Render within 1080 x 1350 coordinate container
  return (
    <div className={`relative w-[1080px] h-[1350px] overflow-hidden ${className}`} style={style}>
      {/* Template visual layers */}
    </div>
  );
}
```

### Step 5: Map Renderer in Resolver
In `src/features/templates/renderers.tsx`:
```tsx
import { BrunchTemplate } from "@/components/poster/templates/BrunchTemplate";

const TEMPLATE_RENDERERS: Record<TemplateId, TemplateRendererComponent> = {
  // ... existing 7 templates
  brunch: BrunchTemplate,
};
```

### Step 6: Verify with Automated Suites
Run the full test suite to guarantee zero regressions:
```bash
npx tsx scripts/test-stage22-uat.ts
npm run lint
npm run build
```

---

## 4. Typography & Font Management

- All webfonts used in the master canvas (`Bebas Neue`, `Source Sans 3`, `Inter`, `Cinzel`, `Playfair Display`) are declared in `next.config.ts` with explicit HTTP caching headers (`Cache-Control: public, max-age=31536000, immutable`).
- Fonts are loaded via Google Fonts `<link>` tags in the document root or `@import` declarations, and rasterization is delayed until `document.fonts.ready` resolves to prevent faux-font rendering during PNG/JPEG export.

---

## 5. Pluggable Asset Storage System

The application uses an abstract `StorageAdapter` interface (`src/lib/storage/types.ts`):
- **Local Storage (`STORAGE_PROVIDER=local`)**:
  - Writes files to `./public/uploads`.
  - Accessible directly via `/uploads/{filename}`.
  - Recommended for local offline development.
- **Supabase Storage (`STORAGE_PROVIDER=supabase`)**:
  - Writes to a private or public Supabase Storage bucket (`SUPABASE_STORAGE_BUCKET=poster-assets`).
  - Generates public URLs or signed short-lived URLs.
  - Recommended for production multi-container hosting.

---

## 6. Database Migrations

The database layer relies on Supabase PostgreSQL. Migrations are located in `supabase/migrations/`:
- `20261019_001_create_drafts.sql`: Sets up the `drafts` table with `id`, `user_id`, `template_id`, `name`, `document` (JSONB), and timestamps.
- Row Level Security (RLS) ensures users can only read, write, or delete drafts where `auth.uid() = user_id`.

To apply migrations locally or to a linked Supabase project:
```bash
npx supabase db push
```

---

## 7. Developer Commands & CI Verification

```bash
# Start local development server (pinned strictly to port 3005)
npm run dev -- -p 3005

# Type check without emitting files
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Production Next.js build
npm run build

# Run Stage 21 Deployment & Operations verification
npx tsx scripts/test-stage21-deployment.ts

# Run Stage 22 Canonical UAT Acceptance Suite (ACC-01 to ACC-10)
npx tsx scripts/test-stage22-uat.ts
```
