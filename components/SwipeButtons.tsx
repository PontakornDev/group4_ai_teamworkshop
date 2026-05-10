"use client";

interface SwipeButtonsProps {
  onDislike: () => void;
  onSuperLike: () => void;
  onLike: () => void;
  disabled?: boolean;
}

export default function SwipeButtons({ onDislike, onSuperLike, onLike, disabled }: SwipeButtonsProps) {
  return (
    <div className="absolute bottom-[20px] left-0 w-full px-container-padding flex justify-center items-center gap-md z-20">
      {/* Pass / Dislike */}
      <button
        onClick={onDislike}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-surface shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center text-error hover:bg-surface-variant active:scale-95 transition-all duration-200 border-2 border-outline-variant disabled:opacity-50"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 32 }}>close</span>
      </button>

      {/* Super Like → like action */}
      <button
        onClick={onSuperLike}
        disabled={disabled}
        className="w-12 h-12 rounded-full bg-surface shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center text-tertiary-container hover:bg-surface-variant active:scale-95 transition-all duration-200 border border-outline-variant mt-sm disabled:opacity-50"
      >
        <span className="material-symbols-outlined fill" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>star</span>
      </button>

      {/* Like */}
      <button
        onClick={onLike}
        disabled={disabled}
        className="w-[72px] h-[72px] rounded-full bg-primary shadow-[0_6px_20px_rgba(155,69,0,0.25)] flex items-center justify-center text-on-primary active:scale-90 transition-transform duration-200 disabled:opacity-50"
      >
        <span className="material-symbols-outlined fill" style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}>favorite</span>
      </button>
    </div>
  );
}
