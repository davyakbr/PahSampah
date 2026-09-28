"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-card-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-theme focus:outline-none"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      ) : (
        <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      )}
    </button>
  );
}
