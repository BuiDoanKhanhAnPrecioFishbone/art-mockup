"use client";

import { AlertTriangle, X } from "lucide-react";

/** "Delete Skill (already rated)" confirmation — wireframe at the
 *  centre of the board. Used when the recruiter tries to remove a
 *  skill chip that already has a non-zero score. Generic delete
 *  confirms can call this with `subtitle` overrides. */
export function DeleteSkillConfirm({
  title = "Delete evaluated skill?",
  subtitle = "This skill has already been evaluated. Deleting it will permanently remove its current score too.",
  onConfirm,
  onClose,
}: {
  title?: string;
  subtitle?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle size={18} />
          </span>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
