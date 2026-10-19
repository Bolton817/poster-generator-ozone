import { Sparkles, CheckCircle2, ShieldCheck, Layers, Smartphone } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Ozone Lounge
            </h1>
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">
              Poster Generator • Stage 01 Baseline
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Application bootstrap and dependency baseline initialized. The execution contract is locked to Stage 01.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Next.js App Router & Strict TypeScript</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Mobile-First Fixed Canvas Target (1080×1350)</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Seven Unique Weekly Templates (Stage-Gated)</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Production Guardrails & Decision Register Active</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Status: System Healthy</span>
          <span className="font-mono text-[11px] text-slate-400">v1.0.0-bootstrap</span>
        </div>
      </div>
    </main>
  );
}
