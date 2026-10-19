# Repository Baseline — Ozone Lounge Poster Generator

**Stage:** 00 — Repository reconnaissance and requirements lock  
**Date:** 18 October 2026  
**Document Status:** Verified baseline  

---

## 1. Environment & Toolchain Inspection

| Tool / Runtime | Verified Version | Invocation Command & Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Operating System** | Windows (x64) | PowerShell / CMD environment | Verified |
| **Node.js** | `v24.19.0` | `node -v` | Active & Verified |
| **npm** | `11.17.0` | `cmd /c npm -v` or `npm.cmd -v` (PowerShell `.ps1` execution policy restriction requires `.cmd` invocation) | Active & Verified |
| **pnpm** | Not installed | `pnpm : The term 'pnpm' is not recognized` | Inactive |
| **bun** | Not installed | `bun : The term 'bun' is not recognized` | Inactive |
| **Git** | `2.55.0.windows.5` | `git --version` | Active & Verified |
| **Git Repository** | Not yet initialized | `fatal: not a git repository` | Pending Stage 01 bootstrap |

---

## 2. Repository Inventory & State Comparison

### Existing Files in Workspace
```text
c:\Users\admin\Desktop\antigravity projects\ozone poster generator\
├── Ozone_Lounge_Poster_Generator_Blueprint.md         (51,013 bytes)
└── Ozone_Lounge_Poster_Generator_TDD_Antigravity_v1.0.pdf (1,034,088 bytes)
```

### Architecture & Feature Implementation Status

| Architecture / Feature Area | Target Contract (TDD / Blueprint) | Current Repository Status | Gap / Stage Assignment |
| :--- | :--- | :--- | :--- |
| **Project Foundation** | Next.js App Router, TypeScript, Tailwind CSS | Not started; no `package.json` | Stage 01 |
| **Database & ORM** | PostgreSQL, Prisma ORM, migrations & seed scripts | Not started | Stage 02 |
| **Authentication** | Username/Password login, server-side session cookies, rate-limiting | Not started | Stage 03 |
| **App Shell & Theme** | Mobile-first shell, Dark (default) & Light theme switch | Not started | Stage 04 |
| **Template Registry** | Typed contract, canonical `PosterDocument`, 7 weekly definitions | Not started | Stage 05 |
| **Font & Asset Engine** | Local TTF/OTF font registry, durable asset lifecycle | Not started | Stage 06 |
| **Canvas & Export POC** | Fixed master 1080×1350 px, responsive scaling, isolated exporter | Not started | Stage 07 |
| **Editor State & Controls** | React reducer/store, mobile collapsible panels, dirty tracking | Not started | Stage 08 |
| **Reddington Slice** | Monday vertical slice (retro classics, sundowners, Monsieur Pierre) | Not started | Stage 09 |
| **Preview & Zoom** | Full-screen overlay, pinch-zoom, pan, Fit/Reset, X to close | Not started | Stage 10 |
| **Draft Persistence** | Create, save, duplicate, delete, reopen drafts | Not started | Stage 11 |
| **Production Export** | High-fidelity PNG/JPEG export, preflight validations | Not started | Stage 12 |
| **Saint Template** | Tuesday African Night / Afrobeat renderer | Not started | Stage 13 |
| **Lannister Template** | Wednesday Groovy Wednesday / Disco / Dual-offer renderer | Not started | Stage 14 |
| **Shelby Template** | Thursday Karaoke Night / Host vs DJ role separation renderer | Not started | Stage 15 |
| **Lothbrok Template** | Friday Flight Fridays / Conditional no-offer layout renderer | Not started | Stage 16 |
| **Escobar Template** | Saturday Fiesta / Colour blocks & lighting renderer | Not started | Stage 17 |
| **Pinkman Template** | Sunday Old Skool / Vinyl & texture motifs renderer | Not started | Stage 18 |
| **Gallery & Polish** | Discoverability gallery, switching guard, visual fixtures | Not started | Stage 19 |
| **Hardening & Audit** | Security, a11y, performance, resilience audit | Not started | Stage 20 |
| **Operations & Deploy** | Environment boundaries, safe migrations, CORS, storage | Not started | Stage 21 |
| **UAT & Sign-off** | Handover documentation, owner sign-off | Not started | Stage 22 |

---

## 3. Baseline Script & Command Verification

As no `package.json` exists yet, standard lifecycle commands cannot yet be run. Their execution commands for Stage 01 onward are recorded below:

* **Dependency Install**: `cmd /c npm install` (or `npm.cmd install`)
* **Linting**: `cmd /c npm run lint`
* **Type-checking**: `cmd /c npx tsc --noEmit`
* **Unit Testing**: `cmd /c npm run test`
* **Production Build**: `cmd /c npm run build`
* **Database Migration**: `cmd /c npx prisma migrate dev`

---

## 4. Immediate Next Step

Proceed to **Stage 01: Project bootstrap and dependency baseline** once Stage 00 review is finalized.
