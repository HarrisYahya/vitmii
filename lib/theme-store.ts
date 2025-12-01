// lib/theme-store.ts
"use client";

import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (value: Theme) => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",

  toggleTheme: () => {
    const current = get().theme;
    const newTheme: Theme = current === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    set({ theme: newTheme });
  },

  setTheme: (value: Theme) => {
    document.documentElement.classList.toggle("dark", value === "dark");
    localStorage.setItem("theme", value);
    set({ theme: value });
  },
}));
