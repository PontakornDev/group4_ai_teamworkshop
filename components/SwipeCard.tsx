"use client";

import Image from "next/image";

interface SwipeCardProps {
  imageUrl: string;
  dogId: string;
}

export default function SwipeCard({ imageUrl, dogId }: SwipeCardProps) {
  const shortId = dogId.slice(0, 8);

  return (
    <div className="absolute top-0 left-container-padding right-container-padding bottom-[120px] bg-surface-container-lowest rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col border border-surface-container-high transition-transform duration-300">
      {/* Image area */}
      <div className="flex-1 relative w-full overflow-hidden bg-surface-variant">
        <Image
          src={imageUrl}
          alt={`Dog ${shortId}`}
          fill
          className="object-cover"
          unoptimized
        />
        {/* Tag overlay */}
        <div className="absolute top-sm left-sm bg-surface/90 backdrop-blur-md px-sm py-xs rounded-full flex items-center gap-xs shadow-sm">
          <span className="material-symbols-outlined text-primary fill" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">New</span>
        </div>
        {/* Gradient scrim */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Overlay text */}
        <div className="absolute bottom-0 w-full p-md pb-sm text-white">
          <h2 className="font-headline-lg text-headline-lg m-0 leading-none drop-shadow-md">
            #{shortId}
          </h2>
        </div>
      </div>
      {/* Info strip */}
      <div className="bg-surface-container-lowest p-md flex-shrink-0 h-[100px]">
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 m-0 leading-relaxed">
          Tap like or dislike to start matching!
        </p>
      </div>
    </div>
  );
}
