import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Wraps a candidate-facing screen with the centred max-width column,
 *  the title-card on top, and the main content card underneath. The
 *  Figma wireframe uses this card stack on every screen except the
 *  in-test runner. */
export function TakeShell({
  badge,
  badgeTone = "violet",
  title,
  children,
}: {
  /** Pre-title chip — e.g. "Deadline 07/02/2026, 02:00",
   *  "Test access" + "Ready to Start", "Test Acess" + "Finished". */
  badge?: ReactNode;
  badgeTone?: "violet" | "gray";
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Title card */}
      <div className="rounded-xl border border-gray-200 bg-white px-8 py-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            {badge && (
              <div
                className={cn(
                  "mb-2 inline-flex items-center gap-2 text-xs",
                  badgeTone === "violet" ? "text-gray-600" : "text-gray-600"
                )}
              >
                {badge}
              </div>
            )}
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
          <TakeBrand />
        </div>
      </div>

      {/* Body card */}
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** Precio Fishbone wordmark used in the top-right of the shell. */
export function TakeBrand() {
  return (
    <div className="flex shrink-0 items-center gap-1 leading-none">
      <span className="text-xl font-semibold text-gray-700">precio</span>
      <span className="text-xl font-semibold text-orange-500">f</span>
      <span className="text-xl font-semibold text-gray-700">ishbone</span>
    </div>
  );
}

/** Lightweight stand-in for the wireframe's purple "candidate at desk"
 *  illustration. Stylised SVG shapes that reproduce the silhouette
 *  without shipping a heavy raster asset. */
export function CandidateIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 220"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="180" rx="130" ry="14" fill="#e5e7eb" />
      {/* Monitor */}
      <rect x="36" y="32" width="140" height="88" rx="6" fill="#7c3aed" />
      <rect x="46" y="42" width="120" height="68" rx="4" fill="#fff" />
      <rect x="52" y="50" width="60" height="6" rx="3" fill="#c4b5fd" />
      <rect x="52" y="62" width="90" height="4" rx="2" fill="#ede9fe" />
      <rect x="52" y="70" width="74" height="4" rx="2" fill="#ede9fe" />
      <rect x="52" y="78" width="84" height="4" rx="2" fill="#ede9fe" />
      <rect x="80" y="120" width="52" height="6" fill="#5b21b6" />
      <rect x="60" y="126" width="92" height="4" fill="#3f1a8a" />
      {/* Person silhouette */}
      <circle cx="208" cy="86" r="22" fill="#1f2937" />
      <path
        d="M158 184 C 168 138 202 124 220 124 C 238 124 262 138 264 184 Z"
        fill="#5b21b6"
      />
      <path
        d="M186 122 C 198 110 232 110 244 122 L 240 144 L 192 144 Z"
        fill="#7c3aed"
      />
      {/* Laptop */}
      <rect x="240" y="140" width="56" height="32" rx="3" fill="#fde68a" />
      <rect x="246" y="146" width="44" height="20" fill="#1f2937" />
      <rect x="248" y="148" width="14" height="2" fill="#facc15" />
      <rect x="248" y="152" width="22" height="2" fill="#fde68a" />
      <rect x="248" y="156" width="20" height="2" fill="#fde68a" />
      {/* Mug */}
      <rect x="196" y="160" width="14" height="18" rx="2" fill="#1f2937" />
      <rect x="206" y="164" width="6" height="8" rx="2" fill="none" stroke="#1f2937" strokeWidth="2" />
      {/* Decorative blobs */}
      <circle cx="40" cy="180" r="14" fill="#fde68a" opacity="0.7" />
      <circle cx="48" cy="190" r="6" fill="#fbbf24" opacity="0.6" />
      <path
        d="M280 22 q 24 -6 32 14 q 6 22 -16 28 q -22 6 -22 -18 z"
        fill="#ede9fe"
      />
    </svg>
  );
}
