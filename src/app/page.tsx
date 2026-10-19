import Link from "next/link";
import { Sparkles, CheckCircle2, ShieldCheck, Layers, Smartphone, LogIn, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getCurrentUser();

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
              Poster Generator • Authenticated Suite
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Weekly event poster generator for authorized Ozone Lounge operators. Choose a weekly template, adjust details, and export production assets.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Better Auth & Supabase PostgreSQL Active</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Mobile-First Master Canvas (1080×1350)</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Seven Weekly Event Templates Seeded</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Protected Operator Access Enforced</span>
          </div>
        </div>

        {user ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6 text-xs text-amber-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Signed in as {user.name || user.email}</p>
              <p className="text-slate-400 text-[11px] font-mono">
                Role: {(user as { role?: string }).role || "operator"}
              </p>
            </div>
            <Link
              href="/app/templates"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg flex items-center gap-1 transition-colors"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mb-6">
            <Link
              href="/login"
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-950" />
              <span>Sign In as Operator</span>
            </Link>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Status: Protected Mode</span>
          <span className="font-mono text-[11px] text-slate-400">v1.0.0-auth</span>
        </div>
      </div>
    </main>
  );
}
