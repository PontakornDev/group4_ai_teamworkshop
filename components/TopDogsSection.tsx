"use client";

import { useState } from "react";
import Image from "next/image";
import DogImageModal from "./DogImageModal";
import type { TopDogsResult } from "@/lib/storage";

interface TopDogsSectionProps {
  topDogs: TopDogsResult | null;
}

interface DogSummary {
  dogId: string;
  imageUrl: string;
  likeCount: number;
  dislikeCount: number;
}

export default function TopDogsSection({ topDogs }: TopDogsSectionProps) {
  const [selectedDog, setSelectedDog] = useState<DogSummary | null>(null);

  const cards: Array<
    | {
        type: "liked";
        dogId: string;
        imageUrl: string;
        count: number;
        likeCount: number;
        dislikeCount: number;
      }
    | {
        type: "disliked";
        dogId: string;
        imageUrl: string;
        count: number;
        likeCount: number;
        dislikeCount: number;
      }
  > = [];

  if (topDogs?.mostLiked) {
    cards.push({
      type: "liked",
      dogId: topDogs.mostLiked.dogId,
      imageUrl: topDogs.mostLiked.imageUrl,
      count: topDogs.mostLiked.likeCount,
      likeCount: topDogs.mostLiked.likeCount,
      dislikeCount: topDogs.mostLiked.dislikeCount ?? 0,
    });
  }

  if (topDogs?.mostDisliked) {
    cards.push({
      type: "disliked",
      dogId: topDogs.mostDisliked.dogId,
      imageUrl: topDogs.mostDisliked.imageUrl,
      count: topDogs.mostDisliked.dislikeCount,
      likeCount: topDogs.mostDisliked.likeCount ?? 0,
      dislikeCount: topDogs.mostDisliked.dislikeCount,
    });
  }

  return (
    <div className="mb-lg">
      <h3 className="text-headline-md font-bold text-on-surface mb-md">
        Top Dogs
      </h3>

      {cards.length === 0 ? (
        <div className="flex flex-col gap-xs">
          <p className="text-headline-md text-on-surface">No top dogs yet</p>
          <p className="text-body-md text-on-surface-variant">
            No swipes yet — start swiping to see top dogs!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-md">
          {cards.map((card) => {
            const isLiked = card.type === "liked";
            const label = isLiked ? "Most Liked" : "Most Disliked";
            const labelColor = isLiked ? "text-green-400" : "text-error";
            const unit = isLiked ? " likes" : " dislikes";

            return (
              <div
                key={card.dogId + "-" + card.type}
                className="bg-surface-container-lowest rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col cursor-pointer"
                onClick={() =>
                  setSelectedDog({
                    dogId: card.dogId,
                    imageUrl: card.imageUrl,
                    likeCount: card.likeCount,
                    dislikeCount: card.dislikeCount,
                  })
                }
              >
                <div className="relative w-full h-[140px]">
                  <Image
                    src={card.imageUrl}
                    alt={label}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="p-sm flex flex-col gap-xs">
                  <span className={`text-label-lg font-semibold ${labelColor}`}>
                    {label}
                  </span>
                  <span className="text-label-lg text-on-surface-variant">
                    #{card.dogId.slice(0, 8)}
                  </span>
                  <span>
                    <span
                      className={`text-headline-md font-bold ${labelColor}`}
                    >
                      {card.count}
                    </span>
                    <span className="text-body-md text-on-surface-variant">
                      {unit}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DogImageModal
        isOpen={Boolean(selectedDog)}
        dog={selectedDog}
        onClose={() => setSelectedDog(null)}
      />
    </div>
  );
}
