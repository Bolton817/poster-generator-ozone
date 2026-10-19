"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  type?: "success" | "warning" | "error" | "info";
  message: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
}

export function Toast({
  type = "info",
  message,
  description,
  onDismiss,
  className = "",
}: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/30 bg-slate-900/95 text-emerald-200",
    warning: "border-amber-500/30 bg-slate-900/95 text-amber-200",
    error: "border-rose-500/30 bg-slate-900/95 text-rose-200",
    info: "border-sky-500/30 bg-slate-900/95 text-sky-200",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 ${borders[type]} ${className}`}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-semibold text-white tracking-tight">{message}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
