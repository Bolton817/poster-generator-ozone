import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { FolderOpen, Clock, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Saved Drafts — Ozone Lounge Poster Generator",
};

export default async function DraftsPage() {
  const user = await requireAuth();

  const drafts = await db.posterDraft.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Saved Poster Drafts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your ongoing poster designs and edit content.
          </p>
        </div>
        <div>
          <Link href="/app/templates">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>New Poster</span>
            </Button>
          </Link>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <div className="inline-flex p-3 rounded-xl bg-slate-800/80 text-slate-400 mb-3">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No drafts found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            You don&apos;t have any saved poster drafts yet. Select a template to start designing.
          </p>
          <Link href="/app/templates">
            <Button size="sm">Choose Template</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                    {draft.templateId}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white truncate">
                  {draft.name}
                </h3>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Version {draft.templateVersion}.0
                </span>
                <span className="text-xs font-medium text-amber-400 inline-flex items-center gap-1">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
