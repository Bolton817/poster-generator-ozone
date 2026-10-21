# Ozone Lounge Poster Generator — Operations, Backup & Recovery Runbook
**Stage 21: Deployment, Environments, and Operations**  
**Document Version:** 1.0  
**Governing Specs:** TDD v1.0 (Pages 100–101) & Blueprint Section 10  

---

## 1. Database Backup and Recovery SOP

The application stores operator accounts, authentication sessions, draft poster documents (canonical JSON), and asset metadata in PostgreSQL (Supabase).

### 1.1 Automated Backups
- Supabase performs automatic daily backups with Point-In-Time-Recovery (PITR) enabled on production tiers.
- Backups can be inspected in the **Supabase Dashboard > Database > Backups**.

### 1.2 Manual PostgreSQL Backup via `pg_dump`

To perform an on-demand, point-in-time logical backup prior to major maintenance:

```bash
# Set your direct PostgreSQL credentials
export PGHOST="aws-0-[region].pooler.supabase.com"
export PGPORT="5432"
export PGUSER="postgres.[project-ref]"
export PGDATABASE="postgres"
export PGPASSWORD="[your-database-password]"

# Execute compressed custom-format pg_dump
pg_dump -Fc --no-acl --no-owner \
  -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE \
  > "ozone_db_backup_$(date +%Y%m%d_%H%M%S).dump"
```

*Note: Use the direct connection port `5432`, not the PgBouncer pooler port `6543`, for `pg_dump`.*

### 1.3 Database Restoration via `pg_restore`

In the event of accidental data corruption or disaster recovery:

```bash
# Restore specific tables or entire public schema
pg_restore --clean --if-exists --no-acl --no-owner \
  -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE \
  "ozone_db_backup_[TIMESTAMP].dump"
```

> [!WARNING]
> Restoring a full database overwrite will replace current drafts. Always take a fresh snapshot of the current database before running `pg_restore`.

---

## 2. Asset Storage Backup and Recovery

Poster hero images and DJ promotional photos are stored via the configured `STORAGE_PROVIDER`.

### 2.1 Supabase Object Storage Backup

If using `STORAGE_PROVIDER=supabase`, assets can be backed up using the Supabase CLI or S3-compatible sync tools:

```bash
# Using AWS CLI / S3-compatible tool against Supabase Storage S3 endpoint:
aws s3 sync s3://ozone-poster-assets "./backups/assets_$(date +%Y%m%d)/" \
  --endpoint-url "https://[project-ref].supabase.co/storage/v1/s3"
```

### 2.2 Local Filesystem Storage Backup

If using `STORAGE_PROVIDER=local` (e.g. container persistent volume):

```bash
# Archive all operator-uploaded assets
tar -czvf "ozone_uploads_$(date +%Y%m%d_%H%M%S).tar.gz" ./public/uploads/
```

To restore:

```bash
tar -xzvf "ozone_uploads_[TIMESTAMP].tar.gz" -C ./
```

---

## 3. Safe Rollback Strategy

### 3.1 Application Code Rollback

1. **Vercel Deployments**:
   - Navigate to **Deployments** tab in Vercel.
   - Locate the previous stable deployment.
   - Click **Instant Rollback**. Traffic is immediately routed to the prior build artifact without a re-build.
2. **Container Deployments**:
   - Re-tag or redeploy the previous container image tag (e.g. `ozone-poster-generator:v1.0.0-previous`).
   - Run `docker compose up -d`.

### 3.2 Database Migration Rollback Strategy

Prisma follows forward-only migration philosophy. To safely handle schema rollbacks without data loss:

1. **Non-Breaking Schema Changes (Expand-Contract Pattern)**:
   - When introducing new fields (e.g. template properties), always mark them optional (`String?`) or provide safe default values.
   - Deploy code that reads both old and new fields before enforcing new constraints.
2. **Reverting a Problematic Migration**:
   - Generate a forward "down" migration that safely undoes the specific schema changes:
     ```bash
     # Create a reverting migration
     npx prisma migrate dev --name revert_feature_x
     ```
   - In production, apply the revert using:
     ```bash
     npx prisma migrate deploy
     ```

---

## 4. Operational Logging & Alert Triage

The application emits structured JSON logs via [`src/lib/logger.ts`](file:///c:/Users/admin/Desktop/antigravity%20projects/ozone%20poster%20generator/src/lib/logger.ts).

### 4.1 Log Schema

```json
{
  "timestamp": "2026-10-21T18:45:00.123Z",
  "level": "info",
  "category": "drafts",
  "message": "Draft created successfully",
  "metadata": {
    "draftId": "cm123...",
    "templateId": "saint",
    "name": "African Night Poster",
    "userId": "usr_456..."
  }
}
```

### 4.2 Triage SOP

| Event / Category | Severity | Common Cause | Action Runbook |
| :--- | :--- | :--- | :--- |
| `auth` login failure | `WARN` | Operator mistyped password or unknown username | Check if operator account is provisioned (`npm run db:seed`). |
| `upload` rejected | `WARN` | Unsupported file format or magic bytes mismatch | Remind operator to upload authentic PNG, JPEG, or WebP files $\le 10$ MB. |
| `drafts` database error | `ERROR` | Database connection limit reached or pooler exhausted | Check Supabase pooler health and connection limits. Verify `DATABASE_URL` uses port 6543. |
| `storage` upload failure | `ERROR` | Invalid Supabase service role key or bucket permissions | Verify `SUPABASE_SERVICE_ROLE_KEY` and ensure bucket `ozone-poster-assets` exists and is public. |

---

## 5. Operator Credential & Secret Rotation SOP

### 5.1 Rotating `AUTH_SECRET`
Rotating `AUTH_SECRET` immediately invalidates all active operator sessions, requiring re-login.

1. Generate new 32-byte secret:
   ```bash
   openssl rand -hex 32
   ```
2. Update `AUTH_SECRET` in provider dashboard (Vercel / Railway / `.env`).
3. Trigger application redeployment.
4. Notify operators that they will need to sign in again.

### 5.2 Rotating Database Password
1. Update database password in Supabase Dashboard (**Project Settings > Database > Database password**).
2. Update `DATABASE_URL` and `DIRECT_URL` in hosting provider environment settings.
3. Redeploy application and verify `/api/health` and `/app/drafts`.
