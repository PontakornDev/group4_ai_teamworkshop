"use client";

import Image from "next/image";

interface SwipeCardProps {
  imageUrl: string;
  dogId: string;
}

export default function SwipeCard({ imageUrl, dogId }: SwipeCardProps) {
  const shortId = dogId.slice(0, 8);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] bg-surface-variant">
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
