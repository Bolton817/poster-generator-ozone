import React from "react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { DraftsList } from "@/components/drafts/DraftsList";
import { DraftSummary } from "@/features/drafts/types";

export const metadata = {
  title: "Saved Drafts — Ozone Lounge Poster Generator",
};

export default async function DraftsPage() {
  const user = await requireAuth();

  const rawDrafts = await db.posterDraft.findMany({
    where: {
      userId: user.id, // Strictly owner-scoped per Decision 08
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      templateId: true,
      templateVersion: true,
      schemaVersion: true,
      thumbnailUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Serialize dates for Client Component boundary
  const drafts: DraftSummary[] = rawDrafts.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  return <DraftsList initialDrafts={drafts} />;
}
