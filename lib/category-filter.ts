import { create } from "zustand";

type CategoryFilterState = {
  activeCategory: string | null;
  setCategory: (name: string | null) => void;
};

export const useCategoryFilter = create<CategoryFilterState>((set) => ({
  activeCategory: null,
  setCategory: (name) => set({ activeCategory: name }),
}));
