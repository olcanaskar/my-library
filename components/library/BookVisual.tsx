import type { Note, Subject, Theme } from "@/lib/types";
import { PageFace } from "@/components/editor/PageFace";

export type BookRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type BookPagePreview = {
  note: Note;
  pageNo: number;
  totalPages: number;
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

/** Width of the real notebook shell, used to keep the mini page proportional. */
export function editorShellWidthEstimate(): number {
  if (typeof document === "undefined") return 728;
  const vw = document.documentElement.clientWidth;
  return Math.min(768, vw) - (vw >= 640 ? 40 : 16);
}

/** Width of the page inside the notebook shell (28px spine, 10px edge). */
export function editorPageWidthEstimate(): number {
  return Math.max(1, editorShellWidthEstimate() - 38);
}

type BookVisualProps = {
  subject: Subject;
  theme: Theme;
  preview?: BookPagePreview | null;
  previewScale?: number;
  /** Unscaled width of the page; it is laid out like the editor page. */
  pageWidth?: number;
  sceneClass?: string;
  veilClass?: string;
  flyClass?: string;
  modelClass?: string;
  zoomTransform?: string;
  zoomOrigin?: string;
  style?: React.CSSProperties;
};

/**
 * A small 3D book: a page block with real thickness, a back cover and a
 * double-sided front cover hinged on the left edge. The shared model is used
 * by both the opening and closing animations.
 */
export function BookVisual({
  subject,
  theme,
  preview,
  previewScale,
  pageWidth,
  sceneClass = "",
  veilClass = "",
  flyClass = "",
  modelClass = "",
  zoomTransform,
  zoomOrigin,
  style,
}: BookVisualProps) {
  const resolvedPreviewScale =
    previewScale ??
    (preview ? landingRect().width / editorShellWidthEstimate() : 1);
  const resolvedPageWidth = pageWidth ?? editorPageWidthEstimate();

  return (
    <div
      aria-hidden="true"
      className={`book-scene fixed inset-0 z-40 ${sceneClass}`}
    >
      <div className={`book-veil absolute inset-0 ${veilClass}`} />

      <div
        className={`book-fly ${flyClass} ${zoomTransform ? "is-zooming" : ""}`}
        style={
          {
            ...style,
            "--book-color": subject.color,
          } as React.CSSProperties
        }
      >
        <div
          className={`book-model ${modelClass}`}
          style={
            zoomTransform
              ? { transform: zoomTransform, transformOrigin: zoomOrigin }
              : undefined
          }
        >
          {/* the back board, giving the book its depth */}
          <div className="book-back-cover absolute inset-0 rounded-[3px]" />

          {/* the page block and its visible edges */}
          <div className="book-pages-block absolute inset-0">
            <div
              className="book-shell book-preview-shell absolute inset-0"
              style={
                {
                  "--preview-scale": resolvedPreviewScale,
                } as React.CSSProperties
              }
            >
              <span aria-hidden="true" className="book-shell-spine">
                <span className="book-preview-spine-label font-serif">
                  {subject.name}
                </span>
              </span>
              <span aria-hidden="true" className="book-shell-cover" />
              <span aria-hidden="true" className="book-ribbon book-preview-ribbon" />

              <div className="book-preview-page">
                {preview ? (
                  <div
                    className="book-preview-sheet"
                    style={{ width: `${resolvedPageWidth}px` }}
                  >
                    <PageFace
                      subject={subject}
                      note={preview.note}
                      theme={theme}
                      pageNo={preview.pageNo}
                      totalPages={preview.totalPages}
                    />
                  </div>
                ) : null}
              </div>
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
