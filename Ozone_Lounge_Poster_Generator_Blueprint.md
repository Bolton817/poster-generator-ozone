# Ozone Lounge Poster Generator
## Product Plan, Technical Architecture, Template System, and Build Blueprint

**Document status:** Planning blueprint for the first implementation  
**Product:** Ozone Lounge Poster Generator  
**Initial release:** Seven distinct weekly event templates  
**Primary device:** Mobile phone  
**Core stack:** Next.js, TypeScript, and a reusable fixed-canvas rendering engine

---

## 1. Product vision

Build a standalone, secure, mobile-first web application that lets an authorised Ozone Lounge operator create polished event posters without opening a general-purpose design tool. The operator logs in with a username and password, chooses a weekly template, adjusts the copy, images, typography, colours and other supported visual choices, previews the final poster full-screen, then saves the editable draft or downloads the finished image.

The seven templates should feel like seven genuinely different creative directions, not one layout with seven colour changes. Each template has its own composition, typography rules, image treatment, decorative language, curated options and default content. At the same time, the application shell, editing controls, logo rules, saving behaviour and export pipeline should remain consistent.

The template names below are internal creative labels. They should not rely on character likenesses, show imagery, or other third-party intellectual property; the artwork and layouts should be original and based on Ozone Lounge's event briefs.

### Product goals

1. Make poster creation practical on a phone, including one-handed access to the main actions.
2. Produce consistent, legible, high-quality posters with minimal manual design effort.
3. Keep the seven weekly event identities clearly different while preserving an Ozone Lounge brand thread.
4. Allow approved operators to save drafts and return to them later.
5. Make it straightforward to add new templates, alternate layouts, fonts and export sizes later without rewriting the editor.
6. Keep poster design data structured and serialisable so a saved draft can be restored accurately.

### Not in the first release

- A public self-registration system.
- A general-purpose freeform canvas with arbitrary dragging of every element.
- An AI poster designer or automatic copywriter.
- Automatic publishing to Instagram, Facebook, TikTok or WhatsApp.
- A full template designer for non-technical staff.
- Batch scheduling or automatic posting.
- Multiple export aspect ratios unless required for the first launch.

These can be added later without changing the basic architecture.

---

## 2. What to retain from the Lucky House architecture

The Lucky House architecture contains several strong foundations worth reusing:

- **A fixed virtual canvas:** design elements use stable internal coordinates and do not reflow unpredictably when the editor is viewed on different screens.
- **A separate preview scaling layer:** the application scales the poster to fit its available space without changing the underlying design coordinates.
- **A shared poster state model:** content, styling and image references are serialisable rather than scattered across unrelated UI controls.
- **A dedicated export pipeline:** export the poster node at its actual design resolution instead of taking a screenshot of the entire editor viewport.
- **Persistent drafts:** store structured JSON and permanent asset URLs, then hydrate that state when a draft is reopened.
- **Local-first image preview:** newly selected images appear immediately before they are uploaded for permanent storage.
- **Local font registration:** custom TTF/OTF fonts are registered by the application rather than selected from arbitrary system fonts.

### What should change for Ozone Lounge

The Lucky House tool is oriented around safari-package layouts, tables, inclusion lists and testimonials. Those specialised controls should not be copied into Ozone's editor unless an Ozone template actually needs them.

Ozone should instead have:

- A template gallery organised Monday through Sunday.
- Seven independent template compositions in a common rendering framework.
- Curated, template-specific typography and palette choices.
- Event-specific content fields for DJs, hosts, promotions, date, time, venue and contact details.
- Image-slot controls appropriate to each layout.
- A phone-first full-screen preview with zoom gestures and an obvious close control.
- Username-and-password login for approved operators.
- A clear separation between the **web app's dark/light interface theme** and the **poster artwork's own colour palette**.

---

## 3. Canvas and output format decision

The Lucky House architecture uses a fixed **900 × 1200 px** canvas, which is a 3:4 ratio. Reuse the fixed-coordinate principle, but choose Ozone's output dimensions deliberately rather than inheriting the old size automatically.

### Recommended MVP default

Use a **1080 × 1350 px master canvas (4:5 portrait)** if the main use is social-feed posters. Every template uses this same internal coordinate space for the first release. The editor preview may scale down to fit a phone; the exported image remains at the master dimensions.

A separate **1080 × 1920 px story/status format** can be added as a later composition preset. Do not simply stretch a 4:5 poster into a 9:16 canvas; create a format-specific layout or responsive composition rules so the extra space is used intentionally.

**Decision to verify before production:** confirm where the posters will primarily be published. If WhatsApp Status/Instagram Stories is the dominant destination, a 9:16 first format may be more appropriate. The provided weekly outline does not specify the publishing channels or aspect ratio.

### Canvas rules

- All template rendering happens in a fixed master coordinate system.
- Screen scaling affects only display, never the export dimensions.
- Text and logos remain inside a safe-margin region.
- Each template defines its own layout, layer order, masks, image crops and typography rules.
- Text boxes should define a maximum number of lines, alignment and overflow strategy.
- The engine must warn about text overflow instead of silently shrinking text until it becomes unreadable.
- Export must wait for fonts and images to finish loading.

---

## 4. The seven-template catalogue

The event information below comes from the supplied **Ozone Lounge Weekly Entertainment & Promotions Plan**. Date, start time, venue details, contact information and the final logo asset have not been supplied in that brief, so they should be editable setup fields rather than invented content.

### 4.1 Template identity matrix

| Day | Template name / ID | Event title | Line-up | Offer supplied in the brief | Creative direction | Suggested catalogue tag |
|---|---|---|---|---|---|---|
| Monday | **Reddington** / `reddington` | Old Classics & Sundowners | Monsieur Pierre | Discounts on all drinks, excluding wine. | Retro classics, sunset colours and vintage music aesthetics. | **Best for Monday Sundowners** |
| Tuesday | **Saint** / `saint` | African Night (Afro) | DJ Neb & DVJ Jojez | Discounts on beer buckets and cocktails. | African-inspired patterns, Afrobeat energy and bold colours. | **Best for Afrobeat Nights** |
| Wednesday | **Lannister** / `lannister` | Groovy Wednesday | DJ Donben & DJ Vin | Free koroga chicken on the house. Discounts on whiskey bottles, cognac and beer buckets. | Groovy disco aesthetics, neon lights and dance-floor energy. | **Best for Midweek Groove** |
| Thursday | **Shelby** / `shelby` | Karaoke Night | Hosts: Bellah Harriet & Tito Wagithomo; DJ: DJ Fab | Discounts on gin, rum and vodka. Free tequila shots for singers. | Microphones, stage spotlights and a lively sing-along atmosphere. | **Best for Karaoke Night** |
| Friday | **Lothbrok** / `lothbrok` | Flight Fridays | DJ Slim D & Mistabrand | No special offer supplied yet. | Premium nightlife, energetic DJ visuals and a high-energy Friday atmosphere. | **Best for Premium Fridays** |
| Saturday | **Escobar** / `escobar` | Saturday Fiesta | DVJ Jojez | Discounts on whiskey bottles and cognac. | Fiesta energy, colourful lights and a vibrant weekend celebration. | **Best for Saturday Fiesta** |
| Sunday | **Pinkman** / `pinkman` | Old Skool Sundays | DJ Ngash | Discounts on beer buckets. | Throwback music, vinyl records, nostalgic classics and relaxed Sunday vibes. | **Best for Old Skool Sundays** |

The tag is a short description to help an operator select a template. It does not need to be printed on the poster.

### 4.2 Reddington — Monday

**Creative goal:** warm, nostalgic sundowner energy; more vintage and atmospheric than a conventional club flyer.

- **Composition:** full-bleed sunset or lounge photograph; large retro event title; compact DJ block; an offer ribbon or ticket-like panel; subtle grain or record-inspired detailing.
- **Initial palette presets:** Sunset Ember; Golden Hour; Vinyl Noir.
- **Typography roles:** expressive retro display face for the title; strong condensed face for day/labels; highly legible sans-serif for the offer and practical details.
- **Image controls:** main background; optional secondary vinyl/music detail image; focal-point positioning.
- **Template-specific options:** title treatment, sun-disc/record accent style, offer-panel style, palette and curated font pairs.
- **Offer handling:** preserve “Discounts on all drinks, excluding wine.” as the default wording. Keep the exclusion visible and legible.

### 4.3 Saint — Tuesday

**Creative goal:** bold, contemporary African-night and Afrobeat energy without relying on generic or stereotyped cultural decoration.

- **Composition:** strong title block; asymmetrical geometry; image framed by modern patterned shapes; energetic line-up section.
- **Initial palette presets:** Saffron & Ink; Electric Azure; Terracotta Pulse.
- **Typography roles:** confident geometric display face; compact all-caps labels; readable body face.
- **Image controls:** hero performer/crowd image; optional pattern or texture layer; crop/focal position.
- **Template-specific options:** pattern density, geometric frame, title alignment and colour preset.
- **Offer handling:** “Discounts on beer buckets and cocktails.”

### 4.4 Lannister — Wednesday

**Creative goal:** a visually loud midweek disco party; use light, glow and rhythm rather than copying the other templates' structure.

- **Composition:** oversized title; central spotlight/disco focal point; neon edge lights; DJs in a separate high-contrast panel; offer card near the visual focal point.
- **Initial palette presets:** Ultraviolet Club; Lime & Magenta; Cyan After Dark.
- **Typography roles:** bold display face; wide or condensed supporting face; sturdy sans-serif for the multi-part offer.
- **Image controls:** background/crowd image; optional disco-ball or light texture asset; crop controls.
- **Template-specific options:** glow strength preset, light-trail decoration, title layout and offer-card position preset.
- **Offer handling:** make **Free koroga chicken on the house** a distinct primary offer. Show the bottle/cognac/beer-bucket discounts as secondary copy, not as one dense paragraph.

### 4.5 Shelby — Thursday

**Creative goal:** theatrical karaoke-night energy, as if the viewer is looking toward a lit stage.

- **Composition:** microphone or stage image; spotlight cone; strong karaoke headline; hosts and DJ in clearly separated roles; singer offer highlighted.
- **Initial palette presets:** Stage Crimson; Midnight Violet; Spotlight Gold.
- **Typography roles:** expressive headline face; condensed uppercase labels; readable body face for host names and offer details.
- **Image controls:** stage/microphone background; optional secondary performer image; adjustable focal position.
- **Template-specific options:** spotlight style, microphone accent, title arrangement and palette.
- **Offer handling:** separate “Free tequila shots for singers” from the discounts on gin, rum and vodka so the condition is unmistakable.
- **Content layout:** keep host names and DJ name in separate editable fields to prevent them becoming one difficult-to-scan line.

### 4.6 Lothbrok — Friday

**Creative goal:** premium, fast-moving Friday nightlife; strong contrast and confident typography, with less decorative clutter.

- **Composition:** hero DJ/nightlife photo; bold diagonal or motion-driven title structure; prominent line-up; premium-detail accents.
- **Initial palette presets:** Black & Chrome; Ice Blue; Aubergine Luxe.
- **Typography roles:** striking display face; tight condensed face for labels; neutral sans-serif for event details.
- **Image controls:** primary nightlife/DJ image; optional light texture; crop/focal position.
- **Template-specific options:** diagonal frame preset, metallic accent style, title block alignment and palette.
- **Offer handling:** no offer was supplied in the source brief. If the offer field is blank, hide the offer component and rebalance the layout. Do **not** print “No special offer provided yet.”

### 4.7 Escobar — Saturday

**Creative goal:** celebratory weekend energy; vivid colour and layered light, with a distinct composition from the other six.

- **Composition:** layered colour blocks or light orbs; lively image frame; title treated as a weekend headline; DJ and offer kept clean and easy to read.
- **Initial palette presets:** Fiesta Citrus; Coral Electric; Purple & Gold.
- **Typography roles:** rounded or heavy celebratory display face; strong condensed labels; legible body face.
- **Image controls:** party/crowd hero; optional light texture or secondary detail image.
- **Template-specific options:** colour-block arrangement, light treatment, headline alignment and palette.
- **Offer handling:** “Discounts on whiskey bottles and cognac.”

### 4.8 Pinkman — Sunday

**Creative goal:** nostalgic, relaxed old-school music culture; warmer and more familiar than the Saturday design.

- **Composition:** vinyl or cassette-inspired motifs; textured retro backdrop; nostalgic display title; DJ block and beer-bucket offer placed within a clear lower information area.
- **Initial palette presets:** Amber Memory; Faded Teal; Brick & Cream.
- **Typography roles:** retro display face; compact label face; readable sans-serif for operational details.
- **Image controls:** vintage music/DJ image; optional record/cassette accent; crop/focal position.
- **Template-specific options:** record motif, texture strength, title treatment and palette.
- **Offer handling:** “Discounts on beer buckets.”

### 4.9 What “different templates” means technically

The seven entries must have **different layout components and composition rules**, not just different CSS variables. Palettes and fonts are options inside each template; they should not erase the template's signature.

Each template should define:

- A unique visual composition and layer order.
- Its allowed palette presets.
- Its allowed title/body font combinations.
- Its image slots and crop behaviour.
- Its optional decorative elements.
- Its event fields and how those fields are positioned.
- Its spacing, safe margins, line limits and minimum font sizes.
- Its fallback behaviour when an optional field or image is absent.
- Its export naming rule.

---

## 5. Mobile-first user experience

### 5.1 Main application flow

```text
Login
  |
  v
Template Gallery (Monday to Sunday)
  |
  v
Choose a template
  |
  v
Editor (live poster + editable controls)
  |                         \
  |                          \ Preview
  |                           v
  |                    Full-screen Preview
  |                    - pinch to zoom
  |                    - plus/minus zoom controls
  |                    - reset / fit to screen
  |                    - Save Draft
  |                    - Download
  |                    - X returns to Editor
  |
  +---- Save Draft / autosave
  |
  +---- Download PNG or JPG
  |
  v
Drafts / Template Gallery
```

### 5.2 Editor screen on a phone

The editor is a full-page workspace, not a desktop sidebar squeezed onto a phone. Controls can scroll vertically, and groups should expand/collapse so the operator is not confronted with every option at once.

**Top app bar**
- Back to templates/drafts.
- Template name and day.
- Dark/light application-theme switch in settings or a compact menu.
- A clear **Preview** button.
- Save status such as “Saved”, “Saving…” or “Unsaved changes”.

**Editor body**
- A scaled live poster canvas near the top, with a clear tap target to open Preview.
- Collapsible editing groups such as Event Details, DJ & Hosts, Offers, Images, Typography, Colours and Decorations.
- The fields shown should depend on the selected template. Shelby, for example, needs separate host and DJ fields; Lannister needs primary and secondary offer fields.
- Image controls should offer Choose/Replace, Remove, Crop/Focal Position and a preview of the chosen asset.
- Controls must have labels, large tap targets and comfortable vertical spacing.

**Sticky bottom action area**
- Primary action: Preview or Download, depending on the most common operator workflow.
- Secondary action: Save Draft.
- Keep actions above mobile browser safe areas and do not let them cover form fields.

The live canvas and editor controls must share one source of truth: changing a field updates the preview immediately.

### 5.3 Full-screen Preview mode

Preview is a separate interaction mode over the editor, not a screenshot of the editor page.

- Dark neutral background to make poster edges easy to see.
- Poster centred with `object-contain`-style fitting; no cropping when the zoom is at Fit.
- An **X** at the top-left or top-right returns to the editor without losing changes.
- Pinch-to-zoom on touch screens; one-finger pan when zoomed beyond Fit.
- Visible `+`, `−` and `Fit`/reset controls as accessible alternatives to gestures.
- Display the current zoom percentage if it helps operators understand the view.
- Save Draft and Download actions available in a compact control area.
- Preview gestures must not change the actual poster design scale or export dimensions.
- Escape closes preview on keyboards; focus and scroll should return sensibly to the editor after closing.

### 5.4 Desktop and tablet layout

On larger screens, use a two-column workspace: controls on the left, a large live canvas on the right. Keep the same component state and template renderer across mobile and desktop. Do not maintain separate poster implementations per device.

### 5.5 Dark and bright application themes

The app opens in **dark mode** by default. A bright/light theme is a user-interface preference affecting backgrounds, panels, labels, borders and controls only. It must not recolour the actual poster.

Store the preference in the user profile or local settings. Poster palettes remain an independent control inside each template.

---

## 6. Editing model and controls

### 6.1 Shared controls

All templates can use shared building blocks where appropriate:

- Text inputs and multiline copy fields.
- DJ/host name inputs.
- Offer fields, including separate primary/secondary offer fields when a layout needs them.
- Date and time fields.
- Venue/location and contact/social fields.
- Image upload/replace/remove controls.
- Image focal-position controls.
- Curated font selectors.
- Curated palette selectors.
- Layout/decorative preset selectors.
- Undo last change if implementation scope allows; otherwise provide a clear reset-template action.

### 6.2 Template-specific controls

Template-specific controls should not be forced into a single universal form. The renderer and schema decide which options are relevant. For example, a disco glow strength control is relevant to Lannister but not necessarily Reddington; a record-motif choice belongs to Pinkman.

### 6.3 Safe editing rather than freeform design

For the MVP, favour curated controls over unrestricted dragging. The operator can change the content, selected image, crop, palette, fonts and approved layout treatments while composition rules protect hierarchy and legibility. This gives consistent results and makes export more reliable.

A future advanced mode could add user-adjustable element positions after the core editor is stable.

### 6.4 Content validation and missing details

The brief explicitly says to confirm event start times, venue details and contact information before publishing. Those values are currently unknown.

- Provide editable fields for date, start time, venue, location/address, contact number and social handle.
- Do not invent values or put sample values into downloadable final posters by default.
- A pre-export checklist should flag missing details as warnings.
- In the editor, missing optional details can remain hidden on the poster until filled.
- The operator may still save an unfinished draft.
- Decide whether the production export should be blocked when required publishing details are missing. Recommended behaviour: warn and require confirmation rather than silently exporting placeholders.

### 6.5 Text fit and hierarchy

- Use template-defined text containers and maximum line counts.
- Support intentional line breaks where appropriate.
- Detect measured overflow before export.
- Show a readable warning and suggest a shorter text or alternate layout.
- Do not let event title, DJ names or offer conditions collide with the logo or practical details.
- Keep key information readable at common phone-view sizes.

---

## 7. Template registry and extensibility

Templates should be registered in a single typed catalogue. The catalogue drives the gallery, editor route, defaults, metadata and template-specific capabilities.

A template definition should include:

```ts
export type TemplateId =
  | "reddington"
  | "saint"
  | "lannister"
  | "shelby"
  | "lothbrok"
  | "escobar"
  | "pinkman";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  eventTitle: string;
  tag: string;
  description: string;
  version: number;
  renderer: React.ComponentType<TemplateRendererProps>;
  defaults: PosterDocument;
  palettePresets: PalettePreset[];
  typographyPresets: TypographyPreset[];
  layoutOptions: TemplateLayoutOption[];
  editorSchema: TemplateEditorSchema;
  requiredAssets: RequiredAssetDefinition[];
}
```

Use a shared `PosterCanvas` and common data contract, but render each composition with its own component: `ReddingtonTemplate`, `SaintTemplate`, `LannisterTemplate`, `ShelbyTemplate`, `LothbrokTemplate`, `EscobarTemplate` and `PinkmanTemplate`.

### Adding an eighth template later

A developer should be able to add a new template by:

1. Creating the new template renderer.
2. Defining its event defaults, supported fields, palette/font presets and layout options.
3. Registering it in the template catalogue.
4. Adding a preview thumbnail and tests.

The template gallery and draft list should update from the registry rather than requiring hard-coded changes across many pages.

### Versioning

Persist both `templateId` and `templateVersion` with each draft. When a template changes in a later deployment, old drafts must either continue to render with compatible defaults or pass through a deliberate migration. Avoid changing the interpretation of saved JSON silently.

---

## 8. Data model

### 8.1 Canonical poster document

A saved poster should be one versioned, serialisable document. Prefer storing stable asset IDs or permanent URLs, never short-lived `blob:` URLs.

```ts
export interface PosterDocument {
  schemaVersion: number;
  templateId: TemplateId;
  templateVersion: number;
  name: string;
  canvas: {
    width: 1080;
    height: 1350;
    format: "portrait-4x5";
  };
  content: {
    dayLabel: string;
    eventTitle: string;
    dateText: string;
    startTime: string;
    venueName: string;
    locationText: string;
    contactText: string;
    socialHandle: string;
    primaryOffer: string;
    secondaryOffer: string;
    djNames: string[];
    hostNames: string[];
    customLines: string[];
  };
  assets: {
    logoAssetId: string | null;
    backgroundAssetId: string | null;
    secondaryAssetIds: string[];
  };
  styling: {
    paletteId: string;
    typographyPresetId: string;
    layoutOptionId: string;
    decorationOptions: Record<string, string | number | boolean>;
    focalPoints: Record<string, { x: number; y: number }>;
  };
  updatedAt?: string;
}
```

The interface is an example contract, not a requirement to use these exact field names. The final TypeScript types should match the actual form schema and all seven renderers.

### 8.2 Suggested database entities

**User**
- ID
- Username (unique)
- Authentication-provider fields
- Role/status if more than one permission level is needed
- Created and updated timestamps

**PosterDraft**
- ID
- Name
- Template ID
- Template version
- User ID / owner
- Poster document JSON
- Optional thumbnail asset ID
- Created and updated timestamps

**MediaAsset**
- ID
- Storage key/path
- Original filename
- MIME type
- Width and height where available
- File size
- Uploader ID
- Created timestamp

**AuditEvent (optional for first release)**
- Actor ID
- Action (login, save, delete, export)
- Target record ID where relevant
- Timestamp

Keep image binaries in object storage, not in PostgreSQL JSON. The database stores metadata and references.

### 8.3 Draft operations

- **New poster:** initialise state from the registered template defaults.
- **Save draft:** upload any new local image assets, replace local object URLs with permanent asset references, validate the document, then persist it.
- **Autosave:** optional but recommended after the manual-save flow works; debounce changes and display save status.
- **Open draft:** load the saved JSON, run schema/version validation, resolve its asset references and populate the editor.
- **Duplicate draft:** copy the document into a new draft ID so the original is unchanged.
- **Delete draft:** confirm the action, then remove the record and optionally clean up unreferenced uploads.
- **Export:** render the current in-memory document; exporting should not silently create a new draft.

---

## 9. Fonts and visual assets

### 9.1 Premium font registration

Store licensed font files under a predictable public path such as `/public/fonts/`. Add a registry entry for every family and available weight/style. Support TTF and OTF initially, as requested. Where possible, prepare WOFF2 versions later for faster browser delivery, while retaining the originals if operationally required.

Example registry shape:

```ts
export interface FontDefinition {
  id: string;
  family: string;
  label: string;
  src: string;
  format: "truetype" | "opentype" | "woff2";
  weight: number;
  style: "normal" | "italic";
  roles: Array<"display" | "heading" | "body" | "label">;
  licenceNote?: string;
}
```

Implementation requirements:

- Register fonts with `@font-face` and stable font-family names.
- Make font options searchable or grouped if the library becomes large.
- Curate the fonts offered by each template so a selection cannot easily break its design.
- Load the font files before export; use `document.fonts.ready` and test that the exported image matches the editor preview.
- Test every font at the actual title and offer lengths used in these posters.
- Keep font files licensed for the intended website/app distribution and embedding use. A font being available as a TTF/OTF file does not itself grant redistribution rights.
- Do not rely on a third-party web font being available at export time when a locally bundled font can be used.

### 9.2 Logo and event images

- Use the official Ozone Lounge logo in a consistent, configurable brand location.
- Provide a contrast treatment (for example, a subtle shadow, glow or backing plate) where necessary, but keep it template-specific and unobtrusive.
- Do not permanently bake the logo into each background image; keep it as a distinct layer so its position and size remain consistent.
- Validate upload type, file size and image dimensions.
- Give each image slot a meaningful label (Background, DJ/Performer, Texture, Secondary Detail).
- Support choosing an existing uploaded asset if an asset library is introduced.
- Use object-fit/cover and focal-point settings rather than stretching source images.
- Preserve the original upload and use a safe transformed copy if image processing is needed.

### 9.3 Image upload lifecycle

1. The user selects a file.
2. Validate its type and size on the client for immediate feedback.
3. Generate a temporary object URL for instant preview.
4. On save, upload the binary to permanent storage.
5. Store the permanent storage key/URL in the poster document.
6. Never store a temporary `blob:` URL in a saved draft.
7. Revoke temporary object URLs when they are replaced or the editor is closed.

---

## 10. Suggested technical stack

| Area | Recommended choice | Notes |
|---|---|---|
| App framework | Next.js App Router | Standalone web application with server and client components. |
| Language | TypeScript | Typed template definitions, state and form contracts. |
| Styling | Tailwind CSS plus a small design-token layer | Fast responsive UI; keep poster design tokens separate from app-shell tokens. |
| UI state | React state/reducer or Zustand | One shared source of truth for the active poster. Choose the simpler option unless cross-component state becomes unwieldy. |
| Form validation | Zod plus React Hook Form where useful | Validate both UI input and server-bound data. |
| Database ORM | Prisma | Store users/metadata and JSON draft documents. |
| Database | PostgreSQL | Persistent drafts, users and media metadata. |
| Object storage | Supabase Storage or an existing approved image service | Choose one primary asset store to avoid split storage and unnecessary complexity. |
| Authentication | Better Auth may fit username-based sign-in | See authentication caveat below; do not hand-roll password hashing or sessions. |
| Poster export | A dedicated browser rasterisation adapter | Start with the approach proven in Lucky House, then test all fonts/images on target mobile browsers. Keep the export layer swappable. |
| Testing | Vitest/React Testing Library plus Playwright | Unit tests for state/validation and browser tests for mobile editor/export. |
| Hosting | Next.js-compatible hosting | Confirm database connections, image storage and export behaviour in the chosen deployment environment. |

### Authentication caveat

The app's **visible login form** should contain only username and password, and public self-registration should be disabled for the MVP. The Better Auth username plugin supports username sign-in, but its documented email/password registration flow still asks for an email address. If Ozone requires a true no-email account model, settle that requirement before implementation rather than inventing fake email addresses. One option is to use a maintained auth setup with administrator-provisioned username accounts and secure password hashing/session handling; this needs deliberate security review. Never store or compare plain-text passwords.

### Storage recommendation

For the simplest first release, PostgreSQL plus one object-storage provider is enough. If using Supabase for both, keep the database and Storage references together. If Ozone already uses a preferred image/CDN provider, it can remain the image store, but do not keep duplicate copies in multiple services without a clear reason.

---

## 11. Rendering and export pipeline

### 11.1 Rendering layers

Separate the editor UI from the exportable poster node. The export should target a clean composition root that contains only the artwork and intended poster layers, not controls, zoom buttons, canvas borders or editor metadata.

```text
Poster document state
       |
       v
Template renderer (one of seven)
       |
       v
Export-safe poster root (1080 × 1350)
       |
       +--> scaled in editor viewport
       |
       +--> rasterised at export resolution
                 |
                 v
         PNG or high-quality JPG
                 |
                 v
       Download / optional mobile share
```

### 11.2 Export formats

Recommended first release:

- **PNG:** best default for crisp text and graphics; larger file size.
- **JPEG:** useful for photographic posters where smaller file size matters.
- Use the exact master canvas dimensions for the standard exports.
- Optionally provide a 2× export in a later iteration once performance and file-size behaviour have been tested on lower-end phones.

Naming examples:

- `Ozone-Lounge-Monday-Reddington-Old-Classics.jpg`
- `Ozone-Lounge-Friday-Lothbrok-Flight-Fridays.png`

Sanitise file names and use a fallback name if the event title is empty.

### 11.3 Export correctness requirements

- Wait for all local fonts and image assets to be ready.
- Fail gracefully if a font/image cannot be embedded or loaded.
- Detect CORS/tainted-canvas problems with external assets and prefer controlled same-origin/object-storage URLs.
- Do not capture the scaled preview; export the unscaled poster root at master size.
- Provide a loading indicator while generating the file.
- Prevent accidental double export while a rasterisation task is running.
- Verify output dimensions and image readability on iOS Safari and Android Chrome, not only desktop Chrome.
- Compare exported output with the live canvas for font metrics, image cropping, shadows, gradients, masks and blend modes.

The existing Lucky House `html-to-image`/Canvas approach is a sensible starting point, but it should be isolated behind an export service and verified against Ozone's premium fonts and effects. If a specific effect consistently fails in browser rasterisation, simplify that effect or consider a server-side renderer for that case instead of allowing unreliable exports.

### 11.4 Full-screen zoom is not export scaling

Preview zoom is a display transform only. The poster's base dimensions and element coordinates must remain unchanged at all zoom levels. The zoom state should reset to Fit when opening a new poster or when the user chooses Fit; it must never be serialised as part of the saved poster's styling.

---

## 12. Authentication and security

### Required baseline

- Username/password login screen.
- Public registration disabled.
- Accounts created or provisioned by an authorised administrator.
- Password hashes generated by a maintained auth library/approved password-hashing implementation.
- Server-managed sessions in secure cookies (`HttpOnly`, `Secure` in production, suitable `SameSite`, appropriate expiry).
- Rate limiting or throttling for repeated login failures.
- Generic login failure messages that do not reveal whether a username exists.
- Strong password policy and a password-change/reset procedure.
- Every draft/media API verifies the current user and authorisation on the server.
- Validate uploaded file types and sizes; do not trust client-supplied MIME types alone.
- Keep database credentials, storage secrets and authentication secrets in environment variables.
- Do not expose server secrets in client bundles.
- Add basic audit logging for important account and draft actions if multiple operators will use the app.

### Permissions

For MVP, the simplest model is an operator role with access to all shared Ozone drafts, plus an administrator role for user management. Decide whether drafts are shared by all Ozone staff or private to the creator. This changes the draft access rules and should be chosen before the database/API is finalised.

### Data and asset retention

Define who may delete drafts and uploaded assets. If multiple templates and drafts reuse one image, deleting one draft should not delete an asset that another draft still references. Consider periodic cleanup of old unreferenced uploads after the core workflow is stable.

---

## 13. Routes and component structure

### Suggested routes

```text
/login
/app/templates                 # template gallery
/app/templates/[templateId]    # editor for a template or draft
/app/drafts                    # saved drafts
/app/drafts/[draftId]          # optional direct draft route
/app/settings                  # app theme, password and user preferences
/app/admin/users               # optional admin-only user management
/api/auth/[...all]             # if using Better Auth's Next.js route pattern
/api/drafts                    # save/list drafts, as appropriate
/api/drafts/[draftId]          # load/update/delete a draft
/api/assets                    # upload/resolve media, as appropriate
```

Exact route-handler versus server-action choices should follow the implementation, but all privileged operations must be checked server-side.

### Suggested folder structure

```text
src/
  app/
    login/
    app/
      templates/
      drafts/
      settings/
      admin/
    api/
  components/
    app-shell/
    auth/
    gallery/
    editor/
      EditorHeader.tsx
      EditorSections.tsx
      PreviewOverlay.tsx
      ZoomControls.tsx
      SaveStatus.tsx
    poster/
      PosterCanvas.tsx
      PosterExportRoot.tsx
      shared/
      templates/
        ReddingtonTemplate.tsx
        SaintTemplate.tsx
        LannisterTemplate.tsx
        ShelbyTemplate.tsx
        LothbrokTemplate.tsx
        EscobarTemplate.tsx
        PinkmanTemplate.tsx
  features/
    auth/
    drafts/
    assets/
    export/
    templates/
  lib/
    auth.ts
    db.ts
    storage.ts
    validation/
  templates/
    registry.ts
    definitions/
    palettes/
    typography/
  types/
  public/
    fonts/
    logos/
    template-thumbnails/
```

This is an organisational guide; do not create empty folders or abstractions before they are needed.

---

## 14. Core application logic

### 14.1 Template selection

1. Load the registered template catalogue.
2. Group the first seven templates by day.
3. Show name, day, event type, a thumbnail and a descriptive tag.
4. Selecting a template creates a fresh `PosterDocument` from its defaults or loads the chosen saved draft.
5. Validate the document against that template's schema before rendering.

### 14.2 Save draft

1. Read the current editor document.
2. Validate the structure and field types.
3. Find any image references that are still temporary object URLs.
4. Upload those files to permanent storage.
5. Replace temporary URLs with stable asset IDs/storage URLs.
6. Persist the JSON, template ID/version and draft metadata.
7. Update the last-saved timestamp and show clear success/error state.
8. Keep the editor usable if a save fails, and offer Retry.

### 14.3 Preview and zoom

1. Preserve the current draft state.
2. Open the preview overlay with the poster fitted inside the available space.
3. Track zoom and pan as temporary view state, independent of the poster document.
4. Handle two-pointer pinch gestures and one-pointer pan when zoomed in.
5. Keep the close button and key actions reachable.
6. Close preview without resetting content edits.

### 14.4 Export

1. Run the missing-details checklist.
2. Confirm all used fonts and images have loaded.
3. Check critical text for overflow.
4. Render the unscaled poster root at the master canvas dimensions.
5. Convert to the requested PNG/JPEG.
6. Trigger a download with a sanitised filename; optionally offer native file sharing if supported.
7. Show a clear error and retry path if rasterisation fails.

---

## 15. UI states and feedback

Design the following states intentionally rather than leaving the user with silent failures:

- Loading template.
- Loading saved draft.
- Unsaved changes.
- Saving draft.
- Draft saved.
- Save failed / retry.
- Uploading image.
- Image rejected with a clear reason.
- Font or image failed to load.
- Text overflow warning.
- Missing date/time/location/contact warning.
- Export in progress.
- Export complete.
- Export failed.
- Session expired / login required.
- Empty draft gallery.
- No matching template, if a search/filter is added later.

Avoid using only colour to indicate success or failure; include text labels/icons that remain understandable in either application theme.

---

## 16. Implementation phases

### Phase 0 — Decisions and asset preparation

- Confirm main publishing channel and initial aspect ratio.
- Obtain official Ozone Lounge logo in a suitable transparent format.
- Gather approved event/DJ photographs or define the upload workflow.
- Confirm event times, venue/location, phone/contact and social handle.
- Inventory supplied font files and verify licences.
- Decide whether staff share all drafts or own separate drafts.
- Decide whether accounts have a hidden/internal email field or must be strictly username-only.

**Exit criteria:** no critical dependency is silently replaced with invented content.

### Phase 1 — App foundation

- Initialise Next.js and TypeScript project.
- Configure app themes and responsive shell.
- Implement username/password sign-in and protected routes.
- Configure Prisma/database connection and asset storage.
- Create a draft record and successfully load it after a refresh.

**Exit criteria:** an authorised operator can log in, remain authenticated appropriately, and save/load a simple draft.

### Phase 2 — Rendering engine

- Implement the master poster canvas and scaling wrapper.
- Implement the canonical poster document and validation.
- Implement the template registry.
- Add export-root isolation and baseline PNG/JPEG export.
- Test font/image readiness and output dimensions on target browsers.

**Exit criteria:** one test template looks the same in the editor and exported file, at the expected dimensions.

### Phase 3 — Build the seven template renderers

Implement in a useful order for testing distinct layout requirements:

1. Reddington — retro layout, sunset image and offer panel.
2. Saint — geometric layout and patterned treatment.
3. Lannister — neon/glow and layered offers.
4. Shelby — host/DJ separation and conditional karaoke offer.
5. Lothbrok — premium high-energy composition and hidden empty offer slot.
6. Escobar — colourful celebration treatment.
7. Pinkman — nostalgic music motifs and texture.

For each template, add defaults, fields, palette presets, font presets, thumbnail, fallback behaviour and export test.

**Exit criteria:** every day has a distinct composition and its source-brief content is prefilled accurately.

### Phase 4 — Mobile editing and full-screen preview

- Build collapsible editor sections and large touch controls.
- Add full-screen Preview and close-to-editor flow.
- Add pinch zoom, pan, Fit and accessible plus/minus controls.
- Make Save Draft and Download reachable on phone screens.
- Test orientation changes, notches/safe areas, virtual keyboard and browser download behaviour.

**Exit criteria:** a user can complete the full poster workflow on a phone without needing a laptop.

### Phase 5 — Drafts, media library and reliability

- Add draft gallery, reopen, duplicate and delete.
- Persist uploads and clean up replaced local object URLs.
- Add clear save/export progress and error handling.
- Add image reuse if it is valuable for repeated weekly posters.
- Add schema/template-version protection.

**Exit criteria:** drafts remain valid after refresh and relogin; assets do not disappear because they were only stored as local URLs.

### Phase 6 — Production hardening

- Run security checks for protected API access and upload validation.
- Test fonts and all template variants on iOS Safari and Android Chrome.
- Test long DJ names, long event titles and long offers.
- Test weak network, failed uploads, interrupted saves and failed exports.
- Review keyboard accessibility and dark/light theme contrast.
- Confirm backup and retention policy.

**Exit criteria:** known failure cases have predictable messages and do not silently corrupt drafts or exported posters.

---

## 17. Minimum acceptance checklist

### Login and protection
- [ ] A user cannot open the editor or drafts without a valid session.
- [ ] Public account registration is disabled unless explicitly required.
- [ ] Passwords are never stored in plain text.
- [ ] Failed logins are rate-limited or throttled.
- [ ] Server routes verify access to each requested draft.

### Gallery and templates
- [ ] All seven templates appear with correct name, day, event title and catalogue tag.
- [ ] Each template has its own layout structure, not just a different palette.
- [ ] Source-provided DJ/host names and offers are accurate.
- [ ] Friday's empty offer field does not print placeholder copy.
- [ ] Every template has at least two curated palette options and multiple tested typography options before launch, subject to the uploaded font inventory.

### Editor
- [ ] Editing any content field updates the live poster.
- [ ] Images can be replaced and removed without leaving broken previews.
- [ ] Palette and font changes apply only to the poster, not to the app shell.
- [ ] Missing publishing details are clearly flagged.
- [ ] Long copy triggers a fit warning or uses a deliberate layout fallback.

### Preview
- [ ] Preview fills the available phone screen while preserving the poster's aspect ratio.
- [ ] Pinch zoom works on supported touch devices.
- [ ] Plus/minus and Fit controls work without gestures.
- [ ] X returns to editing without losing unsaved changes.
- [ ] Preview zoom never changes export dimensions.

### Save and export
- [ ] A saved draft survives refresh and a new login session.
- [ ] A saved draft stores stable asset references, not `blob:` URLs.
- [ ] PNG/JPEG files have the expected dimensions and file names.
- [ ] Premium fonts and images appear correctly in exports.
- [ ] Export failures show a useful message and permit retry.
- [ ] Download works on supported mobile browsers.

### Maintainability
- [ ] Templates are added through a registry and typed contract.
- [ ] Template ID/version are stored with the draft.
- [ ] Removing an optional field does not leave an empty border or panel.
- [ ] At least one browser-level export test exists for each template.

---

## 18. Main risks and mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Fonts look different in exports | Premium display fonts are central to poster design. | Bundle fonts locally, wait for fonts to load, test every font in rasterised output and maintain a tested font catalogue. |
| Phone export fails on a particular browser | Mobile is the main device. | Test real iOS Safari and Android Chrome early; isolate export behind a service that can be changed. |
| Seven templates become one generic layout | The brief explicitly requires distinct daily designs. | Make unique renderer components and review them against separate creative acceptance criteria. |
| Missing venue/time/contact is overlooked | The brief explicitly asks to confirm these before publishing. | Add an export checklist and warnings; never invent details. |
| Blank Friday offer leaves awkward space | No Friday special offer has been provided. | Make the offer panel conditional and reflow the layout when it is absent. |
| Uploaded images disappear when a session ends | Browser object URLs are temporary. | Upload assets before persisting a draft and store stable asset references. |
| User changes a template after saving | Old JSON may no longer match the renderer. | Version template definitions and migrate or preserve old data intentionally. |
| Unlicensed fonts are embedded in the app | TTF/OTF availability does not prove redistribution rights. | Track font licences and only bundle files cleared for this use. |
| Theme switch changes poster colours unexpectedly | App theme and artwork palette are different concepts. | Store them as independent state settings. |
| Username-only login conflicts with chosen auth provider | Some username plugins still require an email field internally. | Decide whether an internal email is acceptable before setting up auth; never create fictitious contact details without an explicit policy. |

---

## 19. Decisions to close before implementation

The following items are not defined in the supplied brief and need confirmation before final production work:

1. **Publishing channel and aspect ratio:** 4:5 feed poster first, or 9:16 story/status first?
2. **Logo and asset library:** where is the official logo, and will approved photos be preloaded or uploaded each time?
3. **Event logistics:** weekly start times, venue/address, contact number and social handle.
4. **Friday offer:** should Lothbrok remain offer-free or will a Friday promotion be introduced later?
5. **Accounts:** one shared login, or multiple operator accounts? Should an administrator create each account?
6. **Draft visibility:** shared drafts for the whole lounge team or private drafts per operator?
7. **Username-only requirement:** may accounts have an internal email field for account administration, or must there be no email field at all?
8. **Export preferences:** PNG only, PNG + JPG, and whether a story/status size is needed in the first release.
9. **Fonts:** final list of TTF/OTF files and their usage licences.

The application can be designed now while these decisions are gathered, but the aspect ratio, account model and missing publishing details should be settled before calling the build production-ready.

---

## 20. Suggested first build milestone

The most reliable first milestone is **one complete end-to-end template**, not seven partially implemented templates.

Build Reddington with one default palette and font pair, its event details and offer fields, image upload, saved draft, full-screen preview, pinch zoom and export. Verify the workflow on a real phone. Then generalise only the proven pieces into the shared template contract and build the remaining six compositions.

This sequence tests the technically risky parts—font rendering, image persistence, mobile preview gestures and export correctness—before multiplying them across all seven templates.

---

## 21. Reference links

- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) — recommends using an authentication library and describes server-side validation and session management.
- [Better Auth Username Plugin](https://better-auth.com/docs/plugins/username) — documents username sign-in; note that its email/password sign-up flow requires an email field.
- [Better Auth Next.js Integration](https://better-auth.com/docs/integrations/next) — integration pattern for the App Router.

These references support implementation choices; the product requirements and weekly poster content in this document are based on the supplied Lucky House architecture and Ozone Lounge weekly poster brief.
