"use client";

import { useEffect, useRef, useState } from "react";
import type { Subject, Theme } from "@/lib/types";
import { BookVisual, landingRect, type BookPagePreview, type BookRect } from "./BookVisual";

/** The library is already mounted behind the veil when the flight starts. */
const NAVIGATE_AT = 260;
/** Let the central page settle and the cover close first. */
const FLY_AT = 560;
const FLIGHT_MS = 380;
const REVEAL_AT = FLY_AT + FLIGHT_MS;
const REMOVE_AT = REVEAL_AT + 180;
const BAIL_OUT_AT = 3000;

type BookClosingProps = {
  subject: Subject;
  theme: Theme;
  /** The page that was open when the cover started to close. */
  preview: BookPagePreview | null;
  /** The shelf slot captured when the book was opened, if we have it. */
  from: BookRect | null;
  onNavigate: () => void;
  onRemove: () => void;
};

function rectFromElement(element: HTMLElement): BookRect {
  const box = element.getBoundingClientRect();
  return {
    top: Math.round(box.top),
    left: Math.round(box.left),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}

/**
 * The reverse of opening a book: the page settles back into the cover, the
 * cover swings shut, and the book flies back into its shelf slot. The library
 * is rendered behind the veil during the flight, and the real spine is kept
 * hidden until the overlay lands so the hand-off is seamless.
 */
export function BookClosing({
  subject,
  theme,
  preview,
  from: fallbackFrom,
  onNavigate,
  onRemove,
}: BookClosingProps) {
  const [to] = useState<BookRect>(landingRect);
  const [from, setFrom] = useState<BookRect | null>(fallbackFrom);
  const [flying, setFlying] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const navigate = useRef(onNavigate);
  const remove = useRef(onRemove);

  useEffect(() => {
    navigate.current = onNavigate;
    remove.current = onRemove;
  }, [onNavigate, onRemove]);

  useEffect(() => {
    const navTimer = window.setTimeout(() => navigate.current(), NAVIGATE_AT);

    const flyTimer = window.setTimeout(() => {
      const element = document.querySelector<HTMLElement>(
        `[data-book-id="${CSS.escape(subject.id)}"]`,
      );
      if (element) setFrom(rectFromElement(element));
      setFlying(true);
    }, FLY_AT);

    const revealTimer = window.setTimeout(
      () => setRevealing(true),
      REVEAL_AT,
    );
    const removeTimer = window.setTimeout(() => remove.current(), REMOVE_AT);
    const bailOut = window.setTimeout(() => remove.current(), BAIL_OUT_AT);

    return () => {
      window.clearTimeout(navTimer);
      window.clearTimeout(flyTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(bailOut);
    };
  }, [subject.id]);

  const target = from ?? to;

  return (
    <BookVisual
      subject={subject}
      theme={theme}
      preview={preview}
      sceneClass="book-close-scene"
      veilClass={`book-close-veil ${revealing ? "is-revealing" : ""}`}
      flyClass={`book-fly--closing ${flying ? "is-flying" : ""}`}
      modelClass="book-model--closing"
      style={
        {
          "--from-top": `${target.top}px`,
          "--from-left": `${target.left}px`,
          "--from-w": `${target.width}px`,
          "--from-h": `${target.height}px`,
          "--to-top": `${to.top}px`,
          "--to-left": `${to.left}px`,
          "--to-w": `${to.width}px`,
          "--to-h": `${to.height}px`,
        } as React.CSSProperties
      }
    />
  );
}
