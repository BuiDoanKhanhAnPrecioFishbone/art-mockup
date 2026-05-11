"use client";

import { REVIEWERS } from "@/shared/fixtures/reviewers";
import { cn } from "@/shared/lib/cn";

const AVATAR_TONES = [
  "bg-pink-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
];

/** Stack of coloured circle avatars + reviewer initials. Used in the
 *  step header on the Pipeline & Review tab + everywhere a reviewer
 *  list needs a compact representation. */
export function ReviewerAvatars({
  reviewerIds,
  size = "sm",
  max = 6,
}: {
  reviewerIds: string[];
  size?: "sm" | "md";
  max?: number;
}) {
  const visible = reviewerIds.slice(0, max);
  const overflow = reviewerIds.length - visible.length;
  const dim = size === "md" ? "h-7 w-7 text-[11px]" : "h-6 w-6 text-[10px]";
  return (
    <div className="flex -space-x-1.5">
      {visible.map((id, i) => {
        const reviewer = REVIEWERS.find((r) => r.id === id);
        const label = reviewer
          ? reviewer.name
              .split(/\s+/)
              .map((p) => p[0]?.toUpperCase() ?? "")
              .slice(0, 2)
              .join("")
          : id.slice(0, 2).toUpperCase();
        return (
          <span
            key={id}
            title={reviewer?.name ?? id}
            className={cn(
              "inline-flex items-center justify-center rounded-full border-2 border-white font-semibold text-white",
              dim,
              AVATAR_TONES[i % AVATAR_TONES.length]
            )}
          >
            {label}
          </span>
        );
      })}
      {overflow > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full border-2 border-white bg-gray-300 font-semibold text-gray-700",
            dim
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

/** Inline single-reviewer chip (avatar + email + timestamp). Used as
 *  the header row of every review entry. */
export function ReviewerChip({
  reviewerId,
  email,
  timeLabel,
  edited,
}: {
  reviewerId: string;
  email: string;
  timeLabel: string;
  edited?: boolean;
}) {
  const idx =
    Math.abs(
      reviewerId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    ) % AVATAR_TONES.length;
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white",
          AVATAR_TONES[idx]
        )}
      >
        {initials}
      </span>
      <span className="text-xs font-medium text-gray-800">{email}</span>
      <span className="text-[11px] text-gray-400">· {timeLabel}</span>
      {edited && (
        <span className="text-[11px] text-violet-500 underline">Edited</span>
      )}
    </div>
  );
}
