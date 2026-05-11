"use client";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";

interface SwipeButtonsProps {
  onDislike: () => void;
  onLike: () => void;
  disabled?: boolean;
  className?: string;
}

export default function SwipeButtons({
  onDislike,
  onLike,
  disabled,
  className = "",
}: SwipeButtonsProps) {
  return (
    <div className={`flex justify-center items-center gap-8 ${className}`}>
      <button
        onClick={onDislike}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-surface border-2 border-outline-variant shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center text-error hover:bg-surface-variant active:scale-95 transition-all duration-200 disabled:opacity-50"
      >
        <CloseIcon sx={{ fontSize: 32 }} />
      </button>
      <button
        onClick={onLike}
        disabled={disabled}
        className="w-20 h-20 rounded-full bg-primary shadow-[0_6px_20px_rgba(155,69,0,0.25)] flex items-center justify-center text-white active:scale-90 transition-transform duration-200 disabled:opacity-50"
      >
        <FavoriteIcon sx={{ fontSize: 36 }} />
      </button>
    </div>
  );
}
