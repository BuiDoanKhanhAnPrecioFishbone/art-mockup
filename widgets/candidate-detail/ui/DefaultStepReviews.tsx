"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import type { StepReview } from "@/entities/candidate";
import { ReviewerChip } from "./ReviewerAvatars";

/** Default-step review block — wireframe `3228:224227`. List of
 *  per-reviewer notes with an inline edit/save flow on the current
 *  reviewer's row. */
export function DefaultStepReviews({
  reviews,
  currentReviewerId,
  isHr,
  onAddOrUpdate,
}: {
  reviews: StepReview[];
  currentReviewerId: string | null;
  isHr: boolean;
  /** Save (or update) a single review row. */
  onAddOrUpdate: (review: StepReview) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");

  // If the viewer is a Reviewer with no review yet, expose an inline
  // editor row at the bottom.
  const hasOwn =
    currentReviewerId !== null
      ? reviews.some((r) => r.reviewerId === currentReviewerId)
      : true;

  return (
    <div className="space-y-3">
      {reviews.length === 0 && hasOwn && (
        <p className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-500">
          No reviews yet.
        </p>
      )}

      {reviews.map((rv) => {
        const isEditing = editingId === rv.id;
        const ownRow = rv.reviewerId === currentReviewerId;
        const canEditRow = ownRow || isHr;

        return (
          <article
            key={rv.id}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <ReviewerChip
                reviewerId={rv.reviewerId}
                email={rv.reviewerEmail}
                timeLabel={formatTimeAgo(
                  rv.editedAtISO ?? rv.submittedAtISO
                )}
                edited={Boolean(rv.editedAtISO)}
              />
              {canEditRow && !isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(rv.id);
                    setDraftNote(rv.note);
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                >
                  <Edit3 size={13} />
                </button>
              )}
            </div>

            {isEditing ? (
              <>
                <textarea
                  rows={3}
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddOrUpdate({
                        ...rv,
                        note: draftNote,
                        editedAtISO: new Date().toISOString(),
                      });
                      setEditingId(null);
                    }}
                    className="rounded-md bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                {rv.note}
              </p>
            )}
          </article>
        );
      })}

      {/* New-review row for the current reviewer */}
      {!hasOwn && currentReviewerId && (
        <article className="rounded-lg border border-violet-200 bg-violet-50/40 px-4 py-3">
          <ReviewerChip
            reviewerId={currentReviewerId}
            email="you@art.com"
            timeLabel="Just now"
          />
          <textarea
            rows={3}
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Please Enter…"
            className="mt-2 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDraftNote("")}
              className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!draftNote.trim()}
              onClick={() =>
                onAddOrUpdate({
                  id: `rv-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 5)}`,
                  reviewerId: currentReviewerId,
                  reviewerEmail: "you@art.com",
                  submittedAtISO: new Date().toISOString(),
                  note: draftNote,
                })
              }
              className="rounded-md bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700 disabled:bg-violet-300"
            >
              Save
            </button>
          </div>
        </article>
      )}
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
