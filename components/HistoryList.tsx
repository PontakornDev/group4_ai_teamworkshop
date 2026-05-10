"use client";

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
    <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm">
      <span className="material-symbols-outlined fill" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>favorite</span>
      Like
    </span>
  ) : (
    <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
      Dislike
    </span>
  );
}

export default function HistoryList({ records, currentUser }: HistoryListProps) {
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
      {/* Mobile list */}
      <div className="md:hidden flex flex-col gap-sm">
        {records.map((dog) => {
          const myEntry = dog.col.find((e) => e.username === currentUser) ?? dog.col[0];
          return (
            <div key={dog.dogId} className="bg-surface-container-lowest rounded-xl p-sm shadow-sm flex items-center gap-md hover:shadow-md transition-shadow">
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
                <h3 className="font-headline-md text-headline-md text-on-surface truncate">#{dog.dogId.slice(0, 8)}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{dog.col.length} swipe{dog.col.length !== 1 ? "s" : ""}</p>
              </div>
              {myEntry && <ActionBadge action={myEntry.action} />}
            </div>
          );
        })}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {records.map((dog) => {
          const myEntry = dog.col.find((e) => e.username === currentUser) ?? dog.col[0];
          return (
            <div key={dog.dogId} className="bg-surface-container-lowest rounded-[24px] p-md flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-surface-variant">
              <div className="relative w-32 h-32 mb-sm rounded-full overflow-hidden border-4 border-surface shadow-sm flex-shrink-0">
                <Image
                  src={dog.imageUrl}
                  alt={`Dog ${dog.dogId.slice(0, 8)}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">#{dog.dogId.slice(0, 8)}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">{dog.col.length} swipe{dog.col.length !== 1 ? "s" : ""}</p>
              {myEntry && (
                <div className="mt-auto">
                  <ActionBadge action={myEntry.action} />
                  {myEntry.timestamp && (
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
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
