"use client";

import { useState, useEffect, useCallback } from "react";
import SwipeCard from "@/components/SwipeCard";
import SwipeButtons from "@/components/SwipeButtons";

interface DogData {
  dogId: string;
  imageUrl: string;
}

interface SwipeClientProps {
  username: string;
  email: string;
}

export default function SwipeClient({ username, email }: SwipeClientProps) {
  const [dog, setDog] = useState<DogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  const fetchDog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dog?username=${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error("Failed to fetch dog");
      const data = await res.json();
      setDog(data);
    } catch {
      setDog(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { fetchDog(); }, [fetchDog]);

  const swipe = async (action: "like" | "dislike") => {
    if (!dog || swiping) return;
    setSwiping(true);
    try {
      await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dogId: dog.dogId, imageUrl: dog.imageUrl, username, email, action }),
      });
    } finally {
      setSwiping(false);
      fetchDog();
    }
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto relative px-container-padding pb-[90px] flex flex-col justify-end z-0">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-md text-on-surface-variant">
            <span className="material-symbols-outlined text-display animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>autorenew</span>
            <p className="font-body-md text-body-md">Fetching your next match...</p>
          </div>
        </div>
      ) : dog ? (
        <>
          <SwipeCard imageUrl={dog.imageUrl} dogId={dog.dogId} />
          <SwipeButtons
            onDislike={() => swipe("dislike")}
            onSuperLike={() => swipe("like")}
            onLike={() => swipe("like")}
            disabled={swiping}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-md text-center px-container-padding text-on-surface-variant">
            <span className="material-symbols-outlined text-display" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
            <p className="font-headline-md text-headline-md text-on-surface">No more dogs!</p>
            <p className="font-body-md text-body-md">You&apos;ve seen them all. Check back later.</p>
            <button
              onClick={fetchDog}
              className="bg-primary text-on-primary rounded-full py-sm px-md font-label-lg text-label-lg hover:bg-surface-tint transition-colors active:scale-95 shadow-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
