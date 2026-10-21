"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTemplatesInOrder, TemplateDefinition } from "@/features/templates/registry";
import { TemplateId } from "@/features/poster/schema";
import { SwitchTemplateGuardDialog } from "./SwitchTemplateGuardDialog";
import { ChevronDown, Check, Sparkles } from "lucide-react";

export interface TemplateSwitcherProps {
  currentTemplateId: TemplateId;
  isDirty: boolean;
  onSaveNow: () => Promise<unknown>;
  isSaving?: boolean;
}

export function TemplateSwitcher({
  currentTemplateId,
  isDirty,
  onSaveNow,
  isSaving = false,
}: TemplateSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<TemplateDefinition | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const templates = getTemplatesInOrder();
  const currentTemplate = templates.find((t) => t.id === currentTemplateId) || templates[0];

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTemplate = (target: TemplateDefinition) => {
    setIsOpen(false);
    if (target.id === currentTemplateId) return;

    if (isDirty) {
      // Trigger guard dialog
      setPendingTarget(target);
    } else {
      // Direct switch
      router.push(`/app/templates/${target.id}`);
    }
  };

  const handleSaveAndSwitch = async () => {
    if (!pendingTarget) return;
    setIsSwitching(true);
    try {
      await onSaveNow();
      router.push(`/app/templates/${pendingTarget.id}`);
    } catch (err) {
      console.error("[TemplateSwitcher] Save before switch failed:", err);
      // Still allow navigation if operator intentionally confirmed save attempt
      router.push(`/app/templates/${pendingTarget.id}`);
    } finally {
      setIsSwitching(false);
      setPendingTarget(null);
    }
  };

  const handleDiscardAndSwitch = () => {
    if (!pendingTarget) return;
    const targetUrl = `/app/templates/${pendingTarget.id}`;
    setPendingTarget(null);
    router.push(targetUrl);
  };

  const handleCancelSwitch = () => {
    setPendingTarget(null);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Active Template Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer group"
      >
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
          {currentTemplate.dayLabel.substring(0, 3)}
        </span>
        <span className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate max-w-[120px] sm:max-w-[180px]">
          {currentTemplate.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Switch Daily Template
            </span>
            <span className="text-[10px] text-slate-500">
              7 available
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-800/40">
            {templates.map((tpl) => {
              const isSelected = tpl.id === currentTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer pt-2 ${
                    isSelected
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                      : "hover:bg-slate-800/80 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold shrink-0 ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-800 text-slate-400 border border-slate-700/60"
                      }`}
                    >
                      {tpl.dayLabel.substring(0, 3).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {tpl.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {tpl.eventTitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Template Switching Guard Dialog */}
      {pendingTarget && (
        <SwitchTemplateGuardDialog
          isOpen={Boolean(pendingTarget)}
          targetTemplateName={pendingTarget.name}
          targetDayLabel={pendingTarget.dayLabel}
          isSaving={isSaving || isSwitching}
          onSaveAndSwitch={handleSaveAndSwitch}
          onDiscardAndSwitch={handleDiscardAndSwitch}
          onCancel={handleCancelSwitch}
        />
      )}
    </div>
  );
}
