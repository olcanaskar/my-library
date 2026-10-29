import { paperClass, type Subject } from "@/lib/types";

export type BookRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** Where a book ends up when it comes forward: cover-shaped and centred. */
export function landingRect(): BookRect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.round(Math.min(360, Math.max(200, vw * 0.62)));
  const height = Math.round(Math.min(width * 1.3, vh * 0.58));

  return {
    top: Math.round((vh - height) / 2 - vh * 0.02),
    left: Math.round((vw - width) / 2),
    width,
    height,
  };
}

type BookVisualProps = {
  subject: Subject;
  sceneClass?: string;
  veilClass?: string;
  flyClass?: string;
  modelClass?: string;
  style?: React.CSSProperties;
};

/**
 * A small 3D book: a page block with real thickness, a back cover and a
 * double-sided front cover hinged on the left edge. The shared model is used
 * by both the opening and closing animations.
 */
export function BookVisual({
  subject,
  sceneClass = "",
  veilClass = "",
  flyClass = "",
  modelClass = "",
  style,
}: BookVisualProps) {
  return (
    <div
      aria-hidden="true"
      className={`book-scene fixed inset-0 z-40 ${sceneClass}`}
    >
      <div
        className={`book-veil absolute inset-0 bg-paper-deep ${veilClass}`}
      />

      <div
        className={`book-fly ${flyClass}`}
        style={
          {
            ...style,
            "--book-color": subject.color,
          } as React.CSSProperties
        }
      >
        <div className={`book-model ${modelClass}`}>
          {/* the back board, giving the book its depth */}
          <div className="book-back-cover absolute inset-0 rounded-[3px]" />

          {/* the page block and its visible edges */}
          <div className="book-pages-block absolute inset-0">
            <div
              className={`book-page ${paperClass(subject.paper)} absolute inset-0 overflow-hidden rounded-[3px] shadow-[0_30px_70px_-32px_rgba(0,0,0,0.5)]`}
            >
              <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/25 to-transparent" />
            </div>

            <span aria-hidden="true" className="book-fore-edge" />
            <span aria-hidden="true" className="book-spine-edge" />
            <span aria-hidden="true" className="book-top-edge" />
            <span aria-hidden="true" className="book-bottom-edge" />
          </div>

          {/* the cover, hinged on its left edge, painted on both sides */}
          <div className="book-cover-face absolute inset-0">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-4 w-px bg-white/20"
            />
            <span
              aria-hidden="true"
              className="absolute inset-y-0 right-6 w-px bg-black/15"
            />

            {/* the title as it sits on the spine... */}
            <span className="book-title-out absolute inset-0 flex items-center justify-center">
              <span className="book-title-spine max-h-[78%] overflow-hidden">
                {subject.name}
              </span>
            </span>

            {/* ...and the same title once the book faces us */}
            <span className="book-title-in absolute inset-0 flex items-center justify-center px-6 text-center">
              <span className="book-cover-title">{subject.name}</span>
            </span>

            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10"
            />

            <div className="book-cover-inside absolute inset-0 overflow-hidden rounded-[3px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
