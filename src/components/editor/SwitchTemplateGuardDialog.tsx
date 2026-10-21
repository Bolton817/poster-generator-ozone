"use client";

import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Save, Trash2, X, RefreshCw } from "lucide-react";

export interface SwitchTemplateGuardDialogProps {
  isOpen: boolean;
  targetTemplateName: string;
  targetDayLabel: string;
  isSaving?: boolean;
  onSaveAndSwitch: () => void | Promise<void>;
  onDiscardAndSwitch: () => void;
  onCancel: () => void;
}

export function SwitchTemplateGuardDialog({
  isOpen,
  targetTemplateName,
  targetDayLabel,
  isSaving = false,
  onSaveAndSwitch,
  onDiscardAndSwitch,
  onCancel,
}: SwitchTemplateGuardDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      title="Unsaved Poster Edits"
      description="You have unsaved edits in your current poster document."
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-amber-300">
              Switching to {targetTemplateName} ({targetDayLabel})
            </p>
            <p className="text-amber-200/80 leading-relaxed">
              If you leave now without saving, changes made during this editing session will be lost permanently.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {/* Option 1: Save & Switch */}
          <Button
            type="button"
            variant="primary"
            onClick={onSaveAndSwitch}
            disabled={isSaving}
            className="w-full justify-center gap-2 text-xs py-2.5 font-semibold"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-950" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Draft & Switch Template</span>
          </Button>

          {/* Option 2: Discard & Switch */}
          <Button
            type="button"
            variant="danger"
            onClick={onDiscardAndSwitch}
            disabled={isSaving}
            className="w-full justify-center gap-2 text-xs py-2.5 font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span>Discard Changes & Switch</span>
          </Button>

          {/* Option 3: Cancel & Stay */}
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full justify-center gap-2 text-xs py-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
            <span>Stay in Current Editor</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
