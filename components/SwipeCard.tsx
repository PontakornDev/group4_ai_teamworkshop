"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const THRESHOLD = 80;
const FLY_DISTANCE = 600;
const ROTATION_FACTOR = 0.08;

interface SwipeCardProps {
  imageUrl: string;
  dogId: string;
  onLike?: () => void;
  onDislike?: () => void;
  disabled?: boolean;
}

export default function SwipeCard({
  imageUrl,
  dogId,
  onLike,
  onDislike,
  disabled,
}: SwipeCardProps) {
  const shortId = dogId.slice(0, 8);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startXRef.current = e.touches[0].clientX;
    draggingRef.current = true;
    setTransitioning(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current || disabled) return;
    setDragX(e.touches[0].clientX - startXRef.current);
  };

  const handleTouchEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setTransitioning(true);

    if (Math.abs(dragX) >= THRESHOLD) {
      const dir = dragX > 0 ? 1 : -1;
      setDragX(dir * FLY_DISTANCE);
      setTimeout(() => {
        dir > 0 ? onLike?.() : onDislike?.();
        setDragX(0);
        setTransitioning(false);
      }, 350);
    } else {
      setDragX(0);
    }
  };

  const badgeOpacity = Math.min(1, Math.abs(dragX) / THRESHOLD);

  return (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] bg-surface-variant"
      style={{
        transform: `translateX(${dragX}px) rotate(${dragX * ROTATION_FACTOR}deg)`,
        transition: transitioning
          ? "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)"
          : "none",
        touchAction: "pan-y",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* LIKE badge — shown when dragging right */}
      <div
        className="absolute top-6 left-6 z-10 border-4 border-[#83ba48] rounded-lg px-3 py-1 pointer-events-none"
        style={{
          opacity: dragX > 0 ? badgeOpacity : 0,
          transform: "rotate(-20deg)",
        }}
      >
        <span className="text-[#83ba48] font-bold text-2xl tracking-widest">
          LIKE
        </span>
      </div>

      {/* NOPE badge — shown when dragging left */}
      <div
        className="absolute top-6 right-6 z-10 border-4 border-[#ba1a1a] rounded-lg px-3 py-1 pointer-events-none"
        style={{
          opacity: dragX < 0 ? badgeOpacity : 0,
          transform: "rotate(20deg)",
        }}
      >
        <span className="text-[#ba1a1a] font-bold text-2xl tracking-widest">
          NOPE
        </span>
      </div>

      {!imgLoaded && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-4">
          {/* Shimmer sweep */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #f6f3f2 25%, #ede4de 50%, #f6f3f2 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.6s ease-in-out infinite",
            }}
          />
          {/* Paw icon bounce */}
          <span
            className="material-symbols-outlined fill relative z-10"
            style={{
              fontSize: 64,
              color: "#9b4500",
              animation: "paw-bounce 1.2s ease-in-out infinite",
            }}
          >
            puppy
          </span>
          <span
            className="relative z-10 text-sm font-semibold"
            style={{
              color: "#9b4500",
              opacity: 0.6,
              fontFamily: "Quicksand, sans-serif",
            }}
          >
            Loading...
          </span>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={`Dog ${shortId}`}
        fill
        className={`object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        unoptimized
        onLoad={() => setImgLoaded(true)}
      />
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 w-full p-5 text-white">
        <h2 className="text-xl font-semibold leading-none drop-shadow-md">
          #{shortId}
        </h2>
      </div>
    </div>
  );
}
