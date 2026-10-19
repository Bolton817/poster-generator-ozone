import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TEMPLATE_PREVIEWS = [
  { id: "reddington", day: "Monday", name: "Reddington", title: "Old Classics & Sundowners", tag: "Best for Monday Sundowners", color: "from-amber-600/20 to-orange-950/40" },
  { id: "saint", day: "Tuesday", name: "Saint", title: "African Night (Afro)", tag: "Best for Afrobeat Nights", color: "from-yellow-600/20 to-emerald-950/40" },
  { id: "lannister", day: "Wednesday", name: "Lannister", title: "Groovy Wednesday", tag: "Best for Midweek Groove", color: "from-purple-600/20 to-pink-950/40" },
  { id: "shelby", day: "Thursday", name: "Shelby", title: "Karaoke Night", tag: "Best for Karaoke Night", color: "from-red-600/20 to-amber-950/40" },
  { id: "lothbrok", day: "Friday", name: "Lothbrok", title: "Flight Fridays", tag: "Best for Premium Fridays", color: "from-cyan-600/20 to-blue-950/40" },
  { id: "escobar", day: "Saturday", name: "Escobar", title: "Saturday Fiesta", tag: "Best for Saturday Fiesta", color: "from-rose-600/20 to-violet-950/40" },
  { id: "pinkman", day: "Sunday", name: "Pinkman", title: "Old Skool Sundays", tag: "Best for Old Skool Sundays", color: "from-orange-600/20 to-stone-950/40" },
];

export const metadata = {
  title: "Weekly Templates — Ozone Lounge Poster Generator",
};

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Weekly Event Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Seven distinct creative identities organized Monday through Sunday.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/drafts">
            <Button variant="outline" size="sm">
              View Saved Drafts
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TEMPLATE_PREVIEWS.map((tpl) => (
          <div
            key={tpl.id}
            className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all shadow-lg overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tpl.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-semibold text-amber-400">
                  <Calendar className="w-3 h-3" />
                  {tpl.day}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {tpl.name}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {tpl.tag}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-6 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                1080 × 1350 px (4:5)
              </span>
              <span className="text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-xs font-semibold">
                <span>Select</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
