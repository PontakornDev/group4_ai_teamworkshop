"use client";

import { useState, useEffect, useCallback } from "react";
import SwipeCard from "@/components/SwipeCard";
import SwipeButtons from "@/components/SwipeButtons";
import DogLoadingAnimation from "@/components/DogLoadingAnimation";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";

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
      const res = await fetch(
        `/api/dog?username=${encodeURIComponent(username)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch dog");
      const data = await res.json();
      setDog(data);
    } catch {
      setDog(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchDog();
  }, [fetchDog]);

  const swipe = async (action: "like" | "dislike") => {
    if (!dog || swiping) return;
    setSwiping(true);
    try {
      await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dogId: dog.dogId,
          imageUrl: dog.imageUrl,
          username,
          email,
          action,
        }),
      });
    } finally {
      setSwiping(false);
      fetchDog();
    }
  };

  const sharedButtonProps = {
    onDislike: () => swipe("dislike"),
    onLike: () => swipe("like"),
    disabled: swiping,
  };

  const loadingUI = <DogLoadingAnimation />;

  const emptyUI = (
    <div className="flex flex-col items-center gap-6 text-center px-5 text-on-surface-variant">
      <span
        className="material-symbols-outlined text-[40px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        pets
      </span>
      <p className="text-xl font-semibold text-on-surface">No more dogs!</p>
      <p className="text-base">You&apos;ve seen them all. Check back later.</p>
      <button
        onClick={fetchDog}
        className="bg-primary text-white rounded-full py-3 px-6 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
      >
        Try again
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile layout — card fills space between fixed top nav and fixed bottom buttons */}
      <div className="md:hidden flex-1 flex flex-col px-4 pt-4 pb-36">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            {loadingUI}
          </div>
        ) : dog ? (
          <div className="flex-1 rounded-3xl overflow-hidden">
            <SwipeCard
              key={dog.dogId}
              imageUrl={dog.imageUrl}
              dogId={dog.dogId}
              onLike={() => swipe("like")}
              onDislike={() => swipe("dislike")}
              disabled={swiping}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {emptyUI}
          </div>
        )}
      </div>

      {/* Mobile fixed buttons — pinned bottom-0, safe-area padding */}
      {!loading && dog && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 flex justify-center items-center gap-8 pt-4 bg-surface/90 backdrop-blur-sm z-40"
          style={{
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 32px)",
          }}
        >
          <button
            onClick={() => swipe("dislike")}
            disabled={swiping}
            className="w-16 h-16 rounded-full bg-surface border-2 border-outline-variant shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center text-error hover:bg-surface-variant active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <CloseIcon sx={{ fontSize: 32 }} />
          </button>
          <button
            onClick={() => swipe("like")}
            disabled={swiping}
            className="w-20 h-20 rounded-full bg-primary shadow-[0_6px_20px_rgba(155,69,0,0.25)] flex items-center justify-center text-white active:scale-90 transition-transform duration-200 disabled:opacity-50"
          >
            <FavoriteIcon sx={{ fontSize: 36 }} />
          </button>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-6 overflow-hidden">
        {loading ? (
          loadingUI
        ) : dog ? (
          <>
            <div className="w-full max-w-[420px] mx-auto aspect-[3/4] max-h-[716px]">
              <SwipeCard key={dog.dogId} imageUrl={dog.imageUrl} dogId={dog.dogId} />
            </div>
            <SwipeButtons {...sharedButtonProps} className="mt-8" />
          </>
        ) : (
          emptyUI
        )}
      </div>
    </div>
  );
}
