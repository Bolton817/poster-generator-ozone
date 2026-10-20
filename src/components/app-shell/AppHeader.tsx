"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/features/theme/theme-context";
import { Sparkles, User, LogOut, ChevronDown, Shield } from "lucide-react";

interface AppHeaderProps {
  user?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  title?: string;
}

export function AppHeader({ user, title = "Ozone Lounge" }: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/login";
          },
        },
      });
    } catch {
      window.location.href = "/login";
    }
  };

  const displayName = user?.name || user?.username || "Operator";
  const userRole = user?.role || "operator";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/app/templates"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-amber-500/40 rounded-lg p-1 transition-colors"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Ozone Lounge
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-amber-400">
                Poster Generator
              </span>
            </div>
          </Link>

          {title && (
            <div className="flex items-center gap-2 pl-2 sm:pl-4 sm:border-l sm:border-slate-800 min-w-0">
              <span className="text-sm font-semibold text-slate-200 truncate">
                {title}
              </span>
            </div>
          )}
        </div>

        {/* Actions: Theme Toggle + User Menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-label="User account menu"
              className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs uppercase">
                {displayName.charAt(0)}
              </div>
              <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline-block">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px] font-mono capitalize text-slate-400">
                      {userRole}
                    </span>
                  </div>
                </div>

                <Link
                  href="/app/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Account Preferences</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
