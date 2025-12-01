// lib/cart-store.ts
"use client";

import { create } from "zustand";
import { Product } from "./types";

type CartState = {
  items: Product[];
  addItem: (item: Product) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>((set) => ({
  items: [],

  addItem: (item: Product) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  clearCart: () =>
    set(() => ({
      items: [],
    })),
}));
