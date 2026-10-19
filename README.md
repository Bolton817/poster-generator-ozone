# Ozone Lounge Poster Generator

A standalone, authenticated, mobile-first web application enabling Ozone Lounge operators to generate professional weekly event posters across seven distinct creative identities.

## Project Specifications
- **Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, PostgreSQL, Prisma.
- **Design Resolution**: Fixed virtual master canvas of 1080 × 1350 px (4:5 portrait) with responsive viewport scaling.
- **Delivery Strategy**: Strictly stage-gated (Stages 00–22) following `Ozone_Lounge_Poster_Generator_TDD_Antigravity_v1.0.pdf`.

---

## Local Development Setup

### 1. Prerequisites
- Node.js `v20.0.0` or higher (verified on `v24.19.0`)
- npm `10.0.0` or higher (verified on `11.17.0`)
- Git

### 2. Installation
On Windows PowerShell, run:
```powershell
cmd /c npm install
```

### 3. Development Server
Start the local Next.js dev server:
```powershell
cmd /c npm run dev
```
Navigate to `http://localhost:3000`.

### 4. Code Quality & Build Checks
```powershell
# Type checking
cmd /c npx tsc --noEmit

# Linting
cmd /c npm run lint

# Production build
cmd /c npm run build
```

---

## Documentation
- [`Ozone_Lounge_Poster_Generator_Blueprint.md`](./Ozone_Lounge_Poster_Generator_Blueprint.md): Product plan, canvas rules, and template catalogue.
- [`docs/repo-baseline.md`](./docs/repo-baseline.md): Environment inspection and gap analysis.
- [`docs/decision-register.md`](./docs/decision-register.md): 10 core architectural and product decisions.
- [`docs/implementation-log.md`](./docs/implementation-log.md): Stage execution audit trail.
