# Production Decision Register — Ozone Lounge Poster Generator

**Stage:** 00 — Repository reconnaissance and requirements lock  
**Date:** 18 October 2026  
**Status:** Active Living Register (TDD Appendix H & Section 19)  

This register records all open and architectural decisions. Decisions with provisional defaults must not be silently turned into permanent assumptions without explicit approval.

---

## Decision Matrix

| # | Decision Item | Safe Interim Development Behavior | Production Exit Requirement | Status |
| :- | :--- | :--- | :--- | :- |
| **01** | **Primary publishing channel / aspect ratio** | Configurable master canvas; provisional default **1080 × 1350 px (4:5 portrait)** for social-feed. | Product owner selects feed 4:5 or Story/Status 9:16 (or secondary format presets). | **Provisional Default Locked** |
| **02** | **Official Ozone Lounge logo** | Use clean SVG/PNG placeholder clearly labeled `DEVELOPMENT_ONLY`. Keep logo in independent layer with aspect ratio preservation. | Approved original vector logo and permitted color variants supplied. | **Provisional Default Locked** |
| **03** | **Hero / DJ imagery** | Licensed placeholder / sample photography only. Support crop and focal-point (0..1 normalized coordinates). | Approved photo library or documented license/provenance. | **Provisional Default Locked** |
| **04** | **Event start times & date** | Blank optional fields. Render conditionally. Show export preflight warning if missing. | Owner confirms whether date and start time are strictly required before download. | **Provisional Default Locked** |
| **05** | **Venue / location / contact / social** | Blank optional fields. Conditional rendering without leaving empty cards or awkward holes. | Owner confirms correct venue address, phone number, and official social handles. | **Provisional Default Locked** |
| **06** | **Friday special offer (Flight Fridays)** | Blank offer fields; no offer module rendered by default. Rebalance layout dynamically. Do NOT render "No special offer provided". | Product owner confirms whether Friday receives a promotion or remains offer-free. | **Provisional Default Locked** |
| **07** | **Authentication identity model** | Operator sign-in form asks **only for username and password**. Public registration is disabled. Administrator-provisioned accounts. | Confirm whether internal email metadata is permitted for account administration in the chosen auth library (e.g. Better Auth). | **Provisional Default Locked** |
| **08** | **Draft visibility scope** | Private, owner-scoped drafts (`userId = session.user.id`). | Product owner confirms whether drafts are strictly private or shared across all lounge operators. | **Provisional Default Locked** |
| **09** | **Export formats** | Dual target: **PNG** (lossless default) and high-quality **JPEG**. File names sanitized: `Ozone-Lounge-[Day]-[Template]-[Title].[ext]`. | Confirm operational needs and verify mobile browser download/share behaviors. | **Provisional Default Locked** |
| **10** | **Asset storage provider** | Abstract storage adapter interface (`StorageService`) with local filesystem adapter during local development. | Select production object storage provider (e.g. Supabase Storage / S3 / R2) and configure CORS and access keys. | **Provisional Default Locked** |

---

## Operating Rule

> [!CAUTION]
> Unknown information is a blank/null field plus a visible preflight warning, never invented poster copy.
