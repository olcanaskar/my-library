"use client";

import { CloseIcon } from "@/components/ui/icons";
import type { NoteImage } from "@/lib/types";

type NoteImagesProps = {
  images: NoteImage[];
  onRemove?: (id: string) => void;
  className?: string;
};

/** Imported photos and diagrams, taped into the page below the writing. */
export function NoteImages({
  images,
  onRemove,
  className = "",
}: NoteImagesProps) {
  if (images.length === 0) return null;

  return (
    <div
      className={`note-image-grid ${
        images.length === 1 ? "note-image-grid--single" : ""
      } ${className}`}
    >
      {images.map((image) => (
        <figure className="note-image" key={image.id}>
          {/* Imported images are local data URLs, so next/image would add no value. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.name ? `Imported image: ${image.name}` : "Imported image"}
            width={image.width}
            height={image.height}
            draggable={false}
          />
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(image.id)}
              aria-label="Remove image"
              title="Remove image"
              className="note-image-remove"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
