"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type SettingsWarningTone = "info" | "warning" | "danger";

const TONE_STYLES: Record<
  SettingsWarningTone,
  { wrapper: string; iconWrapper: string; icon: typeof Info; title: string }
> = {
  info: {
    wrapper: "border-violet-200 bg-violet-50/60",
    iconWrapper: "bg-violet-100 text-violet-700",
    icon: Info,
    title: "text-violet-800",
  },
  warning: {
    wrapper: "border-amber-200 bg-amber-50/70",
    iconWrapper: "bg-amber-100 text-amber-700",
    icon: AlertTriangle,
    title: "text-amber-800",
  },
  danger: {
    wrapper: "border-red-200 bg-red-50/70",
    iconWrapper: "bg-red-100 text-red-700",
    icon: ShieldAlert,
    title: "text-red-800",
  },
};

/** Per-tab warning banner used at the top of every Program Settings
 *  sub-tab. Surfaces the immutability + impact rules from the
 *  business doc (`docs/requirements/03-program-setup.md` and
 *  `docs/requirements/07-sessions.md` §7.6) so HR understands the
 *  blast radius of edits before they touch a field. */
export function SettingsWarning({
  tone = "info",
  title,
  body,
  bullets,
  className,
}: {
  tone?: SettingsWarningTone;
  title: string;
  body?: React.ReactNode;
  /** Optional list of consequences / call-out lines. */
  bullets?: React.ReactNode[];
  className?: string;
}) {
  const styles = TONE_STYLES[tone];
  const Icon = styles.icon;
  return (
    <div
      className={cn(
        "mb-4 flex items-start gap-3 rounded-lg border p-3",
        styles.wrapper,
        className
      )}
      role="note"
    >
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full",
          styles.iconWrapper
        )}
      >
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", styles.title)}>{title}</p>
        {body && (
          <p className="mt-1 text-xs leading-relaxed text-gray-700">{body}</p>
        )}
        {bullets && bullets.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-xs text-gray-700">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
