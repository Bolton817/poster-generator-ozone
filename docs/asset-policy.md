# Ozone Lounge Poster Generator — Media Asset & Storage Policy

## Overview
This document specifies the image slot definitions, accepted media formats, dimension constraints, lifecycle management, and security policies for all graphic assets in the Ozone Lounge Poster Generator.

---

## 1. Supported Image Slots

| Slot Key | Template Usage | Role / Purpose | Recommended Dimensions | Max File Size |
| :--- | :--- | :--- | :--- | :--- |
| `logo` | All 7 Templates | Official Ozone Lounge brand logo | ~400 × 160 px (Transparent PNG) | 5 MB |
| `heroBackground` | All 7 Templates | Primary visual background / DJ action shot / stage atmosphere | 1080 × 1350 px (4:5 portrait) | 10 MB |
| `secondaryImage` | Shelby, Saint, Lannister | Performer/host headshots, cocktails, or decorative detail | 600 × 600 px (1:1 square) | 5 MB |
| `texture` | Pinkman, Escobar | Vinyl grooves, retro grain, party lighting orbs | 1080 × 1350 px (Tileable / full-bleed) | 5 MB |

---

## 2. Media Upload & Validation Policy

1. **Allowlisted MIME Types**:
   - `image/jpeg` (`.jpg`, `.jpeg`)
   - `image/png` (`.png`)
   - `image/webp` (`.webp`)
   - *Note*: Untrusted SVGs are strictly forbidden from user upload paths due to XSS risk and canvas tainting vulnerabilities. Official logos are bundled or validated explicitly.
2. **Size Limits**:
   - Maximum upload size per file: **10 MB** (enforced on both client and server).
3. **Decoded Dimension Warnings**:
   - For `heroBackground`: Warn if width < 1080 px or height < 1350 px to avoid visual pixelation in production exports.
4. **Focal Point & Crop**:
   - Image focal point is persisted as normalized coordinates: `FocalPoint { x: number, y: number }` with values between `0.0` and `1.0`.
   - The default focal point is centered `{ x: 0.5, y: 0.5 }`.

---

## 3. Asset Persistence Lifecycle

```
[User Selects File]
       │
       ▼
[Instant Client Preview]  ──► URL.createObjectURL(file) [Ephemeral blob: URL]
       │
       ▼ (Background Upload via /api/assets/upload)
[Server Validation]       ──► Check session, size, MIME type, decode dimensions
       │
       ▼
[Storage Service]         ──► Writes to disk (/public/uploads) or Bucket with random UUID key
       │
       ▼
[Database Persistence]    ──► Inserts record into `media_assets` table
       │
       ▼
[Durable Reference Returned] ──► { assetId: string, publicUrl: string, ... }
       │
       ▼
[Draft Saved]             ──► Persists durable publicUrl; ephemeral blob: is revoked
```

### Critical Guardrails
- **No `blob:` in Stored State**: Poster draft documents must never serialize or save `blob:...` URLs. Stored documents only reference durable URLs or asset IDs.
- **Cleanup**: Ephemeral `blob:` object URLs are revoked via `URL.revokeObjectURL()` upon replacement or component unmount.
- **Orphan Protection**: Assets referenced by one or more saved drafts cannot be deleted without cascade confirmation.
