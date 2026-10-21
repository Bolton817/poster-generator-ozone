# Ozone Lounge Poster Generator — Known Limitations & Release Boundaries

**Version**: 1.0.0  
**Scope**: Product boundaries, technical limitations, and architectural constraints documented for the v1.0.0 release.

---

## 1. Executive Summary

This document delineates the intentional boundaries, known browser variations, and deferred capabilities for the **Ozone Lounge Poster Generator v1.0.0**. Documenting these constraints ensures clear expectations between marketing operators, lounge management, and engineering teams.

---

## 2. Technical & Functional Boundaries

### 2.1 Single 4:5 Portrait Aspect Ratio
- **Current Behavior**: The system outputs exclusively in **1080 × 1350 px** (4:5 portrait aspect ratio). This format was selected as the optimal master layout for Instagram and Facebook feed posts.
- **Limitation**: The system does not currently offer a native 9:16 vertical canvas (1080 × 1920 px) for Instagram Stories, TikTok, or WhatsApp Status.
- **Workaround / Roadmap**: When shared to Instagram Stories, the 4:5 image can be centered against a lounge-branded background color. A dedicated 9:16 Story format toggle is planned for v1.1.0.

### 2.2 Direct Social Media Publishing
- **Current Behavior**: The system outputs high-fidelity raster image files (`.png`, `.jpg`) and multi-day `.zip` archives directly to local device storage or the native operating system share sheet.
- **Limitation**: The application does not connect to Meta Graph API, TikTok API, or X API for automated, scheduled, or one-click direct publishing to social media accounts.
- **Rationale**: Direct posting requires permanent OAuth scopes, business verification, and Meta App Review, which was intentionally excluded from the MVP scope. Operators publish generated files through the official Instagram/Meta Business Suite apps.

### 2.3 Mobile Web Share API Behavioral Variations
- **Current Behavior**: On supported mobile browsers (iOS Safari 15+, Android Chrome 95+), tapping "Share" triggers the native device share sheet via `navigator.share()`.
- **Browser Differences**:
  - **iOS Safari**: Sharing image files requires an explicit, immediate user gesture (direct button tap). If Safari rejects file sharing (e.g. in Private Browsing mode or due to memory constraints), the app seamlessly falls back to opening the image in a new tab or triggering direct download.
  - **Desktop Browsers**: `navigator.canShare({ files })` evaluates to `false` on most desktop browsers. The app automatically defaults to standard direct file download.

### 2.4 Client-Side DOM Rasterization Performance
- **Current Behavior**: High-resolution rasterization is executed client-side using `html-to-image` against the unscaled `1080 × 1350 px` DOM node.
- **Performance Characteristics**:
  - Modern smartphones (iPhone 12+, Samsung Galaxy S21+, Google Pixel 6+): Export duration is typically **800ms – 1.8 seconds**.
  - Older / Lower-powered devices (< 2GB available RAM): Rasterization can take **2.5 – 4.5 seconds** during image encoding.
- **Mitigation**: An interactive spinner and status indicator disable the UI during export to prevent accidental duplicate taps or UI freezing.

### 2.5 Offline Operation
- **Current Behavior**: Authentication tokens (Supabase JWT), draft persistence, and media asset uploads require an active internet connection.
- **Limitation**: If an operator goes offline while editing, draft autosave to the cloud will pause. However, in-memory edits remain safely loaded in the active browser tab until connectivity is restored.

---

## 3. Template-Specific Design Constraints

### 3.1 Friday Offer Exemption (Lothbrok / Flight Fridays)
- **Constraint**: Per Ozone Lounge brand guidelines and Decision 06, Flight Fridays is an offer-free event. The template renderer will intentionally never display promotional drink prices, even if manually entered.

### 3.2 Maximum Text Lengths
- **Constraint**: Text fields are strictly capped in `PosterDocumentSchema` (e.g., Event Title: max 150 characters, Offers: max 200 characters, Performer names: max 80 characters).
- **Rationale**: Strict bounds prevent typographic overflow, clipping, or unreadable overlapping on the master 1080 × 1350 canvas.

---

## 4. Summary Matrix

| Capability | v1.0.0 Status | Planned Horizon |
| :--- | :--- | :--- |
| 4:5 Feed Master (1080 × 1350 px) | **Fully Supported** | Core Standard |
| 9:16 Story Master (1080 × 1920 px) | Not Supported | v1.1.0 Roadmap |
| Native Mobile Web Share | **Fully Supported** (with fallback) | Core Standard |
| Direct Meta/Instagram API Publish | Not Supported | Out of Scope / Post v1.2 |
| Batch All-Day ZIP Download | **Fully Supported** | Core Standard |
| Offline PWA Draft Storage | Partial (In-memory) | v1.2.0 Roadmap |
