"use client";

import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function CategoryManager() {
  const { categories, refresh } = useAdmin();

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function addCategory() {
    let imageUrl = null;

    // Upload image if selected
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;

      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("categories") // <-- bucket name MUST be EXACT
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        alert("Image upload failed!");
        return;
      }

      // Public URL
      const { data: urlData } = supabase.storage
        .from("categories")
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    // Insert category
    const { error } = await supabase.from("categories").insert([
      {
        name,
        image: imageUrl,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Failed to add category");
      return;
    }

    setName("");
    setImageFile(null);
    refresh(); // refresh context
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">Categories</h2>

      {/* List categories */}
      <ul className="my-3">
        {categories.map((c) => (
          <li key={c.id} className="border p-2 rounded mb-1 flex items-center gap-3">
            {c.image && (
              <img
                src={c.image}
                className="w-10 h-10 rounded object-cover border"
              />
            )}
            {c.name}
          </li>
        ))}
      </ul>

      {/* Add category */}
      <div className="flex flex-col gap-2 border p-3 rounded">
        <input
          className="border p-2 rounded"
          placeholder="New Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <button
          className="bg-green-500 text-white p-2 rounded"
          onClick={addCategory}
        >
          Add Category
        </button>
      </div>
    </div>
  );
}
