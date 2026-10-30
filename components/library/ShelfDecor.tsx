import { PaintingArt, type ArtKind } from "./ShelfPhotos";

type FrameSize = "large" | "medium" | "small";
type FrameTilt = "left" | "right";
type FrameStyle = "walnut" | "brass" | "oak" | "black";

type FrameSpec = {
  size: FrameSize;
  art: ArtKind;
  tilt: FrameTilt;
  frame: FrameStyle;
};

const ART_SHELVES: Record<1 | 2, readonly FrameSpec[]> = {
  1: [
    { size: "large", art: "family", tilt: "left", frame: "walnut" },
    { size: "small", art: "couple", tilt: "right", frame: "brass" },
  ],
  2: [
    { size: "medium", art: "beach", tilt: "left", frame: "oak" },
    { size: "small", art: "child", tilt: "right", frame: "black" },
  ],
};

/** Two framed family photographs resting on a cabinet shelf. */
export function ArtShelf({ variant }: { variant: 1 | 2 }) {
  return (
    <div aria-hidden="true" className="dummy-shelf art-shelf">
      {ART_SHELVES[variant].map((frame) => (
        <span
          key={frame.art}
          className={`shelf-frame shelf-frame--${frame.size} shelf-frame--${frame.tilt} shelf-frame--${frame.frame}`}
        >
          <span className="shelf-art">
            <PaintingArt kind={frame.art} />
          </span>
        </span>
      ))}
    </div>
  );
}

/** Three potted plants on the right-hand cabinet. */
export function PlantShelf() {
  return (
    <div aria-hidden="true" className="dummy-shelf plant-shelf">
      <span className="shelf-plant shelf-plant--tall">
        <RubberPlant />
      </span>
      <span className="shelf-plant shelf-plant--small">
        <SucculentPlant />
      </span>
      <span className="shelf-plant shelf-plant--medium">
        <SnakePlant />
      </span>
    </div>
  );
}

function RubberPlant() {
  return (
    <svg viewBox="0 0 80 120" preserveAspectRatio="xMidYMid meet" role="presentation">
      <defs>
        <linearGradient id="plant-rubber-pot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c47b53" />
          <stop offset="0.55" stopColor="#a95f40" />
          <stop offset="1" stopColor="#7d3f2b" />
        </linearGradient>
        <linearGradient id="plant-rubber-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7f9a63" />
          <stop offset="0.55" stopColor="#5e7c4c" />
          <stop offset="1" stopColor="#3f5b39" />
        </linearGradient>
      </defs>

      <ellipse cx="40" cy="116" rx="23" ry="3.6" fill="#17110b" opacity="0.3" />
      <path
        d="M22 92 L58 92 L54 113 C48 117 32 117 26 113 Z"
        fill="url(#plant-rubber-pot)"
        stroke="#6d3823"
        strokeWidth="0.8"
      />
      <rect x="19" y="87" width="42" height="7" rx="2" fill="#c57b52" stroke="#6d3823" strokeWidth="0.8" />
      <ellipse cx="40" cy="90" rx="17" ry="3" fill="#2f241a" />

      <g stroke="#3f5a38" strokeWidth="1.2" fill="none">
        <path d="M40 90 C40 78 38 68 34 60" />
        <path d="M42 90 C46 78 50 70 56 62" />
        <path d="M40 90 C38 76 42 64 48 54" />
        <path d="M40 90 C36 76 30 66 24 58" />
      </g>

      <g fill="url(#plant-rubber-leaf)" stroke="#3c5335" strokeWidth="0.65">
        <path d="M34 62 C22 60 14 50 16 38 C28 41 35 50 34 62Z" />
        <path d="M56 64 C66 58 70 46 66 34 C56 39 52 51 56 64Z" />
        <path d="M48 56 C52 44 48 32 40 24 C34 34 38 46 48 56Z" />
        <path d="M24 60 C16 54 12 44 14 34 C23 39 27 49 24 60Z" />
        <path d="M44 74 C56 72 66 64 70 54 C58 54 48 62 44 74Z" />
      </g>

      <g stroke="#aec28e" strokeWidth="0.5" opacity="0.7" fill="none">
        <path d="M32 60 C26 54 20 46 18 40" />
        <path d="M54 62 C58 54 62 45 64 38" />
        <path d="M46 54 C45 45 42 36 40 29" />
        <path d="M26 58 C21 52 16 45 15 38" />
        <path d="M46 72 C54 68 60 62 65 56" />
      </g>
      <g fill="#9cb47c" opacity="0.55">
        <ellipse cx="28" cy="47" rx="2.2" ry="4.5" transform="rotate(30 28 47)" />
        <ellipse cx="59" cy="44" rx="2" ry="4.4" transform="rotate(-25 59 44)" />
        <ellipse cx="43" cy="34" rx="1.8" ry="4" transform="rotate(8 43 34)" />
      </g>
    </svg>
  );
}

function SnakePlant() {
  return (
    <svg viewBox="0 0 70 120" preserveAspectRatio="xMidYMid meet" role="presentation">
      <defs>
        <linearGradient id="plant-snake-pot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8c6a2" />
          <stop offset="0.55" stopColor="#bda57d" />
          <stop offset="1" stopColor="#977b54" />
        </linearGradient>
        <linearGradient id="plant-snake-leaf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4c6b40" />
          <stop offset="0.45" stopColor="#769455" />
          <stop offset="0.72" stopColor="#5d7d49" />
          <stop offset="1" stopColor="#3c5736" />
        </linearGradient>
      </defs>

      <ellipse cx="35" cy="116" rx="20" ry="3.4" fill="#17110b" opacity="0.3" />
      <path
        d="M18 94 L52 94 L49 113 C43 116 27 116 21 113 Z"
        fill="url(#plant-snake-pot)"
        stroke="#7d6543"
        strokeWidth="0.8"
      />
      <rect x="16" y="90" width="38" height="6" rx="2" fill="#d4c09a" stroke="#7d6543" strokeWidth="0.8" />
      <ellipse cx="35" cy="92" rx="15" ry="2.7" fill="#2d251a" />

      <g fill="url(#plant-snake-leaf)" stroke="#364d32" strokeWidth="0.55">
        <path d="M35 92 C31 76 26 54 21 28 C27 44 35 66 38 92Z" />
        <path d="M35 92 C35 72 35 46 34 20 C40 45 42 70 40 92Z" />
        <path d="M37 92 C41 72 47 50 52 30 C50 51 46 73 42 92Z" />
        <path d="M33 92 C27 78 21 64 13 51 C21 63 29 77 37 92Z" />
        <path d="M39 92 C47 80 53 66 58 55 C54 70 47 84 42 92Z" />
      </g>

      <g stroke="#b7c98e" strokeWidth="0.5" opacity="0.42">
        <path d="M25 58 q7 -1 12 2" />
        <path d="M27 70 q6 -1 10 2" />
        <path d="M29 81 q5 -1 8 2" />
        <path d="M34 42 q5 -1 8 2" />
        <path d="M35 55 q5 -1 8 2" />
        <path d="M36 68 q5 -1 8 2" />
        <path d="M40 48 q5 -1 8 2" />
        <path d="M43 62 q4 -1 7 2" />
        <path d="M23 67 q5 -1 9 2" />
        <path d="M19 79 q4 -1 7 2" />
        <path d="M46 74 q4 -1 6 2" />
      </g>
      <g stroke="#a9bd82" strokeWidth="0.5" opacity="0.55" fill="none">
        <path d="M34 90 C32 72 30 50 28 36" />
        <path d="M37 90 C37 68 37 44 36 28" />
        <path d="M39 90 C43 70 47 52 50 40" />
      </g>
    </svg>
  );
}

function SucculentPlant() {
  const outer = [0, 45, 90, 135, 180, 225, 270, 315];
  const inner = [22, 82, 142, 202, 262, 322];

  return (
    <svg viewBox="0 0 80 90" preserveAspectRatio="xMidYMid meet" role="presentation">
      <defs>
        <linearGradient id="plant-succulent-pot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c7815a" />
          <stop offset="0.6" stopColor="#a85f41" />
          <stop offset="1" stopColor="#7c3f2c" />
        </linearGradient>
        <linearGradient id="plant-succulent-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a7bd88" />
          <stop offset="0.55" stopColor="#7d9c68" />
          <stop offset="1" stopColor="#55764f" />
        </linearGradient>
        <linearGradient id="plant-succulent-inner" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c1d3a2" />
          <stop offset="1" stopColor="#7e9e69" />
        </linearGradient>
      </defs>

      <ellipse cx="40" cy="86" rx="22" ry="3.2" fill="#17110b" opacity="0.28" />
      <path
        d="M21 65 L59 65 L55 83 C48 86 32 86 25 83 Z"
        fill="url(#plant-succulent-pot)"
        stroke="#6d3823"
        strokeWidth="0.8"
      />
      <rect x="18" y="61" width="44" height="6" rx="2" fill="#ca8159" stroke="#6d3823" strokeWidth="0.8" />
      <ellipse cx="40" cy="63" rx="18" ry="2.8" fill="#2f241a" />

      <g fill="url(#plant-succulent-leaf)" stroke="#516d47" strokeWidth="0.5">
        {outer.map((angle) => (
          <path
            key={angle}
            d="M40 57 C30 53 23 43 25 33 C35 37 42 46 40 57Z"
            transform={`rotate(${angle} 40 57)`}
          />
        ))}
      </g>
      <g fill="url(#plant-succulent-inner)" stroke="#607d50" strokeWidth="0.45">
        {inner.map((angle) => (
          <path
            key={angle}
            d="M40 55 C34 52 29 45 30 38 C37 41 42 48 40 55Z"
            transform={`rotate(${angle} 40 55)`}
          />
        ))}
      </g>
      <circle cx="40" cy="53" r="3.2" fill="#b4c995" stroke="#607d50" strokeWidth="0.5" />
      <circle cx="39" cy="52" r="1.1" fill="#d7e4b9" opacity="0.8" />
    </svg>
  );
}
