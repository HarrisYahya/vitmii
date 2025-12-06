// components/admin/ProductManager.tsx
"use client";

import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import Header from "../layout/Header";

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string | null;
  category: string | null;
};

export default function ProductManager() {
  const { products, categories, refresh } = useAdmin();

  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "",
    image: "",
    category: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // ----------------------------------------------------
  // ✅ ADD PRODUCT (STRICT VALIDATION)
  // ----------------------------------------------------
  async function addProduct() {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.name.trim()) {
      setErrorMsg("Product name is required");
      setLoading(false);
      return;
    }

    if (!form.price || isNaN(Number(form.price))) {
      setErrorMsg("Valid price is required");
      setLoading(false);
      return;
    }

    if (!form.unit.trim()) {
      setErrorMsg("Unit is required");
      setLoading(false);
      return;
    }

    if (!form.image.trim()) {
      setErrorMsg("Image URL is required");
      setLoading(false);
      return;
    }

    if (!form.category.trim()) {
      setErrorMsg("Category is required");
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      unit: form.unit.trim(),
      image: form.image.trim(),
      category: form.category.trim(),
    };

    const { error } = await supabase.from("products").insert([payload]);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    resetForm();
    setSuccessMsg("Product added successfully!");
    await refresh();
    setLoading(false);
    setIsOpen(false);
  }

  // ----------------------------------------------------
  // ✅ DELETE PRODUCT (CONFIRMATION)
  // ----------------------------------------------------
  async function deleteProduct(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setLoading(true);
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    await refresh();
    setLoading(false);
  }

  // ----------------------------------------------------
  // START EDIT
  // ----------------------------------------------------
  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      unit: p.unit,
      image: p.image ?? "",
      category: p.category ?? "",
    });
    setIsOpen(true);
  }

  // ----------------------------------------------------
  // ✅ UPDATE PRODUCT (STRICT VALIDATION)
  // ----------------------------------------------------
  async function updateProduct() {
    if (!editingId) return;

    setLoading(true);
    setErrorMsg("");

    if (!form.name.trim()) {
      setErrorMsg("Product name is required");
      setLoading(false);
      return;
    }

    if (!form.price || isNaN(Number(form.price))) {
      setErrorMsg("Valid price is required");
      setLoading(false);
      return;
    }

    if (!form.unit.trim()) {
      setErrorMsg("Unit is required");
      setLoading(false);
      return;
    }

    if (!form.image.trim()) {
      setErrorMsg("Image URL is required");
      setLoading(false);
      return;
    }

    if (!form.category.trim()) {
      setErrorMsg("Category is required");
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      unit: form.unit.trim(),
      image: form.image.trim(),
      category: form.category.trim(),
    };

    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", editingId);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    resetForm();
    setEditingId(null);
    await refresh();
    setLoading(false);
    setIsOpen(false);
  }

  // ----------------------------------------------------
  // RESET FORM
  // ----------------------------------------------------
  function resetForm() {
    setForm({
      name: "",
      price: "",
      unit: "",
      image: "",
      category: "",
    });
    setEditingId(null);
    setErrorMsg("");
    setSuccessMsg("");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* ✅ ADD BUTTON */}
        <button
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
        >
          + Add Product
        </button>

        {/* ✅ POPUP MODAL */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-xl relative">

              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-4 text-xl"
              >
                ✕
              </button>

              <h3 className="text-xl font-semibold mb-4">
                {editingId ? "Edit Product" : "Add Product"}
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <input
                  className="border p-2 rounded"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />

                <input
                  className="border p-2 rounded"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                />

                <input
                  className="border p-2 rounded"
                  placeholder="Unit"
                  value={form.unit}
                  onChange={(e) =>
                    setForm({ ...form, unit: e.target.value })
                  }
                />

                <input
                  className="border p-2 rounded"
                  placeholder="Image URL"
                  value={form.image}
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.value })
                  }
                />

                <select
                  className="border p-2 rounded"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {errorMsg && (
                  <p className="text-red-600 text-sm">{errorMsg}</p>
                )}
                {successMsg && (
                  <p className="text-green-600 text-sm">{successMsg}</p>
                )}

                {!editingId ? (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-2"
                    onClick={addProduct}
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Product"}
                  </button>
                ) : (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-2"
                    onClick={updateProduct}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Product"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ MODERN PRODUCT LIST */}
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          Product Manager
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: Product) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col"
            >
              {p.image && (
                <div className="h-44 w-full overflow-hidden bg-gray-100">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                </div>
              )}

              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-lg text-gray-900">
                    {p.name}
                  </p>
                  {p.category && (
                    <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-semibold text-gray-900">
                    ${p.price}
                  </span>{" "}
                  / {p.unit}
                </p>

                <div className="flex gap-2 mt-auto pt-4">
                  <button
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm font-medium transition"
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </button>

                  <button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
