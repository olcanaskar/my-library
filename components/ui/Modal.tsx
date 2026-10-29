"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "./icons";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#160d04]/65 backdrop-blur-[3px] sm:items-center sm:p-6"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-[#b9a179] bg-[#f8f0dd] p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9),0_2px_0_rgba(0,0,0,0.12)] sm:rounded-2xl ${width}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#ddceb0] pb-3">
          <h2 className="font-serif text-[22px] leading-none font-semibold tracking-[0.14em] text-ink uppercase">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
