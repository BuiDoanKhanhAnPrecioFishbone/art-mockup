"use client";

import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { EmailDelivery } from "@/entities/program-email";

/** Format like "Oct 15, 2025 - 10:32 AM" */
export function formatSentAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} - ${time}`;
}

/** Pretty pill for delivered / skipped / failed counts. */
export function DeliveryPills({ d }: { d: EmailDelivery }) {
  return (
    <div className="space-y-0.5 text-[11px]">
      <div className="text-green-700">
        Delivered: <span className="font-semibold">{d.delivered}</span>
      </div>
      <div className="text-amber-700">
        Skipped: <span className="font-semibold">{d.skipped}</span>
      </div>
      <div className="text-red-700">
        Failed: <span className="font-semibold">{d.failed}</span>
      </div>
    </div>
  );
}

/** Generic modal scaffolding shared by View / Recipient pickers. */
export function ModalShell({
  title,
  subtitle,
  onClose,
  footer,
  children,
  width = "max-w-xl",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={cn(
          "mx-4 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl",
          width
        )}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
