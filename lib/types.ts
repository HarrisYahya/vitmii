// lib/types.ts
export type Product = {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;

  // ✅ YOUR REAL DB COLUMN (NOT category_id)
  category: string | null;
};
