type Star = {
  x: number;
  y: number;
  r: number;
  opacity: number;
  color: string;
  twinkle?: { duration: number; delay: number };
};

const STAR_COLORS = [
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#e6f0ff",
  "#dbe8ff",
  "#fff1d4",
  "#e8dcff",
];

/** Deterministic scatter, so the sky never hydrates into a different one. */
function createStars(count: number): Star[] {
  let state = 0x9e3779b9;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  return Array.from({ length: count }, (_, index) => {
    let x: number;
    let y: number;

    if (index % 4 === 0) {
      // A loose diagonal drift follows the Milky Way band.
      const along = random();
      x = 28 + along * 544;
      y = 410 - along * 330 + (random() - 0.5) * 90;
    } else {
      x = random() * 600;
      y = random() * 500;
    }

    const roll = random();
    const radius =
      roll > 0.94
        ? 1.7 + random() * 0.9
        : roll > 0.76
          ? 1.05 + random() * 0.45
          : 0.4 + random() * 0.45;
    const twinkle =
      index % 13 === 0
        ? {
            duration: 3.2 + random() * 3.4,
            delay: -random() * 4.5,
          }
        : undefined;

    return {
      x: Math.min(596, Math.max(4, x)),
      y: Math.min(496, Math.max(4, y)),
      r: radius,
      opacity: 0.28 + random() * 0.68,
      color: STAR_COLORS[Math.floor(random() * STAR_COLORS.length)],
      twinkle,
    };
  });
}

const STARS = createStars(148);

const SPARKLES = [
  { x: 82, y: 76, r: 4.4, color: "#fff4d8", duration: 5.2, delay: -0.8 },
  { x: 238, y: 138, r: 3.6, color: "#e6f0ff", duration: 4.4, delay: -2.1 },
  { x: 432, y: 58, r: 4.8, color: "#f0e4ff", duration: 6.1, delay: -3.4 },
  { x: 334, y: 232, r: 3.2, color: "#ffffff", duration: 4.8, delay: -1.5 },
  { x: 522, y: 198, r: 3.9, color: "#dbe8ff", duration: 5.6, delay: -0.2 },
  { x: 146, y: 306, r: 3.3, color: "#fff1d4", duration: 4.1, delay: -2.8 },
];

function sparklePath(r: number): string {
  return `M0 -${r} L${r * 0.22} -${r * 0.22} L${r} 0 L${r * 0.22} ${r * 0.22} L0 ${r} L-${r * 0.22} ${r * 0.22} L-${r} 0 L-${r * 0.22} -${r * 0.22} Z`;
}

/** A scattered, non-repeating night sky for the library window. */
export function WindowStars() {
  return (
    <span aria-hidden="true" className="window-stars">
      <svg
        className="window-stars-svg"
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        {STARS.map((star, index) => (
          <g key={index}>
            {star.r > 1.45 ? (
              <circle
                cx={star.x}
                cy={star.y}
                r={star.r * 3.8}
                fill={star.color}
                opacity={star.opacity * 0.12}
              />
            ) : null}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill={star.color}
              opacity={star.opacity}
              className={star.twinkle ? "window-star--twinkle" : undefined}
              style={
                star.twinkle
                  ? {
                      animationDuration: `${star.twinkle.duration}s`,
                      animationDelay: `${star.twinkle.delay}s`,
                    }
                  : undefined
              }
            />
          </g>
        ))}

        {SPARKLES.map((sparkle) => (
          <path
            key={`${sparkle.x}-${sparkle.y}`}
            d={sparklePath(sparkle.r)}
            fill={sparkle.color}
            transform={`translate(${sparkle.x} ${sparkle.y})`}
            className="window-star--twinkle"
            style={{
              animationDuration: `${sparkle.duration}s`,
              animationDelay: `${sparkle.delay}s`,
            }}
          />
        ))}
      </svg>
    </span>
  );
}
