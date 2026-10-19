import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Operator Login — Ozone Lounge Poster Generator",
  description: "Sign in to access the Ozone Lounge weekly poster generator and saved drafts",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/app/templates");
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-950 text-slate-100">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
