"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DraftSummary } from "@/features/drafts/types";
import { duplicateDraft, deleteDraft } from "@/features/drafts/drafts-client";
import { DraftCard } from "./DraftCard";
import { DeleteDraftDialog } from "./DeleteDraftDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FolderOpen, Search, Plus, AlertCircle, CheckCircle2, Archive, Loader2 } from "lucide-react";
import { BatchExportModal } from "@/components/export/BatchExportModal";
import {
  loadDraftBatchItems,
  getWeeklyTemplateBatchItems,
} from "@/features/export/batch-export-service";
import { BatchExportItem } from "@/features/export/types";

export interface DraftsListProps {
  initialDrafts: DraftSummary[];
}

export function DraftsList({ initialDrafts }: DraftsListProps) {
  const [drafts, setDrafts] = useState<DraftSummary[]>(initialDrafts);
  const [searchQuery, setSearchQuery] = useState("");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deletingDraft, setDeletingDraft] = useState<DraftSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchExportItem[]>([]);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filter drafts by name or templateId
  const filteredDrafts = useMemo(() => {
    if (!searchQuery.trim()) return drafts;
    const query = searchQuery.toLowerCase();
    return drafts.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.templateId.toLowerCase().includes(query)
    );
  }, [drafts, searchQuery]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDuplicate = async (draftId: string) => {
    setDuplicatingId(draftId);
    try {
      const newDraft = await duplicateDraft(draftId);
      setDrafts((prev) => [newDraft, ...prev]);
      showNotification("success", `Created "${newDraft.name}"`);
    } catch (err: unknown) {
      console.error("[DraftsList] Duplicate error:", err);
      const msg = err instanceof Error ? err.message : "Failed to duplicate draft";
      showNotification("error", msg);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDraft) return;
    setIsDeleting(true);
    try {
      await deleteDraft(deletingDraft.id);
      setDrafts((prev) => prev.filter((d) => d.id !== deletingDraft.id));
      showNotification("success", `Deleted "${deletingDraft.name}"`);
      setDeletingDraft(null);
    } catch (err: unknown) {
      console.error("[DraftsList] Delete error:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete draft";
      showNotification("error", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenBatchExport = async () => {
    setIsLoadingBatch(true);
    try {
      if (drafts.length > 0) {
        const items = await loadDraftBatchItems(drafts);
        setBatchItems(items);
      } else {
        const items = await getWeeklyTemplateBatchItems();
        setBatchItems(items);
      }
      setIsBatchModalOpen(true);
    } catch (err: unknown) {
      console.error("[DraftsList] Batch load error:", err);
      showNotification("error", "Failed to load drafts for batch export");
    } finally {
      setIsLoadingBatch(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notification && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-950/80 border-emerald-800/80 text-emerald-300"
              : "bg-rose-950/80 border-rose-800/80 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Saved Poster Drafts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access, duplicate, and manage your ongoing weekly poster designs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenBatchExport}
            disabled={isLoadingBatch}
            className="gap-2 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
          >
            {isLoadingBatch ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Archive className="w-4 h-4 text-amber-400" />
            )}
            <span>Batch Export (.ZIP)</span>
          </Button>

          <Link href="/app/templates">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>New Poster</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Filter Bar */}
      {drafts.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search drafts by name or day..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900/60 border-slate-800 text-xs text-slate-200"
          />
        </div>
      )}

      {/* Draft Cards Grid or Empty States */}
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
      ) : filteredDrafts.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-slate-800 bg-slate-900/20">
          <p className="text-xs text-slate-400">
            No drafts matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs text-amber-400 hover:underline mt-2 inline-block"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onDuplicate={handleDuplicate}
              onDeleteRequest={(d) => setDeletingDraft(d)}
              isDuplicating={duplicatingId === draft.id}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteDraftDialog
        isOpen={Boolean(deletingDraft)}
        draftName={deletingDraft?.name || "Draft"}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingDraft(null)}
      />

      {/* Batch Export Modal */}
      <BatchExportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        availableItems={batchItems}
      />
    </div>
  );
}
