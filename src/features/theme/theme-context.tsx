"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "ozone_theme_preference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
        applyThemeClass(savedTheme);
      } else {
        applyThemeClass("dark");
      }
    } catch {
      applyThemeClass("dark");
    }
    setMounted(true);
  }, []);

  const applyThemeClass = (targetTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(targetTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeClass(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage write failure
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {/* Prevent flash of unstyled theme before mount */}
      <div className={mounted ? "" : "opacity-0 transition-opacity duration-150"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "bright" : "dark"} interface theme`}
      className={`p-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer ${
        theme === "dark"
          ? "bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700/80"
          : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80"
      } ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
