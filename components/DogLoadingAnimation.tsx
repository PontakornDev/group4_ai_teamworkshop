"use client";

export default function DogLoadingAnimation() {
  return (
    <div className="flex flex-col items-center gap-4">
      <style>{`
        @keyframes dog-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes dog-leg-a {
          0%, 100% { transform: rotate(-22deg); }
          50% { transform: rotate(22deg); }
        }
        @keyframes dog-leg-b {
          0%, 100% { transform: rotate(22deg); }
          50% { transform: rotate(-22deg); }
        }
        @keyframes dog-tail {
          0%, 100% { transform: rotate(20deg); }
          50% { transform: rotate(-10deg); }
        }
        .anim-dog-body {
          animation: dog-bob 0.6s ease-in-out infinite;
        }
        .anim-leg-a {
          animation: dog-leg-a 0.6s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center top;
        }
        .anim-leg-b {
          animation: dog-leg-b 0.6s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center top;
        }
        .anim-tail {
          animation: dog-tail 0.4s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: right bottom;
        }
      `}</style>

      <svg
        width="140"
        height="92"
        viewBox="0 0 140 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="กำลังโหลด"
      >
        <g className="anim-dog-body">
          {/* Tail */}
          <path
            className="anim-tail"
            d="M 27 54 C 18 46 10 34 7 20"
            stroke="#9b4500"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Back legs — behind body, drawn first */}
          <rect
            className="anim-leg-b"
            x="34" y="67" width="9" height="22" rx="4.5"
            fill="#a84e00"
          />
          <rect
            className="anim-leg-a"
            x="46" y="67" width="9" height="22" rx="4.5"
            fill="#bf6820"
          />

          {/* Body */}
          <rect x="24" y="44" width="84" height="28" rx="14" fill="#c97940" />

          {/* Front legs — in front of body */}
          <rect
            className="anim-leg-a"
            x="80" y="67" width="9" height="22" rx="4.5"
            fill="#a84e00"
          />
          <rect
            className="anim-leg-b"
            x="92" y="67" width="9" height="22" rx="4.5"
            fill="#bf6820"
          />

          {/* Head */}
          <circle cx="96" cy="32" r="22" fill="#c97940" />

          {/* Floppy ear */}
          <ellipse
            cx="93"
            cy="13"
            rx="9"
            ry="13"
            fill="#9b4500"
            transform="rotate(-6, 93, 13)"
          />

          {/* Snout */}
          <ellipse cx="114" cy="38" rx="12" ry="9" fill="#d8a070" />

          {/* Eye */}
          <circle cx="101" cy="27" r="4.5" fill="#2c1810" />
          <circle cx="102.5" cy="25.5" r="1.5" fill="white" opacity="0.85" />

          {/* Nose */}
          <ellipse cx="121" cy="35" rx="4" ry="3" fill="#2c1810" />

          {/* Collar */}
          <rect x="78" y="47" width="22" height="6" rx="3" fill="#ff8c42" />
        </g>
      </svg>

      <p
        className="text-primary font-semibold text-base"
        style={{ fontFamily: "Quicksand, sans-serif" }}
      >
        กำลังหาน้องหมา...
      </p>
    </div>
  );
}
