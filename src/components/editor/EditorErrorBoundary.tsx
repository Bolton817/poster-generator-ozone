"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface EditorErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class EditorErrorBoundary extends Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
    };
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || "An unexpected error occurred in the poster editor.",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[EditorErrorBoundary] Caught rendering exception:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center p-6 min-h-[360px] text-center bg-slate-900/90 border border-slate-800 rounded-2xl m-4 space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-white">
              {this.props.fallbackTitle || "Editor Rendering Alert"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected issue occurred while rendering this poster template. Your draft
              data is safe and not corrupted.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] font-mono p-2.5 rounded-lg bg-slate-950 text-amber-300 border border-slate-800 break-all text-left mt-2">
                {this.state.errorMessage}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={this.handleReset}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Canvas</span>
            </Button>

            <Link href="/app/templates">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-slate-300 border-slate-700 bg-slate-800/80 hover:bg-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Templates</span>
              </Button>
            </Link>

            <Link href="/app/drafts">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Drafts Library</span>
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
