import React from "react";
import { requireAuth } from "@/lib/session";
import { ThemeProvider } from "@/features/theme/theme-context";
import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppNavigation } from "@/components/app-shell/AppNavigation";

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-900 transition-colors">
        <AppHeader user={user} />
        <AppNavigation />
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 sm:pb-8">
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
