"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app/templates";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signIn.username(
        {
          username: trimmedUsername,
          password: password,
        },
        {
          onError: () => {
            // OWASP compliant generic error: do not reveal if username exists
            setErrorMessage("Invalid username or password. Please check your credentials and try again.");
            setLoading(false);
          },
          onSuccess: () => {
            window.location.href = callbackUrl;
          },
        }
      );

      if (result?.error) {
        setErrorMessage("Invalid username or password. Please check your credentials and try again.");
        setLoading(false);
      }
    } catch {
      setErrorMessage("Invalid username or password. Please check your credentials and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-7 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Operator Sign In
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ozone Lounge Marketing & Poster Suite
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-5 animate-in fade-in-50 duration-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator username"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 leading-normal">
            Authorised Ozone Lounge operators only.
            <br />
            Public registration is restricted.
          </p>
        </div>
      </div>
    </div>
  );
}
