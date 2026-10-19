"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, startIcon, endIcon, id, className = "", ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-300 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full py-2.5 px-3 min-h-[44px] bg-slate-900 border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors disabled:opacity-50 ${
              startIcon ? "pl-9" : ""
            } ${endIcon ? "pr-9" : ""} ${
              error
                ? "border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30"
                : "border-slate-800 focus:border-amber-500"
            } ${className}`}
            {...props}
          />
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
