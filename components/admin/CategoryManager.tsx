"use client";

import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  image: string | null;
};

export default function CategoryManager() {
  const { categories, refresh } = useAdmin();

  // Add form state
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit state (per-item)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // -----------------------
  // Add Category
  // -----------------------
  async function addCategory() {
    // prevent double submit
    if (loading) return;

    if (!name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    setLoading(true);

    let imageUrl: string | null = null;

    try {
      // Upload image if present
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("categories")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error(uploadError);
          alert("Image upload failed.");
          setLoading(false);
          return;
        }

        imageUrl = supabase.storage
          .from("categories")
          .getPublicUrl(uploadData.path).data.publicUrl;
      }

      const { error: insertError } = await supabase.from("categories").insert({
        name,
        image: imageUrl || null,
      });

      if (insertError) {
        console.error(insertError);
        alert("Failed to save category.");
        setLoading(false);
        return;
      }

      setName("");
      setImageFile(null);
      refresh();
    } finally {
      setLoading(false);
    }
  }

  // -----------------------
  // Delete Category
  // -----------------------
  async function deleteCategory(id: string, imageUrl?: string | null) {
    if (!confirm("Delete this category?")) return;

    setLoading(true);
    try {
      // Delete DB row
      const { error: delError } = await supabase.from("categories").delete().eq("id", id);
      if (delError) {
        console.error(delError);
        alert("Failed to delete category.");
        return;
      }

      // Optionally delete file from storage (best-effort)
      if (imageUrl) {
        try {
          const bucket = "categories";
          const objectName = imageUrl.split(`${bucket}/`)[1];
          if (objectName) {
            await supabase.storage.from(bucket).remove([objectName]);
          }
        } catch (e) {
          console.warn("Could not delete storage file", e);
        }
      }

      refresh();
    } finally {
      setLoading(false);
    }
  }

  // -----------------------
  // Start Editing
  // -----------------------
  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditFile(null);
  }

  // -----------------------
  // Cancel Editing
  // -----------------------
  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditFile(null);
    setEditLoading(false);
  }

  // -----------------------
  // Save Edit
  // -----------------------
  async function saveEdit(id: string, currentImageUrl: string | null) {
    // prevent double submit on edit
    if (editLoading) return;

    if (!editName.trim()) {
      alert("Please enter a category name.");
      return;
    }

    setEditLoading(true);

    let imageUrl = currentImageUrl;

    try {
      // If a new file is provided for the edit, upload it and replace imageUrl
      if (editFile) {
        const fileExt = editFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("categories")
          .upload(fileName, editFile);

        if (uploadError) {
          console.error(uploadError);
          alert("Image upload failed.");
          setEditLoading(false);
          return;
        }

        imageUrl = supabase.storage.from("categories").getPublicUrl(uploadData.path).data.publicUrl;

        // optional: delete previous file (best-effort)
        if (currentImageUrl) {
          try {
            const bucket = "categories";
            const objectName = currentImageUrl.split(`${bucket}/`)[1];
            if (objectName) {
              await supabase.storage.from(bucket).remove([objectName]);
            }
          } catch (e) {
            console.warn("Could not delete previous storage file", e);
          }
        }
      }

      // Perform update
      const { error: updateError } = await supabase
        .from("categories")
        .update({ name: editName, image: imageUrl || null })
        .eq("id", id);

      if (updateError) {
        console.error(updateError);
        alert("Failed to update category.");
        setEditLoading(false);
        return;
      }

      // Reset edit state & refresh
      cancelEdit();
      refresh();
    } finally {
      setEditLoading(false);
    }
  }

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Category Manager</h2>

      {/* Add Category */}
      <div className="mb-6 p-4 border rounded-lg">
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="mb-3"
        />

        <button
          onClick={addCategory}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Saving..." : "Add Category"}
        </button>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat: Category) => (
          <div key={cat.id} className="border p-3 rounded-lg">
            {/* If this item is being edited, show edit form inline */}
            {editingId === cat.id ? (
              <div>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-2 w-full mb-2 rounded"
                />

                <input
                  type="file"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                  className="mb-2"
                />

                {/* show preview of current or newly selected image */}
                {(editFile && URL.createObjectURL(editFile)) || cat.image ? (
                  <img
                    src={editFile ? URL.createObjectURL(editFile) : cat.image || undefined}
                    alt={editName}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                ) : null}

                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(cat.id, cat.image)}
                    disabled={editLoading}
                    className="bg-blue-600 text-white px-3 py-1 rounded flex-1"
                  >
                    {editLoading ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={cancelEdit}
                    disabled={editLoading}
                    className="bg-gray-200 px-3 py-1 rounded flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}

                <p className="font-semibold">{cat.name}</p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="px-3 py-1 bg-yellow-400 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCategory(cat.id, cat.image)}
                    className="bg-red-500 text-white w-full py-1 rounded"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
