export type ArtKind = "family" | "couple" | "beach" | "child";

/** Framed family photographs for the cabinet shelves. */
export function PaintingArt({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case "family":
      return <FamilyPhoto />;
    case "couple":
      return <CouplePhoto />;
    case "beach":
      return <BeachPhoto />;
    case "child":
      return <ChildPhoto />;
  }
}

function FamilyPhoto() {
  return (
    <svg
      viewBox="0 0 160 110"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="photo-family-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3d2b8" />
          <stop offset="1" stopColor="#c4a37e" />
        </linearGradient>
        <radialGradient id="photo-family-light">
          <stop offset="0" stopColor="#fff3d8" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff3d8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="photo-family-vignette">
          <stop offset="0.55" stopColor="#2a190e" stopOpacity="0" />
          <stop offset="1" stopColor="#2a190e" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      <rect width="160" height="110" fill="url(#photo-family-wall)" />
      <ellipse cx="80" cy="48" rx="63" ry="47" fill="url(#photo-family-light)" />
      <rect y="88" width="160" height="22" fill="#a98a66" />
      <path d="M0 88 H160" stroke="#8f6f4e" strokeWidth="0.8" opacity="0.6" />

      {/* father */}
      <path
        d="M30 96 C30 73 35 55 48 53 C61 55 66 73 66 96 Z"
        fill="#5f7a76"
        stroke="#47605d"
        strokeWidth="0.7"
      />
      <rect x="44" y="43" width="8" height="10" rx="3" fill="#d7a17c" />
      <ellipse cx="48" cy="35" rx="11" ry="12.5" fill="#ddb08c" />
      <path
        d="M37 34 C37 21 59 20 59 34 C55 28 42 28 37 34Z"
        fill="#3b2a21"
      />
      <circle cx="43.5" cy="35" r="1" fill="#2c2119" />
      <circle cx="52.5" cy="35" r="1" fill="#2c2119" />
      <path
        d="M45 40 Q48 42 51 40"
        stroke="#8a523a"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M43 53 L48 58 L53 53" fill="#e8ddc6" />

      {/* mother */}
      <path
        d="M96 96 C96 73 100 54 112 52 C124 54 128 73 128 96 Z"
        fill="#9b5e5a"
        stroke="#7c4643"
        strokeWidth="0.7"
      />
      <rect x="108" y="42" width="8" height="10" rx="3" fill="#d7a17c" />
      <ellipse cx="112" cy="33" rx="13" ry="14.5" fill="#5a3b2a" />
      <ellipse cx="112" cy="35" rx="10.5" ry="12" fill="#ddb08c" />
      <path
        d="M99 36 C98 48 100 52 103 53 L104 38Z"
        fill="#5a3b2a"
      />
      <path
        d="M125 36 C126 48 124 52 121 53 L120 38Z"
        fill="#5a3b2a"
      />
      <circle cx="108" cy="35" r="1" fill="#2c2119" />
      <circle cx="116.5" cy="35" r="1" fill="#2c2119" />
      <path
        d="M109 40 Q112 42 115 40"
        stroke="#8a523a"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M107 52 L112 57 L117 52" fill="#eadcc7" />

      {/* daughter */}
      <path
        d="M62 96 C62 76 65 64 73 62 C81 64 84 76 84 96 Z"
        fill="#b08a4e"
        stroke="#8f6d3c"
        strokeWidth="0.7"
      />
      <rect x="70" y="54" width="6" height="8" rx="2.5" fill="#d9a37e" />
      <ellipse cx="73" cy="50" rx="8.5" ry="9.5" fill="#dfb28e" />
      <path
        d="M64.5 49 C64 40 82 39 81.5 49 C78 44 68 44 64.5 49Z"
        fill="#5c3a25"
      />
      <circle cx="61.5" cy="48" r="3.2" fill="#5c3a25" />
      <circle cx="84.5" cy="48" r="3.2" fill="#5c3a25" />
      <circle cx="70" cy="50" r="0.8" fill="#2c2119" />
      <circle cx="76" cy="50" r="0.8" fill="#2c2119" />
      <path
        d="M71 54 Q73 55.5 75 54"
        stroke="#8a523a"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M70 62 L73 65 L76 62" fill="#f0e5d2" />

      {/* son */}
      <path
        d="M84 96 C84 78 87 66 94 64 C101 66 104 78 104 96 Z"
        fill="#5d7181"
        stroke="#455766"
        strokeWidth="0.7"
      />
      <rect x="91" y="56" width="6" height="8" rx="2.5" fill="#d9a37e" />
      <ellipse cx="94" cy="52" rx="8" ry="9" fill="#dfb28e" />
      <path
        d="M86 51 C86 42 102 42 102 51 C98 47 90 47 86 51Z"
        fill="#3b2a21"
      />
      <circle cx="91" cy="52" r="0.8" fill="#2c2119" />
      <circle cx="97" cy="52" r="0.8" fill="#2c2119" />
      <path
        d="M92 56 Q94 57.5 96 56"
        stroke="#8a523a"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M91 64 L94 67 L97 64" fill="#e8dfcf" />

      <rect width="160" height="110" fill="url(#photo-family-vignette)" />
    </svg>
  );
}

function CouplePhoto() {
  return (
    <svg
      viewBox="0 0 160 110"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="photo-couple-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e7d9c2" />
          <stop offset="0.55" stopColor="#d6c1a5" />
          <stop offset="1" stopColor="#bfa487" />
        </linearGradient>
        <radialGradient id="photo-couple-light">
          <stop offset="0" stopColor="#fff1d4" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff1d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="photo-couple-vignette">
          <stop offset="0.55" stopColor="#24160c" stopOpacity="0" />
          <stop offset="1" stopColor="#24160c" stopOpacity="0.32" />
        </radialGradient>
      </defs>

      <rect width="160" height="110" fill="url(#photo-couple-wall)" />
      <ellipse cx="82" cy="44" rx="54" ry="42" fill="url(#photo-couple-light)" />

      {/* man */}
      <path
        d="M40 110 C40 82 47 63 66 61 C85 63 92 82 92 110 Z"
        fill="#5f5b50"
      />
      <rect x="62" y="51" width="8" height="12" rx="3" fill="#c99b78" />
      <ellipse cx="66" cy="42" rx="13" ry="14.5" fill="#d2a682" />
      <path
        d="M53 41 C53 26 79 24 79 41 C74 34 60 33 53 41Z"
        fill="#443327"
      />
      <circle cx="61.5" cy="42" r="1.1" fill="#2c2119" />
      <circle cx="71" cy="42" r="1.1" fill="#2c2119" />
      <path
        d="M63 48 Q66 50 69 48"
        stroke="#7f4a36"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M61 62 L66 67 L71 62" fill="#e7ddca" />

      {/* woman */}
      <path
        d="M76 110 C76 84 83 66 100 64 C117 66 124 84 124 110 Z"
        fill="#8e6f5d"
      />
      <rect x="96" y="54" width="8" height="11" rx="3" fill="#d4a984" />
      <ellipse cx="100" cy="44" rx="12" ry="14" fill="#d9ad88" />
      <path
        d="M88 44 C87 27 113 26 112 44 L116 59 C112 61 110 56 110 50 L109 43 C103 39 96 39 91 43 L90 50 C90 56 88 61 84 59 Z"
        fill="#6d4a31"
      />
      <circle cx="95" cy="44" r="1" fill="#2c2119" />
      <circle cx="104" cy="44" r="1" fill="#2c2119" />
      <path
        d="M96 50 Q100 52 103 50"
        stroke="#8a523a"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M96 65 L100 70 L104 65" fill="#f0e7d5" />

      <rect width="160" height="110" fill="url(#photo-couple-vignette)" />
    </svg>
  );
}

function BeachPhoto() {
  return (
    <svg
      viewBox="0 0 160 110"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="photo-beach-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9cdd2" />
          <stop offset="0.55" stopColor="#efd2ac" />
          <stop offset="1" stopColor="#f6dfba" />
        </linearGradient>
        <linearGradient id="photo-beach-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f9aa0" />
          <stop offset="0.6" stopColor="#4f7f88" />
          <stop offset="1" stopColor="#38666f" />
        </linearGradient>
        <linearGradient id="photo-beach-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8cd9c" />
          <stop offset="1" stopColor="#cfae78" />
        </linearGradient>
        <radialGradient id="photo-beach-vignette">
          <stop offset="0.55" stopColor="#22170e" stopOpacity="0" />
          <stop offset="1" stopColor="#22170e" stopOpacity="0.28" />
        </radialGradient>
      </defs>

      <rect width="160" height="110" fill="url(#photo-beach-sky)" />
      <circle cx="118" cy="35" r="10" fill="#fff0c8" />
      <circle cx="118" cy="35" r="18" fill="#fff0c8" opacity="0.22" />
      <g fill="#f7ebd6" opacity="0.55">
        <path d="M18 27 q10 -4 20 0 q-10 3 -20 0Z" />
        <path d="M43 34 q8 -3 16 0 q-8 2 -16 0Z" />
        <path d="M87 20 q9 -3 18 0 q-9 2 -18 0Z" />
      </g>

      <rect y="61" width="160" height="25" fill="url(#photo-beach-sea)" />
      <path d="M0 61 H160" stroke="#e8dcc2" strokeWidth="0.8" opacity="0.65" />
      <g stroke="#a8c4c1" strokeWidth="0.7" opacity="0.45">
        <path d="M10 68 q10 -2 20 0" />
        <path d="M40 73 q12 -2 24 0" />
        <path d="M90 69 q10 -2 20 0" />
        <path d="M120 76 q8 -2 16 0" />
        <path d="M62 78 q10 -2 20 0" />
      </g>
      <g stroke="#f5dfb2" strokeWidth="0.7" opacity="0.3">
        <path d="M110 66 h16" />
        <path d="M114 71 h10" />
        <path d="M118 77 h6" />
      </g>

      <path d="M0 82 Q36 78 72 82 T160 82 V110 H0Z" fill="url(#photo-beach-sand)" />
      <g fill="#b89462" opacity="0.4">
        <ellipse cx="54" cy="96" rx="10" ry="2" />
        <ellipse cx="80" cy="95" rx="8" ry="1.8" />
        <ellipse cx="108" cy="96" rx="10" ry="2" />
      </g>

      {/* family, seen from behind */}
      <path d="M50 96 C50 78 53 69 58 68 C63 69 66 78 66 96 Z" fill="#4f6b72" />
      <circle cx="58" cy="63" r="6" fill="#4a382b" />
      <path d="M56 98 C57 86 59 78 58 72" stroke="#4f6b72" strokeWidth="2" opacity="0.7" />

      <path d="M74 96 C74 80 77 72 82 71 C87 72 90 80 90 96 Z" fill="#b08a4e" />
      <circle cx="82" cy="67" r="5" fill="#5c3a25" />

      <path d="M96 96 C96 77 99 67 104 66 C109 67 112 77 112 96 Z" fill="#8b5d5a" />
      <circle cx="104" cy="61" r="6.5" fill="#3b2a21" />

      <g stroke="#c99b78" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M58 76 C64 80 72 80 78 78" />
        <path d="M104 75 C98 79 90 80 86 78" />
      </g>

      <g fill="none" stroke="#4b4f4e" strokeWidth="0.8" strokeLinecap="round">
        <path d="M34 28 q3 -3 6 0" />
        <path d="M43 24 q3 -3 6 0" />
        <path d="M136 42 q3 -3 6 0" />
      </g>

      <g transform="translate(128 42) rotate(12)">
        <path d="M0 0 L7 6 L0 12 L-7 6 Z" fill="#b45f4f" stroke="#7d4238" strokeWidth="0.5" />
        <path d="M0 0 L0 12" stroke="#7d4238" strokeWidth="0.4" />
        <path d="M0 12 q4 7 9 9" fill="none" stroke="#7d4238" strokeWidth="0.4" />
      </g>

      <circle cx="30" cy="98" r="5" fill="#e9d8b6" stroke="#b45f4f" strokeWidth="2" />

      <rect width="160" height="110" fill="url(#photo-beach-vignette)" />
    </svg>
  );
}

function ChildPhoto() {
  return (
    <svg
      viewBox="0 0 160 110"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="photo-child-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e3dad0" />
          <stop offset="0.6" stopColor="#cbbfb1" />
          <stop offset="1" stopColor="#ab9a89" />
        </linearGradient>
        <radialGradient id="photo-child-light">
          <stop offset="0" stopColor="#fffaf0" stopOpacity="0.65" />
          <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="photo-child-vignette">
          <stop offset="0.52" stopColor="#21160e" stopOpacity="0" />
          <stop offset="1" stopColor="#21160e" stopOpacity="0.34" />
        </radialGradient>
      </defs>

      <rect width="160" height="110" fill="url(#photo-child-wall)" />
      <ellipse cx="80" cy="43" rx="45" ry="40" fill="url(#photo-child-light)" />

      <path d="M18 110 C28 84 48 76 80 76 C112 76 132 84 142 110 Z" fill="#726a60" />
      <path d="M62 76 L80 86 L98 76 L94 70 L66 70 Z" fill="#f0e7d8" />
      <rect x="74" y="60" width="12" height="16" rx="4" fill="#d9b99c" />

      <ellipse cx="80" cy="44" rx="23" ry="27" fill="#e2c3a8" />
      <path
        d="M58 43 C56 22 104 20 102 43 C98 34 90 30 80 30 C70 30 62 34 58 43Z"
        fill="#4a3729"
      />
      <path d="M58 42 C52 49 52 62 58 66 L63 52 Z" fill="#4a3729" />
      <path d="M102 42 C108 49 108 62 102 66 L97 52 Z" fill="#4a3729" />

      <path d="M72 29 C76 24 84 24 88 29" fill="none" stroke="#5c4533" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="88" cy="27" rx="6" ry="4" fill="#a56b5f" />
      <path d="M82 27 Q88 23 94 27" fill="none" stroke="#8b544b" strokeWidth="0.8" />

      <g fill="#3b2a21">
        <ellipse cx="71" cy="44" rx="2.1" ry="2.6" />
        <ellipse cx="89" cy="44" rx="2.1" ry="2.6" />
      </g>
      <g fill="#fff9ef">
        <circle cx="71.8" cy="43.3" r="0.7" />
        <circle cx="89.8" cy="43.3" r="0.7" />
      </g>
      <path d="M66 38 Q71 36 75 38" fill="none" stroke="#5c4533" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M85 38 Q90 36 94 38" fill="none" stroke="#5c4533" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M79 47 Q80 50 82 48" fill="none" stroke="#b98467" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M73 55 Q80 61 87 55" fill="none" stroke="#a05f4e" strokeWidth="1" strokeLinecap="round" />
      <g fill="#d99a86" opacity="0.35">
        <ellipse cx="67" cy="51" rx="5" ry="3" />
        <ellipse cx="93" cy="51" rx="5" ry="3" />
      </g>

      <path d="M56 74 Q80 86 104 74 L100 110 H60 Z" fill="#f0e7d8" opacity="0.55" />

      <rect width="160" height="110" fill="url(#photo-child-vignette)" />
    </svg>
  );
}
