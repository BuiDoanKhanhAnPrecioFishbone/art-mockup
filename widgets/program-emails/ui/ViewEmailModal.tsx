"use client";

import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Link2,
  Mail,
  Reply,
  XCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  sendTypeLabel,
  totalRecipients,
  type ProgramEmail,
} from "@/entities/program-email";
import { ModalShell, formatSentAt } from "./pieces";

export function ViewEmailModal({
  email,
  onClose,
}: {
  email: ProgramEmail;
  onClose: () => void;
}) {
  const total = totalRecipients(email);
  const previewRecipients = email.recipients.slice(0, 4);
  const remaining = email.recipients.length - previewRecipients.length;

  return (
    <ModalShell
      title="Email log"
      subtitle={email.logName}
      onClose={onClose}
      width="max-w-3xl"
      footer={
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      }
    >
      <div className="space-y-5 p-5">
        {/* Summary */}
        <header className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Subject
          </p>
          <p className="mt-0.5 text-base font-semibold text-gray-900">
            {email.subject}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <Item label="Type" value={sendTypeLabel(email)} />
            <Item label="From" value={email.fromEmail} mono />
            <Item label="Sent at" value={formatSentAt(email.sentAtISO)} />
            <Item
              label="Stage / Step"
              value={
                email.stageName && email.stepName
                  ? `${email.stageName} · ${email.stepName}`
                  : "— (cross-stage send)"
              }
            />
            {email.scheduledForISO && (
              <Item
                label="Scheduled for"
                value={formatSentAt(email.scheduledForISO)}
              />
            )}
          </div>
        </header>

        {/* Delivery */}
        <Section icon={<CheckCircle2 size={14} />} title="Delivery">
          <div className="grid grid-cols-3 gap-3">
            <DeliveryStat
              label="Delivered"
              value={email.delivery.delivered}
              total={total}
              tone="green"
            />
            <DeliveryStat
              label="Skipped"
              value={email.delivery.skipped}
              total={total}
              tone="amber"
            />
            <DeliveryStat
              label="Failed"
              value={email.delivery.failed}
              total={total}
              tone="red"
            />
          </div>
        </Section>

        {/* Performance */}
        <Section icon={<Eye size={14} />} title="Performance">
          {Object.keys(email.performance).length === 0 ? (
            <p className="text-xs text-gray-500">
              Tracking was disabled for this send — no performance metrics
              recorded.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {email.performance.openRate !== undefined && (
                <PerfStat
                  icon={<Eye size={13} />}
                  label="Open Rate"
                  value={`${email.performance.openRate}%`}
                />
              )}
              {email.performance.replyRate !== undefined && (
                <PerfStat
                  icon={<Reply size={13} />}
                  label="Reply Rate"
                  value={`${email.performance.replyRate}%`}
                />
              )}
              {email.performance.clickRate !== undefined && (
                <PerfStat
                  icon={<Link2 size={13} />}
                  label="Click Rate"
                  value={`${email.performance.clickRate}%`}
                />
              )}
            </div>
          )}
        </Section>

        {/* Recipients */}
        <Section
          icon={<Mail size={14} />}
          title={`Recipients (${email.recipients.length})`}
        >
          <ul className="space-y-1.5">
            {previewRecipients.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-1.5 text-xs"
              >
                <span className="font-medium text-gray-900">{r.name}</span>
                <span className="text-gray-500">{r.email}</span>
              </li>
            ))}
          </ul>
          {remaining > 0 && (
            <p className="text-[11px] text-gray-500">
              + {remaining} more recipient{remaining === 1 ? "" : "s"}
            </p>
          )}
        </Section>

        {/* Body */}
        <Section icon={<FileText size={14} />} title="Body">
          <pre className="whitespace-pre-wrap rounded-lg border border-gray-100 bg-white p-3 text-xs text-gray-800">
            {email.body || "(no body)"}
          </pre>
        </Section>

        {/* Tracking + scheduling banner */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <TrackChip on={email.tracking.trackOpens} label="Track Opens" />
          <TrackChip on={email.tracking.trackReplies} label="Track Replies" />
          <TrackChip on={email.tracking.trackClicks} label="Track Clicks" />
          {email.scheduledForISO && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 font-medium text-violet-700">
              <Clock size={11} />
              Scheduled
            </span>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function Item({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-gray-800",
          mono && "font-mono text-[11px]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h4 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  );
}

function DeliveryStat({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "green" | "amber" | "red";
}) {
  const colors =
    tone === "green"
      ? "bg-green-50 border-green-200 text-green-700"
      : tone === "amber"
        ? "bg-amber-50 border-amber-200 text-amber-700"
        : "bg-red-50 border-red-200 text-red-700";
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={cn("rounded-lg border p-3 text-center", colors)}>
      <p className="text-2xl font-bold leading-tight">{value}</p>
      <p className="text-[11px] font-semibold">{label}</p>
      <p className="text-[10px] opacity-70">{pct}%</p>
    </div>
  );
}

function PerfStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TrackChip({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
        on ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      )}
    >
      {on ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
      {label}
    </span>
  );
}

