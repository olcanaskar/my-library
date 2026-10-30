type ArtKind = "dusk" | "garden" | "sea" | "terracotta";
type FrameSize = "large" | "medium" | "small";
type FrameTilt = "left" | "right";

type FrameSpec = {
  size: FrameSize;
  art: ArtKind;
  tilt: FrameTilt;
};

const ART_SHELVES: Record<1 | 2, readonly FrameSpec[]> = {
  1: [
    { size: "large", art: "dusk", tilt: "left" },
    { size: "small", art: "garden", tilt: "right" },
  ],
  2: [
    { size: "medium", art: "sea", tilt: "left" },
    { size: "small", art: "terracotta", tilt: "right" },
  ],
};

/** Two framed paintings resting on a cabinet shelf. */
export function ArtShelf({ variant }: { variant: 1 | 2 }) {
  return (
    <div aria-hidden="true" className="dummy-shelf art-shelf">
      {ART_SHELVES[variant].map((frame) => (
        <span
          key={frame.art}
          className={`shelf-frame shelf-frame--${frame.size} shelf-frame--${frame.tilt}`}
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

function PaintingArt({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case "dusk":
      return <DuskPainting />;
    case "garden":
      return <GardenPainting />;
    case "sea":
      return <SeaPainting />;
    case "terracotta":
      return <StillLifePainting />;
  }
}

function DuskPainting() {
  return (
    <svg
      viewBox="0 0 160 110"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="paint-dusk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f3b58" />
          <stop offset="0.52" stopColor="#655c7a" />
          <stop offset="0.8" stopColor="#b47e70" />
          <stop offset="1" stopColor="#dfa976" />
        </linearGradient>
        <linearGradient id="paint-dusk-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#786b73" />
          <stop offset="0.45" stopColor="#4d5266" />
          <stop offset="1" stopColor="#262f43" />
        </linearGradient>
        <radialGradient id="paint-dusk-moon">
          <stop offset="0" stopColor="#fff7dd" />
          <stop offset="1" stopColor="#eed4a2" />
        </radialGradient>
        <radialGradient id="paint-dusk-halo">
          <stop offset="0" stopColor="#ffe9b5" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffe9b5" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="160" height="110" fill="url(#paint-dusk-sky)" />
      <circle cx="116" cy="30" r="22" fill="url(#paint-dusk-halo)" />
      <circle cx="116" cy="30" r="8" fill="url(#paint-dusk-moon)" />
      <g fill="#fff4d8">
        <circle cx="24" cy="18" r="1" opacity="0.7" />
        <circle cx="43" cy="29" r="0.7" opacity="0.55" />
        <circle cx="64" cy="16" r="0.9" opacity="0.65" />
        <circle cx="84" cy="27" r="0.6" opacity="0.5" />
        <circle cx="101" cy="14" r="0.7" opacity="0.55" />
        <circle cx="137" cy="22" r="0.8" opacity="0.6" />
      </g>

      <path
        d="M0 66 L22 48 L44 62 L67 42 L92 61 L115 50 L138 64 L160 54 V90 H0 Z"
        fill="#3d4560"
      />
      <path
        d="M0 74 L24 60 L48 72 L70 56 L96 73 L118 62 L142 74 L160 66 V92 H0 Z"
        fill="#2b3449"
      />
      <path
        d="M0 82 L18 73 L40 82 L62 69 L86 81 L108 71 L132 82 L150 74 L160 80 V94 H0 Z"
        fill="#1e2838"
      />
      <g fill="#17212d">
        <path d="M8 84 l4 -11 4 11z" />
        <path d="M17 84 l3 -8 3 8z" />
        <path d="M31 84 l4 -10 4 10z" />
        <path d="M48 82 l3 -8 3 8z" />
        <path d="M60 83 l4 -10 4 10z" />
        <path d="M126 83 l3 -8 3 8z" />
        <path d="M137 84 l4 -11 4 11z" />
      </g>

      <rect y="88" width="160" height="22" fill="url(#paint-dusk-water)" />
      <g stroke="#f2dba9" strokeWidth="0.9" opacity="0.45">
        <path d="M108 92 h16" />
        <path d="M112 96 h10" />
        <path d="M118 100 h6" />
        <path d="M98 94 h6" opacity="0.5" />
      </g>
      <g stroke="#9aa2ad" strokeWidth="0.6" opacity="0.28">
        <path d="M8 96 h24" />
        <path d="M14 100 h18" />
        <path d="M46 94 h20" />
        <path d="M36 102 h30" />
        <path d="M128 97 h22" />
      </g>

      <path d="M115 84 h8 l-1.4 2.4 h-5.2z" fill="#121822" />
      <path d="M119 79 v5" stroke="#121822" strokeWidth="0.9" />
      <path d="M0 104 Q30 100 55 104 T110 104 T160 102 V110 H0Z" fill="#15120f" opacity="0.6" />
    </svg>
  );
}

function GardenPainting() {
  return (
    <svg
      viewBox="0 0 160 110"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="paint-garden-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8da66d" />
          <stop offset="0.55" stopColor="#6f8b57" />
          <stop offset="1" stopColor="#4f6a43" />
        </linearGradient>
        <linearGradient id="paint-garden-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5ecd9" />
          <stop offset="1" stopColor="#e7d8ba" />
        </linearGradient>
      </defs>

      <rect width="160" height="110" fill="url(#paint-garden-paper)" />
      <rect
        x="5"
        y="5"
        width="150"
        height="100"
        fill="none"
        stroke="#c9b88e"
        strokeWidth="0.8"
        opacity="0.8"
      />

      <g stroke="#5e754d" strokeWidth="1.25" fill="none" strokeLinecap="round">
        <path d="M80 101 C80 83 78 62 76 42" />
        <path d="M78 73 C63 65 51 54 43 40" />
        <path d="M78 83 C94 77 105 65 111 49" />
        <path d="M76 59 C68 47 66 35 70 24" />
        <path d="M80 93 C92 89 101 82 108 74" />
      </g>

      <g fill="url(#paint-garden-leaf)" stroke="#4e6540" strokeWidth="0.5">
        <path d="M78 83 C60 81 48 69 45 54 C62 58 76 67 78 83Z" />
        <path d="M79 75 C94 71 104 59 106 44 C91 49 80 59 79 75Z" />
        <path d="M77 65 C62 59 53 48 53 34 C68 39 78 50 77 65Z" />
        <path d="M78 55 C86 47 88 34 82 24 C73 33 72 45 78 55Z" />
        <path d="M80 91 C94 87 104 79 110 69 C96 71 84 79 80 91Z" />
      </g>

      <g stroke="#b4c795" strokeWidth="0.5" opacity="0.75" fill="none">
        <path d="M77 81 C68 75 58 67 49 57" />
        <path d="M80 73 C88 66 96 58 101 49" />
        <path d="M77 63 C69 56 61 47 58 38" />
        <path d="M78 53 C80 45 81 35 81 29" />
        <path d="M82 88 C91 84 99 78 105 71" />
      </g>

      {[
        [53, 36],
        [104, 49],
        [71, 22],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-3"
              rx="1.45"
              ry="2.8"
              fill="#faf0dc"
              stroke="#c8a45f"
              strokeWidth="0.4"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle r="1.5" fill="#c99a45" />
        </g>
      ))}

      <g transform="translate(118 28) rotate(-12)" fill="#b06b52" opacity="0.9">
        <path d="M0 0 C-5 -5 -8 -1 -5 3 C-2 6 0 3 0 0Z" />
        <path d="M0 0 C5 -5 8 -1 5 3 C2 6 0 3 0 0Z" />
      </g>
      <path
        d="M112 97 q7 -4 14 0"
        fill="none"
        stroke="#9a8358"
        strokeWidth="0.7"
        opacity="0.8"
      />
    </svg>
  );
}

function SeaPainting() {
  return (
    <svg
      viewBox="0 0 160 110"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="paint-sea-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8bcc4" />
          <stop offset="0.55" stopColor="#d8d1bd" />
          <stop offset="1" stopColor="#ead7b5" />
        </linearGradient>
        <linearGradient id="paint-sea-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f8c92" />
          <stop offset="0.55" stopColor="#496a72" />
          <stop offset="1" stopColor="#2f4c56" />
        </linearGradient>
        <radialGradient id="paint-sea-sun">
          <stop offset="0" stopColor="#fff3cf" />
          <stop offset="1" stopColor="#e9c78d" />
        </radialGradient>
      </defs>

      <rect width="160" height="110" fill="url(#paint-sea-sky)" />
      <circle cx="116" cy="29" r="17" fill="#f7e3b8" opacity="0.28" />
      <circle cx="116" cy="29" r="8" fill="url(#paint-sea-sun)" />

      <g fill="#f3ead6" opacity="0.55">
        <path d="M18 28 q10 -4 20 0 q-10 3 -20 0Z" />
        <path d="M42 35 q8 -3 16 0 q-8 2 -16 0Z" />
        <path d="M92 18 q9 -3 18 0 q-9 2 -18 0Z" />
      </g>

      <path d="M0 58 L16 43 L31 52 L46 41 L60 58 V70 H0Z" fill="#526462" />
      <path d="M112 58 L126 44 L142 54 L154 46 L160 53 V70 H112Z" fill="#415553" />
      <path d="M0 60 L14 50 L30 60 L44 51 L60 61 V70 H0Z" fill="#637471" opacity="0.7" />
      <path d="M116 61 L129 52 L145 61 L156 54 L160 58 V70 H116Z" fill="#526664" opacity="0.75" />

      <rect y="64" width="160" height="46" fill="url(#paint-sea-water)" />
      <path d="M0 64 H160" stroke="#d9d2bb" strokeWidth="0.8" opacity="0.65" />

      <g stroke="#a7c0bd" strokeWidth="0.7" opacity="0.5">
        <path d="M8 73 q10 -2 20 0" />
        <path d="M38 78 q12 -2 24 0" />
        <path d="M12 84 q14 -2 28 0" />
        <path d="M58 90 q10 -2 20 0" />
        <path d="M26 96 q16 -2 32 0" />
        <path d="M96 82 q10 -2 20 0" />
        <path d="M118 92 q8 -2 16 0" />
      </g>
      <g stroke="#f1dfb7" strokeWidth="0.7" opacity="0.25">
        <path d="M108 72 h16" />
        <path d="M112 78 h10" />
        <path d="M116 85 h7" />
      </g>

      <g>
        <path d="M73 79 H94 L91 83 H76 Z" fill="#3b2c20" />
        <path d="M83 66 V79" stroke="#3b2c20" strokeWidth="1" />
        <path d="M84 66 L84 77 L94 77 Z" fill="#f2e7d2" />
        <path d="M82 68 L76 77 H82 Z" fill="#d79a6c" />
        <path d="M83 82 q6 1 10 0" stroke="#d7b987" strokeWidth="0.6" opacity="0.6" />
      </g>

      <g fill="none" stroke="#4b4f4e" strokeWidth="0.8" strokeLinecap="round">
        <path d="M34 24 q3 -3 6 0" />
        <path d="M43 20 q3 -3 6 0" />
        <path d="M139 33 q3 -3 6 0" />
      </g>
      <path d="M0 105 Q34 100 62 104 T120 105 T160 102 V110 H0Z" fill="#1d2627" opacity="0.45" />
    </svg>
  );
}

function StillLifePainting() {
  return (
    <svg
      viewBox="0 0 160 110"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="paint-still-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0e3c8" />
          <stop offset="1" stopColor="#dcc8a4" />
        </linearGradient>
        <linearGradient id="paint-still-vase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cf8960" />
          <stop offset="0.55" stopColor="#b36545" />
          <stop offset="1" stopColor="#843f2d" />
        </linearGradient>
        <linearGradient id="paint-still-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7d9663" />
          <stop offset="1" stopColor="#536a45" />
        </linearGradient>
      </defs>

      <rect width="160" height="110" fill="url(#paint-still-paper)" />
      <rect
        x="5"
        y="5"
        width="150"
        height="100"
        fill="none"
        stroke="#c6ac80"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <circle cx="82" cy="42" r="26" fill="#d9a15f" opacity="0.22" />
      <rect y="82" width="160" height="28" fill="#d5bc93" />
      <path d="M0 82 H160" stroke="#a98456" strokeWidth="0.9" opacity="0.8" />
      <ellipse cx="81" cy="87" rx="28" ry="4.5" fill="#6b4a32" opacity="0.22" />

      <g>
        <path
          d="M69 50 C61 61 62 77 70 86 L94 86 C102 77 103 61 95 50 Z"
          fill="url(#paint-still-vase)"
          stroke="#6d3625"
          strokeWidth="0.8"
        />
        <ellipse cx="82" cy="50" rx="13" ry="3.6" fill="#d99872" stroke="#6d3625" strokeWidth="0.8" />
        <ellipse cx="82" cy="50" rx="9" ry="2.2" fill="#5a3325" />
        <path
          d="M69 56 C65 60 65 66 68 70"
          fill="none"
          stroke="#843f2d"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M95 56 C99 60 99 66 96 70"
          fill="none"
          stroke="#843f2d"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M76 60 C74 69 76 78 80 83"
          fill="none"
          stroke="#e0a077"
          strokeWidth="1.2"
          opacity="0.45"
        />
      </g>

      <g stroke="#5d7049" strokeWidth="1.15" fill="none" strokeLinecap="round">
        <path d="M82 50 C78 38 68 30 56 26" />
        <path d="M83 50 C88 36 98 28 110 26" />
        <path d="M82 50 C82 38 84 28 90 18" />
        <path d="M80 50 C72 42 64 38 52 38" />
      </g>

      <g fill="url(#paint-still-leaf)" stroke="#4f6240" strokeWidth="0.45">
        <ellipse cx="58" cy="27" rx="7" ry="3" transform="rotate(-26 58 27)" />
        <ellipse cx="68" cy="34" rx="6" ry="2.7" transform="rotate(-35 68 34)" />
        <ellipse cx="104" cy="30" rx="7" ry="3" transform="rotate(24 104 30)" />
        <ellipse cx="96" cy="38" rx="6" ry="2.6" transform="rotate(34 96 38)" />
        <ellipse cx="90" cy="21" rx="6" ry="2.7" transform="rotate(16 90 21)" />
        <ellipse cx="55" cy="39" rx="6" ry="2.6" transform="rotate(-8 55 39)" />
      </g>
      <g fill="#7b4a3a">
        <circle cx="49" cy="30" r="1.6" />
        <circle cx="66" cy="24" r="1.4" />
        <circle cx="108" cy="36" r="1.5" />
        <circle cx="88" cy="17" r="1.2" />
      </g>

      <ellipse cx="126" cy="87" rx="7" ry="5.5" fill="#c98a4e" stroke="#9a6638" strokeWidth="0.5" />
      <path
        d="M126 82 q2 -4 5 -5"
        fill="none"
        stroke="#7a5a35"
        strokeWidth="0.7"
      />
      <path
        d="M20 90 q12 -2 24 0"
        fill="none"
        stroke="#b8986d"
        strokeWidth="0.6"
        opacity="0.7"
      />
    </svg>
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
