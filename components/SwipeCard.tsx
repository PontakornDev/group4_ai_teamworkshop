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

export default function SwipeCard({ imageUrl, dogId, onLike, onDislike, disabled }: SwipeCardProps) {
  const shortId = dogId.slice(0, 8);
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
        transition: transitioning ? "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)" : "none",
        touchAction: "pan-y",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* LIKE badge — shown when dragging right */}
      <div
        className="absolute top-6 left-6 z-10 border-4 border-[#83ba48] rounded-lg px-3 py-1 pointer-events-none"
        style={{ opacity: dragX > 0 ? badgeOpacity : 0, transform: "rotate(-20deg)" }}
      >
        <span className="text-[#83ba48] font-bold text-2xl tracking-widest">LIKE</span>
      </div>

      {/* NOPE badge — shown when dragging left */}
      <div
        className="absolute top-6 right-6 z-10 border-4 border-[#ba1a1a] rounded-lg px-3 py-1 pointer-events-none"
        style={{ opacity: dragX < 0 ? badgeOpacity : 0, transform: "rotate(20deg)" }}
      >
        <span className="text-[#ba1a1a] font-bold text-2xl tracking-widest">NOPE</span>
      </div>

      <Image
        src={imageUrl}
        alt={`Dog ${shortId}`}
        fill
        className="object-cover"
        unoptimized
      />
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 w-full p-5 text-white">
        <h2 className="text-xl font-semibold leading-none drop-shadow-md">#{shortId}</h2>
      </div>
    </div>
  );
}
