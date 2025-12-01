// components/admin/ProductManager.tsx
"use client";

import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import Header from "../layout/Header";

export default function ProductManager() {
  const { products, categories, refresh } = useAdmin();

  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "",             // required in your SQL
    image: "",
    category: "",         // text, not ID
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function addProduct() {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.name || !form.price || !form.unit) {
      setErrorMsg("Name, price and unit are required");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        name: form.name,
        price: Number(form.price),
        unit: form.unit,
        image: form.image,
        category: form.category,   // text
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setForm({
      name: "",
      price: "",
      unit: "",
      image: "",
      category: "",
    });

    setSuccessMsg("Product added successfully!");
    await refresh();
    setLoading(false);
  }

  return (
    <div>
      <Header />
      <h2 className="text-2xl font-semibold">Products</h2>

      <div className="grid grid-cols-2 gap-4 my-4">
        {products.map((p) => (
          <div key={p.id} className="border p-3 rounded">
            <p className="font-bold">{p.name}</p>
            <p>${p.price} / {p.unit}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold">Add Product</h3>

      <div className="flex flex-col gap-2 mt-2">
        <input
          className="border p-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="Unit (e.g. piece, kg)"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <select
          className="border p-2"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {errorMsg && <p className="text-red-600">{errorMsg}</p>}
        {successMsg && <p className="text-green-600">{successMsg}</p>}

        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={addProduct}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </div>
    </div>
  );
}
