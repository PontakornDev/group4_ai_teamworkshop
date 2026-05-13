"use client";

import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

interface DogSummary {
  dogId: string;
  imageUrl: string;
  likeCount: number;
  dislikeCount: number;
}

interface DogImageModalProps {
  isOpen: boolean;
  dog: DogSummary | null;
  onClose: () => void;
}

export default function DogImageModal({
  isOpen,
  dog,
  onClose,
}: DogImageModalProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
  }, [dog?.imageUrl]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!dog) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ease-out ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`relative flex flex-col items-center transition-transform duration-200 ease-out ${
            isOpen ? "scale-100" : "scale-90"
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-surface active:scale-95 transition-all"
            aria-label="Close"
          >
            <CloseIcon sx={{ fontSize: 32 }} />
          </button>

          {/* Image */}
          <div className="relative max-w-[90vw] max-h-[80vh] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.32)]">
            {!imgLoaded && (
              <div
                className="absolute inset-0 bg-surface-container-low animate-pulse"
                style={{ minWidth: 200, minHeight: 200 }}
              />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dog.imageUrl}
              alt={`Dog ${dog.dogId.slice(0, 8)}`}
              className={`block max-w-[90vw] max-h-[80vh] object-contain transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              style={{ minWidth: 200, minHeight: 200 }}
              onLoad={() => setImgLoaded(true)}
            />
          </div>

          {/* Info strip */}
          <div
            className="mt-3 flex items-center gap-md px-md py-sm rounded-full bg-surface/90 backdrop-blur-md shadow-sm"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            <span
              className="font-bold text-label-lg"
              style={{ color: "#9b4500" }}
            >
              #{dog.dogId.slice(0, 8)}
            </span>
            <span
              className="inline-flex items-center gap-xs font-bold text-label-lg"
              style={{ color: "#83ba48" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              {dog.likeCount}
            </span>
            <span
              className="inline-flex items-center gap-xs font-bold text-label-lg"
              style={{ color: "#ba1a1a" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                close
              </span>
              {dog.dislikeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
