# Ozone Lounge Poster Generator — Production Deployment Guide
**Stage 21: Deployment, Environments, and Operations**  
**Document Version:** 1.0  
**Governing Specs:** TDD v1.0 (Pages 100–101) & Blueprint Section 10  

---

## 1. System Architecture & Hosting Compatibility

The **Ozone Lounge Poster Generator** is a mobile-first, authenticated Next.js 15 (App Router) application.

```
[ Operator Mobile Browser ]
       |
       v (HTTPS / TLS 1.3)
[ Next.js 15 Application Server ] (Vercel Serverless OR Node.js 20 Container)
       |
       +---> [ Better Auth ] (Session & Cookie Management)
       |
       +---> [ Supabase PostgreSQL ] (via Transaction PgBouncer Pooler on port 6543)
       |
       +---> [ Supabase Object Storage / CDN ] (Public assets + authenticated upload)
       |
       +---> [ Browser DOM Rasterization ] (html-to-image client execution for 1080×1350 px export)
```

### Server Runtime Compatibility Matrix

| Runtime / Engine | Compatibility | Recommended Use Case |
| :--- | :--- | :--- |
| **Vercel Serverless (Node.js 20)** | **Native / Optimal** | Serverless Next.js edge/node runtime, automatic preview branches, zero-config caching. |
| **Docker Container (Node.js 20-alpine)** | **Native / Verified** | Self-hosted, Railway, Render, Fly.io, AWS ECS / App Runner. Standalone bundle (~150MB). |
| **Direct Node.js Process (PM2)** | **Fully Supported** | Traditional VPS (Ubuntu 22.04 LTS) running `next start -p 3005`. |

---

## 2. Environment Configuration & Secret Boundaries

Every deployment tier requires its own isolated configuration. Secrets **must never** be committed to version control.

### Required Environment Variables

| Variable Name | Required | Tiers | Description & Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | All | Transaction-pooled PostgreSQL URL (`...pooler.supabase.com:6543/postgres?pgbouncer=true`). |
| `DIRECT_URL` | **Yes** | All | Direct connection URL on port 5432 for Prisma migrations (`...pooler.supabase.com:5432/postgres`). |
| `AUTH_SECRET` | **Yes** | All | 32-byte cryptographic hex string for session hashing (`openssl rand -hex 32`). |
| `APP_BASE_URL` | **Yes** | All | Canonical base URL (`https://posters.ozonelounge.com` or `http://localhost:3005`). |
| `NEXT_PUBLIC_APP_URL` | **Yes** | All | Browser-accessible base URL (matches `APP_BASE_URL`). |
| `TRUSTED_ORIGINS` | **Yes** | Staging / Prod | Comma-separated list of allowed CORS origins for authentication and API endpoints. |
| `STORAGE_PROVIDER` | **Yes** | All | `local` (filesystem fallback) or `supabase` (production object storage). |
| `STORAGE_BUCKET` | Optional | Staging / Prod | Supabase bucket name (default: `ozone-poster-assets`). |
| `SUPABASE_URL` | If Supabase | Staging / Prod | Supabase project URL (`https://[ref].supabase.co`). |
| `SUPABASE_SERVICE_ROLE_KEY` | If Supabase | Staging / Prod | Supabase Service Role key (server-side only; never expose to client!). |
| `LOG_LEVEL` | Optional | All | Logging severity threshold (`info`, `warn`, `error`). Defaults to `info`. |

---

## 3. Database Migration & Provisioning SOP

### 3.1 Migration Execution Rule

> [!CAUTION]
> **NEVER** run `npx prisma db push` or `npx prisma migrate reset` against staging or production databases. `db push` can cause irreversible schema desynchronization and data loss, while `reset` drops all operator drafts!

### 3.2 Safe Deployment Migration Command

Always deploy database migrations using the deterministic Prisma deploy command:

```bash
# 1. Inspect migration status against target database
npx prisma migrate status

# 2. Apply pending migrations safely within transactions
npx prisma migrate deploy
```

`prisma migrate deploy` checks the `_prisma_migrations` audit table in PostgreSQL and applies only unapplied migration scripts in strict sequence.

### 3.3 Operator Account Seeding

To provision initial administrative operator accounts (`Franklin` and `Bolton`), run the idempotent seed script:

```bash
npm run db:seed
```

The seed script checks for existing user records before insertion, guaranteeing safe execution against already-provisioned databases.

---

## 4. Hosting Target 1: Vercel Deployment (Recommended)

1. **Link Repository**:
   - In Vercel Dashboard, import `https://github.com/Bolton817/poster-generator-ozone.git`.
   - Set Framework Preset to **Next.js**.
   - Root directory: `./`.
2. **Configure Environment Variables**:
   - Add all variables listed in Section 2 under **Settings > Environment Variables**.
   - Ensure `AUTH_SECRET` is set to a unique, cryptographically strong random string.
3. **Build & Output Settings**:
   - Build Command: `npx prisma generate && next build` (or leave default `npm run build`).
   - Install Command: `npm ci`.
4. **Deploy**:
   - Trigger deployment from `main` (production) or feature branch (preview/staging).

---

## 5. Hosting Target 2: Docker Container Deployment

The repository includes a production multi-stage [`Dockerfile`](file:///c:/Users/admin/Desktop/antigravity%20projects/ozone%20poster%20generator/Dockerfile) and [`docker-compose.yml`](file:///c:/Users/admin/Desktop/antigravity%20projects/ozone%20poster%20generator/docker-compose.yml).

### 5.1 Building the Container

```bash
# Build standalone production image
docker build -t ozone-poster-generator:latest .
```

### 5.2 Running with Docker Compose

```bash
# Run container with environment configuration
docker compose up -d
```

The container exposes port `3005` mapped to container port `3000` with automated health checking via `/api/health`.

---

## 6. Supabase Storage Bucket & CORS Setup

When using `STORAGE_PROVIDER=supabase`:

1. **Create Bucket**:
   - In Supabase Dashboard > Storage > Buckets, create a new bucket named `ozone-poster-assets`.
   - Toggle **Public bucket: ON** (enables fast image CDN delivery to client canvas).
2. **Configure CORS Policy**:
   - Under Storage > Settings > CORS, configure:
   ```json
   [
     {
       "origin": ["https://posters.ozonelounge.com", "http://localhost:3005"],
       "methods": ["GET", "POST", "DELETE", "HEAD"],
       "headers": ["*"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
   *Rationale: The canvas rasterization engine (`html-to-image`) fetches uploaded images to draw on canvas. Allowed CORS headers prevent canvas tainting during high-resolution export.*

---

## 7. Pre-Flight & Post-Deployment Checklist

Before handing off the deployment to lounge operators:

- [ ] **Health Check**: `GET /api/health` returns HTTP 200 with status `"ok"`.
- [ ] **HTTPS / TLS**: SSL certificate active and valid at the deployed origin.
- [ ] **Operator Sign-in**: Login succeeds with username `Bolton` or `Franklin`.
- [ ] **Templates Gallery**: `/app/templates` loads all 7 daily templates with SVG thumbnails.
- [ ] **Editor Canvas**: Unscaled 1080 × 1350 px canvas renders without layout shift.
- [ ] **Custom Fonts**: Bebas Neue, Source Sans 3, and Inter render cleanly without font swap.
- [ ] **Asset Upload**: Upload a sample JPEG/PNG/WebP; verify magic bytes validation passes.
- [ ] **Draft Persistence**: Save a poster draft; verify it appears in `/app/drafts`.
- [ ] **High-Res Export**: Download both PNG and JPEG; verify dimensions are exactly 1080 × 1350 px.
- [ ] **Log Inspection**: Verify operational logs are emitting structured JSON with no exposed credentials.
