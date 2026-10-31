"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  PAPERS,
  SUBJECT_COLORS,
  paperClass,
  type Paper,
  type Subject,
} from "@/lib/types";

type BookValues = {
  name: string;
  color: string;
  paper: Paper;
};

type BookDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  initial?: BookValues;
  onSubmit: (input: BookValues) => void;
};

/**
 * Shared book form. The modal is unmounted while closed, so the fields start
 * from the current book values every time the dialog opens.
 */
function BookDialog({
  open,
  onClose,
  title,
  submitLabel,
  initial,
  onSubmit,
}: BookDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <BookForm
        initial={initial}
        submitLabel={submitLabel}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function BookForm({
  initial,
  submitLabel,
  onClose,
  onSubmit,
}: {
  initial?: BookValues;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (input: BookValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState<string>(
    initial?.color ?? SUBJECT_COLORS[0],
  );
  const [paper, setPaper] = useState<Paper>(initial?.paper ?? "lined");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, color, paper });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="book-name"
          className="mb-1.5 block text-xs font-medium tracking-wide text-ink-soft uppercase"
        >
          Subject name
        </label>
        <input
          id="book-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Chemistry"
          autoFocus
          maxLength={40}
          className="w-full rounded-lg border border-rule bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
        />
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink-soft uppercase">
          Spine color
        </span>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColor(option)}
              aria-label={`Color ${option}`}
              aria-pressed={color === option}
              className={`h-8 w-8 rounded-full transition ${
                color === option
                  ? "ring-2 ring-ink ring-offset-2 ring-offset-[#f8f0dd]"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: option }}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink-soft uppercase">
          Notebook paper
        </span>
        <div className="grid grid-cols-2 gap-2">
          {PAPERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPaper(option.value)}
              aria-pressed={paper === option.value}
              className={`rounded-lg border p-2 text-left transition ${
                paper === option.value
                  ? "border-ink/50 bg-ink/5"
                  : "border-rule hover:border-ink/25"
              }`}
            >
              <span
                className={`block h-8 w-full rounded-sm border border-rule/70 ${paperClass(
                  option.value,
                )}`}
                aria-hidden="true"
              />
              <span className="mt-1.5 block text-xs font-medium">
                {option.label}
              </span>
              <span className="block text-[11px] text-ink-soft">
                {option.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-ink/5 hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

type NewBookDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: BookValues) => void;
};

export function NewBookDialog({
  open,
  onClose,
  onCreate,
}: NewBookDialogProps) {
  return (
    <BookDialog
      open={open}
      onClose={onClose}
      title="New book"
      submitLabel="Add to shelf"
      onSubmit={onCreate}
    />
  );
}

type EditBookDialogProps = {
  open: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSave: (input: BookValues) => void;
};

export function EditBookDialog({
  open,
  subject,
  onClose,
  onSave,
}: EditBookDialogProps) {
  return (
    <BookDialog
      open={open}
      onClose={onClose}
      title="Edit book"
      submitLabel="Save changes"
      initial={
        subject
          ? {
              name: subject.name,
              color: subject.color,
              paper: subject.paper,
            }
          : undefined
      }
      onSubmit={onSave}
    />
  );
}
