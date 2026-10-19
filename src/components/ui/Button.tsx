"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-sm focus:ring-amber-400 focus:ring-offset-slate-950 dark:focus:ring-offset-slate-950",
      secondary:
        "bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 border border-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 focus:ring-slate-400 focus:ring-offset-slate-950",
      outline:
        "border border-slate-700 hover:bg-slate-800/50 text-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/50 focus:ring-amber-500/40 focus:ring-offset-slate-950",
      ghost:
        "text-slate-300 hover:text-white hover:bg-slate-800/40 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/40 focus:ring-slate-400 focus:ring-offset-slate-950",
      danger:
        "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm focus:ring-rose-500 focus:ring-offset-slate-950",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-xs gap-1.5 min-h-[36px]",
      md: "h-11 px-4 text-sm gap-2 min-h-[44px]", // Minimum 44px touch target on mobile
      lg: "h-13 px-6 text-base gap-2.5 min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
