"use client";

import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Loader2 } from "lucide-react";

export interface DeleteDraftDialogProps {
  isOpen: boolean;
  draftName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDraftDialog({
  isOpen,
  draftName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteDraftDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      title="Delete Poster Draft?"
      description={`Are you sure you want to delete "${draftName}"? This action permanently removes the draft from your account.`}
    >
      <div className="flex items-center gap-3 p-3.5 my-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs">
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        <span>Any unsaved exports or revisions from this draft will be lost.</span>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onConfirm}
          disabled={isDeleting}
          className="bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Deleting...</span>
            </>
          ) : (
            <span>Delete Draft</span>
          )}
        </Button>
      </div>
    </Dialog>
  );
}
