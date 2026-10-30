"use client";

import { useEffect, useRef, useState } from "react";
import type { Subject, Theme } from "@/lib/types";
import { BookVisual, landingRect, type BookPagePreview, type BookRect } from "./BookVisual";

/** The zoom-out runs first, then the cover closes and the book flies home. */
const ZOOM_OUT_MS = 650;
/** Let the library mount behind the veil after the page has shrunk. */
const NAVIGATE_AT = 720;
/** Cover close finishes before the flight starts. */
const FLY_AT = 1000;
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
  const [closingStart] = useState(() => {
    const shell = document.querySelector<HTMLElement>(".desk .book-shell");
    if (!shell) return null;

    const page = document.querySelector<HTMLElement>(
      ".desk .book-page-stack > .book-page",
    );
    const rect = shell.getBoundingClientRect();
    if (rect.width === 0 || to.width === 0) return null;

    const scale = rect.width / to.width;
    return {
      transform: `translate(${
        rect.left + rect.width / 2 - (to.left + to.width / 2)
      }px, ${rect.top - to.top}px) scale(${scale})`,
      previewScale: to.width / rect.width,
      pageWidth: page && page.clientWidth > 0 ? page.clientWidth : undefined,
    };
  });
  const [modelTransform, setModelTransform] = useState(
    closingStart?.transform ?? "none",
  );
  const [zoomedOut, setZoomedOut] = useState(!closingStart);
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
    if (!closingStart) return;

    const frame = window.requestAnimationFrame(() => setModelTransform("none"));
    const timer = window.setTimeout(() => setZoomedOut(true), ZOOM_OUT_MS);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [closingStart]);

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
      previewScale={closingStart?.previewScale}
      pageWidth={closingStart?.pageWidth}
      sceneClass={`book-close-scene ${
        closingStart && !zoomedOut ? "is-zooming-out" : ""
      }`}
      veilClass={`book-close-veil ${revealing ? "is-revealing" : ""}`}
      flyClass={`book-fly--closing ${flying ? "is-flying" : ""} ${
        closingStart && !zoomedOut ? "is-flat" : ""
      }`}
      zoomTransform={closingStart ? modelTransform : undefined}
      zoomOrigin={closingStart ? "50% 0%" : undefined}
      style={
        {
          "--to-top": `${to.top}px`,
          "--to-left": `${to.left}px`,
          "--to-w": `${to.width}px`,
          "--to-h": `${to.height}px`,
          "--fly-from-x": `${
            target.left + target.width / 2 - (to.left + to.width / 2)
          }px`,
          "--fly-from-y": `${
            target.top + target.height / 2 - (to.top + to.height / 2)
          }px`,
          "--fly-from-sx": target.width / to.width,
          "--fly-from-sy": target.height / to.height,
        } as React.CSSProperties
      }
    />
  );
}
