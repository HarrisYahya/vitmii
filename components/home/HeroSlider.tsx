 // components/home/HeroSlider.tsx
"use client";

import React from "react";

// Images stored in public/images/
const manualImages = [
  "/images/hero1.jpg",
  "/images/hero2.jpg",
  "/images/hero3.jpg",
];

export default function HeroSlider() {
  const [images] = React.useState<string[]>(manualImages);
  const [index, setIndex] = React.useState(0);

  // Auto slide (slower now)
  React.useEffect(() => {
    if (!images || images.length === 0) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 6000);
    return () => clearInterval(t);
  }, [images]);

  function next() {
    setIndex((i) => (i + 1) % images.length);
  }

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-[#fef9f5] flex items-center justify-center mt-16">
        <p>No slider images</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 bg-[#fef9f5] overflow-hidden mt-16">
      
      {/* Prev Button */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 px-3 py-1 rounded-full shadow"
      >
        ◀
      </button>

      {/* Image fills the div */}
      <img
        src={images[index]}
        className="w-full h-full object-cover transition-all duration-700"
      />

      {/* Next Button */}
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 px-3 py-1 rounded-full shadow"
      >
        ▶
      </button>

    </div>
  );
}
