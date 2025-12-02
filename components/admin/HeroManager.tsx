"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/context/AdminContext";

function arrayMove<T>(arr: T[], fromIndex: number, toIndex: number) {
  const newArr = arr.slice();
  const val = newArr.splice(fromIndex, 1)[0];
  newArr.splice(toIndex, 0, val);
  return newArr;
}

export default function HeroManager() {
  const { heroImages, refresh } = useAdmin();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ======================================================
  // SELECT FILE + SHOW PREVIEW
  // ======================================================
  function selectFile(f: File | null) {
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  // ======================================================
  // UPLOAD FILE TO STORAGE + SAVE TO DB
  // ======================================================
  async function upload() {
    if (!file) return;

    setLoading(true);

    try {
      const filename = `${Date.now()}-${file.name}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("hero")
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("hero").getPublicUrl(filename);

      // Insert into DB
      const { data: insertData, error: insertError } = await supabase
        .from("hero_images")
        .insert([{ image: publicUrl }])
        .select("*");

      if (insertError) throw insertError;

      // Reset UI
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await refresh();
      alert("Hero image uploaded!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // DELETE IMAGE
  // ======================================================
  async function removeImage(id: string, imageUrl: string) {
    if (!confirm("Delete this hero image?")) return;

    setLoading(true);

    try {
      const { error: delError } = await supabase
        .from("hero_images")
        .delete()
        .eq("id", id);

      if (delError) throw delError;

      // Delete file from storage
      try {
        const bucket = "hero";
        const objectName = imageUrl.split(`${bucket}/`)[1];

        if (objectName) {
          await supabase.storage.from(bucket).remove([objectName]);
        }
      } catch (e) {
        console.warn("Could not delete storage file", e);
      }

      await refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // REORDER IMAGES
  // ======================================================
  async function move(index: number, direction: "up" | "down") {
    const current = heroImages;
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= current.length) return;

    const newOrder = arrayMove(current, index, targetIndex);

    try {
      for (let i = 0; i < newOrder.length; i++) {
        await supabase
          .from("hero_images")
          .update({ position: i })
          .eq("id", newOrder[i].id);
      }
      await refresh();
    } catch (e) {
      console.warn("Could not reorder", e);
      await refresh();
    }
  }

  // Drag-and-drop handlers
  function onDragStart(e: React.DragEvent, idx: number) {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  async function onDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;

    await move(dragIndex, dragIndex < idx ? "down" : "up");
    setDragIndex(null);
  }

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="p-4 border rounded space-y-4">
      <h2 className="text-xl font-semibold">Hero Slider Manager</h2>

      {/* FILE INPUT */}
      <div className="flex gap-2 items-center">
        <input
          key="hero-upload"   // prevents React resetting file input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => selectFile(e.target.files?.[0] || null)}
        />

        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={upload}
          disabled={loading || !file}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* PREVIEW */}
      {previewUrl && (
        <div>
          <p className="text-sm font-medium">Preview</p>
          <img
            src={previewUrl}
            alt="preview"
            className="max-h-40 object-contain"
          />
        </div>
      )}

      {/* EXISTING IMAGES */}
      <div className="mt-4">
        <p className="font-medium mb-2">Existing Hero Images</p>

        <ul className="space-y-3">
          {heroImages.map((h, idx) => (
            <li
              key={h.id}
              className="flex items-center gap-3 border rounded p-2"
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, idx)}
            >
              <img
                src={h.image}
                className="w-32 h-20 object-cover rounded"
                alt={`hero-${idx}`}
              />

              <div className="flex-1">
                <p className="font-medium">#{idx + 1}</p>

                <div className="flex gap-2 mt-2">
                  <button
                    className="px-2 py-1 bg-gray-200 rounded"
                    onClick={() => move(idx, "up")}
                    disabled={idx === 0}
                  >
                    ↑
                  </button>

                  <button
                    className="px-2 py-1 bg-gray-200 rounded"
                    onClick={() => move(idx, "down")}
                    disabled={idx === heroImages.length - 1}
                  >
                    ↓
                  </button>

                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => removeImage(h.id, h.image)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
