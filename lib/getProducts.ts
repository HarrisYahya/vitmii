import { supabase } from "./supabase";
import { Product } from "./types";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error loading products:", error.message);
    return [];
  }

  return data as Product[];
}
