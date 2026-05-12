"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

interface ColEntry {
  username: string;
  email: string;
  action: "like" | "dislike";
  timestamp: string;
}

interface DogRecord {
  dogId: string;
  imageUrl: string;
  col: ColEntry[];
}

interface HistoryListProps {
  records: DogRecord[];
  currentUser?: string;
}

function ActionBadge({ action }: { action: "like" | "dislike" }) {
  return action === "like" ? (
    <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-tertiary-container text-on-tertiary-container font-bold text-label-lg">
      <span className="material-symbols-outlined fill" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>favorite</span>
      Like
    </span>
  ) : (
    <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-error-container text-on-error-container font-bold text-label-lg">
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
      Dislike
    </span>
  );
}

export default function HistoryList({ records, currentUser }: HistoryListProps) {
  const [filter, setFilter] = useState<"all" | "like" | "dislike">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // Guard: currentUser undefined means we cannot match swipes to a user — show empty state
  // (Placed after hooks to satisfy Rules of Hooks; useMemos below still run but produce [])
  const mine = useMemo(
    () =>
      currentUser
        ? records.filter((r) => r.col.some((e) => e.username === currentUser))
        : [],
    [records, currentUser]
  );

  // Apply action filter — runs after user-scope filter (D-07, D-09)
  const filtered = useMemo(() => {
    if (filter === "all") return mine;
    return mine.filter(
      (r) => r.col.find((e) => e.username === currentUser)?.action === filter
    );
  }, [mine, filter, currentUser]);

  // Sort by current user's swipe timestamp (D-08) — applied after filter
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const tsA = a.col.find((e) => e.username === currentUser)?.timestamp ?? "";
      const tsB = b.col.find((e) => e.username === currentUser)?.timestamp ?? "";
      return sort === "newest"
        ? tsB.localeCompare(tsA)
        : tsA.localeCompare(tsB);
    });
  }, [filtered, sort, currentUser]);

  // Summary stats — computed from mine (pre-filter totals) not filtered (D-05, D-06 per plan deviation note)
  const stats = useMemo(() => {
    const likes = mine.filter(
      (r) => r.col.find((e) => e.username === currentUser)?.action === "like"
    ).length;
    const dislikes = mine.filter(
      (r) => r.col.find((e) => e.username === currentUser)?.action === "dislike"
    ).length;
    return { total: mine.length, likes, dislikes };
  }, [mine, currentUser]);

  if (mine.length === 0) {
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
      {/* SummaryBar — sticky below mobile top bar, non-sticky on desktop (D-04, D-05) */}
      <div className="sticky top-16 md:top-0 z-30 bg-surface py-sm flex flex-wrap gap-sm mb-sm">
        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-low border border-outline-variant text-on-surface font-bold text-label-lg">
          {stats.total} Swiped
        </span>
        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-low border border-outline-variant text-on-surface font-bold text-label-lg">
          ❤ {stats.likes} Likes
        </span>
        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-low border border-outline-variant text-on-surface font-bold text-label-lg">
          ✕ {stats.dislikes} Dislikes
        </span>
      </div>

      {/* FilterPills + SortDropdown row (D-07, D-08, D-09) */}
      <div className="flex flex-wrap items-center gap-sm mb-md">
        <div className="flex gap-xs overflow-x-auto">
          {(["all", "like", "dislike"] as const).map((f) => {
            const label = f === "all" ? "All" : f === "like" ? "Likes" : "Dislikes";
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  active
                    ? "bg-primary-container text-on-primary-container font-bold text-label-lg px-6 py-2 rounded-full shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant font-bold text-label-lg px-6 py-2 rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors"
                }
              >
                {label}
              </button>
            );
          })}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
          className="ml-auto bg-surface-container-low border border-outline-variant rounded-full px-sm py-xs font-normal text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Filtered empty state (D-07) */}
      {sorted.length === 0 && (
        <div className="flex flex-col items-center py-xl text-on-surface-variant">
          <span
            className="material-symbols-outlined mb-md"
            style={{ fontSize: 48, fontVariationSettings: "'FILL' 0" }}
          >
            filter_list
          </span>
          <p className="font-headline-md text-headline-md">
            No {filter === "like" ? "Likes" : "Dislikes"} found
          </p>
          <p className="font-body-md text-body-md mt-xs">
            Try switching to All to see your full swipe history.
          </p>
        </div>
      )}

      {/* Mobile list */}
      <div className="md:hidden flex flex-col gap-sm">
        {sorted.map((dog) => {
          const myEntry = dog.col.find((e) => e.username === currentUser) ?? dog.col[0];
          return (
            <div
              key={dog.dogId}
              className="bg-surface-container-lowest rounded-xl p-sm shadow-sm flex items-center gap-md hover:shadow-md transition-shadow"
            >
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={dog.imageUrl}
                  alt={`Dog ${dog.dogId.slice(0, 8)}`}
                  fill
                  className="object-cover rounded-full border-2 border-primary-fixed-dim"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline-md text-headline-md text-on-surface truncate">
                  #{dog.dogId.slice(0, 8)}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {dog.col.length} swipe{dog.col.length !== 1 ? "s" : ""}
                </p>
              </div>
              {myEntry && <ActionBadge action={myEntry.action} />}
            </div>
          );
        })}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {sorted.map((dog) => {
          const myEntry = dog.col.find((e) => e.username === currentUser) ?? dog.col[0];
          return (
            <div
              key={dog.dogId}
              className="bg-surface-container-lowest rounded-[24px] p-md flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border border-surface-variant"
            >
              <div className="relative w-32 h-32 mb-sm rounded-full overflow-hidden border-4 border-surface flex-shrink-0">
                <Image
                  src={dog.imageUrl}
                  alt={`Dog ${dog.dogId.slice(0, 8)}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
                #{dog.dogId.slice(0, 8)}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                {dog.col.length} swipe{dog.col.length !== 1 ? "s" : ""}
              </p>
              {myEntry && (
                <div className="mt-auto">
                  <ActionBadge action={myEntry.action} />
                  {myEntry.timestamp && (
                    <p className="font-bold text-label-lg text-on-surface-variant mt-xs">
                      {new Date(myEntry.timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
