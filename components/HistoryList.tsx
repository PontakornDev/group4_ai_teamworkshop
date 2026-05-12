"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import DogImageModal from "./DogImageModal";

interface DogSummary {
  dogId: string;
  imageUrl: string;
  likeCount: number;
  dislikeCount: number;
  latestTimestamp: string;
}

interface HistoryListProps {
  records: DogSummary[];
}

export default function HistoryList({ records }: HistoryListProps) {
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selectedDog, setSelectedDog] = useState<DogSummary | null>(null);

  const sorted = useMemo(() => {
    return [...records].sort((a, b) =>
      sort === "newest"
        ? b.latestTimestamp.localeCompare(a.latestTimestamp)
        : a.latestTimestamp.localeCompare(b.latestTimestamp)
    );
  }, [records, sort]);

  const stats = useMemo(() => ({
    total: records.length,
    likes: records.reduce((s, r) => s + r.likeCount, 0),
    dislikes: records.reduce((s, r) => s + r.dislikeCount, 0),
  }), [records]);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
        <span className="material-symbols-outlined text-display mb-md" style={{ fontVariationSettings: "'FILL' 0" }}>pets</span>
        <p className="font-headline-md text-headline-md">No swipes yet</p>
        <p className="font-body-md text-body-md mt-xs">Start swiping to see your history here.</p>
      </div>
    );
  }

  return (
    <>
      {/* Summary bar */}
      <div className="sticky top-16 md:top-0 z-30 bg-surface py-sm flex flex-wrap gap-sm mb-sm">
        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-low border border-outline-variant text-on-surface font-bold text-label-lg">
          {stats.total} Dogs
        </span>
        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-low border border-outline-variant text-on-surface font-bold text-label-lg">
          <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1", color: "#83ba48" }}>favorite</span>
          {stats.likes} Likes
        </span>
        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-low border border-outline-variant text-on-surface font-bold text-label-lg">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#ba1a1a" }}>close</span>
          {stats.dislikes} Dislikes
        </span>
      </div>

      {/* Sort row */}
      <div className="flex justify-end mb-md">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
          className="bg-surface-container-low border border-outline-variant rounded-full px-sm py-xs font-normal text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Mobile list */}
      <div className="md:hidden flex flex-col gap-sm">
        {sorted.map((dog) => (
          <div
            key={dog.dogId}
            className="bg-surface-container-lowest rounded-xl p-sm shadow-sm flex items-center gap-md hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => setSelectedDog(dog)}
              className="relative w-16 h-16 flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 transition-transform"
              aria-label={`View dog ${dog.dogId.slice(0, 8)}`}
            >
              <Image
                src={dog.imageUrl}
                alt={`Dog ${dog.dogId.slice(0, 8)}`}
                fill
                className="object-cover rounded-full border-2 border-primary-fixed-dim"
                unoptimized
              />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline-md text-headline-md text-on-surface truncate">
                #{dog.dogId.slice(0, 8)}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {new Date(dog.latestTimestamp).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-xs">
              <span className="inline-flex items-center gap-xs text-label-lg font-bold" style={{ color: "#83ba48" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>favorite</span>
                {dog.likeCount}
              </span>
              <span className="inline-flex items-center gap-xs text-label-lg font-bold" style={{ color: "#ba1a1a" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                {dog.dislikeCount}
              </span>
            </div>
          </div>
        ))}
      </div>

      <DogImageModal
        isOpen={selectedDog !== null}
        dog={selectedDog}
        onClose={() => setSelectedDog(null)}
      />

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {sorted.map((dog) => (
          <div
            key={dog.dogId}
            className="bg-surface-container-lowest rounded-[24px] p-md flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border border-surface-variant"
          >
            <button
              onClick={() => setSelectedDog(dog)}
              className="relative w-32 h-32 mb-sm rounded-full overflow-hidden border-4 border-surface flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 transition-transform cursor-pointer"
              aria-label={`View dog ${dog.dogId.slice(0, 8)}`}
            >
              <Image
                src={dog.imageUrl}
                alt={`Dog ${dog.dogId.slice(0, 8)}`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
              #{dog.dogId.slice(0, 8)}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
              {new Date(dog.latestTimestamp).toLocaleDateString()}
            </p>
            <div className="mt-auto flex gap-sm">
              <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full font-bold text-label-lg bg-surface-container-low border border-outline-variant" style={{ color: "#83ba48" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>favorite</span>
                {dog.likeCount}
              </span>
              <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full font-bold text-label-lg bg-surface-container-low border border-outline-variant" style={{ color: "#ba1a1a" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                {dog.dislikeCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
