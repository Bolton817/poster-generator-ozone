import { Metadata } from "next";
import Link from "next/link";
import { DiagnosticCanvasPoc } from "@/components/canvas/DiagnosticCanvasPoc";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Canvas & Export POC | Ozone Lounge Poster Generator",
  description: "Stage 07 diagnostic test harness for responsive canvas scaling and master raster export.",
};

export default function CanvasPocPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Test Harness Navigation Bar */}
      <header className="h-14 border-b border-zinc-800/80 px-4 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/app/templates"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1 rounded bg-zinc-800/50 border border-zinc-700/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Templates
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-sm font-semibold text-zinc-100">
              Stage 07: Canvas & Export POC
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
              1080×1350 Fixed
            </span>
          </div>
        </div>

        <div className="text-xs text-zinc-500 font-mono">
          TDD Stage 07 Verification Harness
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <DiagnosticCanvasPoc />
      </main>
    </div>
  );
}
