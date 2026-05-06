"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Bold,
  ChevronDown,
  ChevronRight,
  Clock,
  HelpCircle,
  Italic,
  List,
  Paperclip,
  Send,
  Sparkles,
  Underline,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import { emailAccounts } from "@/shared/fixtures/email-accounts";
import { emailTemplates } from "@/shared/fixtures/email-templates";
import type { Program } from "@/entities/program";
import type {
  EmailReceiverType,
  ProgramEmail,
  ProgramEmailRecipient,
} from "@/entities/program-email";
import {
  CandidatePickerModal,
  ReviewerPickerModal,
} from "./RecipientPickerModal";

interface Props {
  program: Program;
  /** When provided, pre-fills the receiver type — keeps the wireframe's
   *  "Send New Email to Reviewer" entry point without forcing a separate
   *  page implementation. Defaults to candidates. */
  initialReceiverType?: EmailReceiverType;
  onCancel: () => void;
  onSent: (email: ProgramEmail) => void;
}

export function NewEmailPage({
  program,
  initialReceiverType = "candidates",
  onCancel,
  onSent,
}: Props) {
  const { showToast } = useToast();
  const [logName, setLogName] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [showRecentMenu, setShowRecentMenu] = useState(false);

  // Email Setting
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [fromEmail, setFromEmail] = useState(emailAccounts[0]?.email ?? "");
  const [recipients, setRecipients] = useState<ProgramEmailRecipient[]>([]);
  const [receiverType, setReceiverType] =
    useState<EmailReceiverType>(initialReceiverType);
  const [stageInfo, setStageInfo] = useState<{
    stageId?: string;
    stepId?: string;
    stageName?: string;
    stepName?: string;
  }>({});
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [trackOpens, setTrackOpens] = useState(true);
  const [trackReplies, setTrackReplies] = useState(true);
  const [trackClicks, setTrackClicks] = useState(false);
  const [scheduleOn, setScheduleOn] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("10:20");

  // Email Content
  const [contentOpen, setContentOpen] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [signatureOn, setSignatureOn] = useState(true);
  const [attachments, setAttachments] = useState<
    { name: string; sizeKB: number }[]
  >([]);

  // Recipient picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Apply selected template
  function applyTemplate(id: string) {
    const tpl = emailTemplates.find((t) => t.id === id);
    if (!tpl) return;
    setTemplateId(id);
    setSubject(tpl.subject);
    setBody(tpl.body);
    if (!logName) setLogName(tpl.name);
  }

  const selectedTemplate = emailTemplates.find((t) => t.id === templateId);

  // Validation
  const valid =
    logName.trim().length > 0 &&
    subject.trim().length > 0 &&
    fromEmail.trim().length > 0 &&
    recipients.length > 0 &&
    body.trim().length > 0;

  async function handleSend() {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const sendType = recipients.length > 1 ? "bulk" : "single";
      const scheduledForISO =
        scheduleOn && scheduleDate
          ? new Date(`${scheduleDate}T${scheduleTime || "10:00"}`).toISOString()
          : undefined;
      const payload = {
        programId: program.id,
        logName: logName.trim(),
        subject: subject.trim(),
        body: signatureOn
          ? `${body}\n\n— Sent via ${program.title}`
          : body,
        sendType,
        receiverType,
        recipients,
        cc: cc.length ? cc : undefined,
        bcc: bcc.length ? bcc : undefined,
        fromEmail,
        stageId: stageInfo.stageId,
        stepId: stageInfo.stepId,
        stageName: stageInfo.stageName,
        stepName: stageInfo.stepName,
        templateId: templateId || undefined,
        scheduledForISO,
        tracking: { trackOpens, trackReplies, trackClicks },
        attachments: attachments.length ? attachments : undefined,
      };
      const res = await fetch("/api/program-emails", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error ?? "Could not send email.");
        return;
      }
      const { email } = (await res.json()) as { email: ProgramEmail };
      onSent(email);
    } finally {
      setSubmitting(false);
    }
  }

  function addMockAttachment() {
    setAttachments((prev) => [
      ...prev,
      { name: `attachment-${prev.length + 1}.pdf`, sizeKB: 850 + prev.length * 100 },
    ]);
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={14} />
            Back to Emails
          </button>
          <span className="h-4 w-px bg-gray-200" />
          <h2 className="text-base font-semibold text-gray-900">New Email</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!valid || submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={13} />
            {submitting
              ? "Sending…"
              : scheduleOn && scheduleDate
                ? "Schedule"
                : "Send"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        {/* Receiver type pill switch */}
        <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium">
          {(["candidates", "reviewers"] as EmailReceiverType[]).map((rt) => (
            <button
              key={rt}
              onClick={() => {
                setReceiverType(rt);
                setRecipients([]);
                setStageInfo({});
              }}
              className={cn(
                "rounded px-3 py-1 transition-colors",
                receiverType === rt
                  ? "bg-violet-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {rt === "candidates" ? "To Candidates" : "To Reviewers"}
            </button>
          ))}
        </div>

        {/* Log name */}
        <Field label="Log Send Name" required>
          <input
            value={logName}
            onChange={(e) => setLogName(e.target.value)}
            placeholder="e.g. Reviewer assignment — CV round"
            className="input"
          />
        </Field>

        {/* Template */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">
              Select Email Template
            </label>
            <div className="relative">
              <button
                onClick={() => setShowRecentMenu((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900"
              >
                <Clock size={11} />
                Use Recent Message
                <ChevronDown size={11} />
              </button>
              {showRecentMenu && (
                <ul className="absolute right-0 top-full z-10 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-1 text-xs shadow-lg">
                  {emailTemplates.slice(0, 5).map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => {
                          applyTemplate(t.id);
                          setShowRecentMenu(false);
                        }}
                        className="block w-full truncate px-3 py-1.5 text-left hover:bg-violet-50"
                      >
                        {t.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="relative">
            <select
              value={templateId}
              onChange={(e) => applyTemplate(e.target.value)}
              className="input appearance-none pr-8"
            >
              <option value="">Please Select</option>
              {emailTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
          {selectedTemplate && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-violet-700">
              <Sparkles size={11} />
              Template applied — subject &amp; body filled.
            </p>
          )}
        </div>

        {/* Email Setting */}
        <CollapsibleSection
          title="Email Setting"
          open={settingsOpen}
          onToggle={() => setSettingsOpen((v) => !v)}
        >
          <div className="space-y-3 px-4 pb-4">
            {/* From */}
            <Field label="From" required>
              <div className="relative">
                <select
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="input appearance-none pr-8"
                >
                  {emailAccounts
                    .filter((a) => a.status === "connected")
                    .map((a) => (
                      <option key={a.id} value={a.email}>
                        {a.email} ({a.provider})
                      </option>
                    ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </Field>

            {/* To */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
                To<span className="text-red-500">*</span>
                <span title="Pick the candidates or reviewers this email goes to.">
                  <HelpCircle size={11} className="text-gray-400" />
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5">
                {recipients.length === 0 ? (
                  <span className="text-xs text-gray-400">
                    No recipients selected
                  </span>
                ) : (
                  recipients.slice(0, 4).map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700"
                    >
                      {r.name}
                      <button
                        onClick={() =>
                          setRecipients((prev) =>
                            prev.filter((x) => x.id !== r.id)
                          )
                        }
                        className="opacity-60 hover:opacity-100"
                        aria-label={`Remove ${r.name}`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))
                )}
                {recipients.length > 4 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                    +{recipients.length - 4}
                  </span>
                )}
                <button
                  onClick={() => setPickerOpen(true)}
                  className="ml-auto inline-flex items-center gap-1 rounded bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100"
                >
                  <Send size={10} />
                  + Add{" "}
                  {receiverType === "reviewers" ? "Reviewers" : "Candidates"}
                </button>
              </div>
              {receiverType === "reviewers" && stageInfo.stepName && (
                <p className="mt-1 text-[11px] text-gray-500">
                  Step: {stageInfo.stageName} · {stageInfo.stepName}
                </p>
              )}
            </div>

            {/* CC / BCC */}
            <div className="flex flex-wrap items-start gap-3">
              {!showCc && (
                <button
                  onClick={() => setShowCc(true)}
                  className="text-xs font-medium text-gray-500 hover:text-violet-700"
                >
                  + CC
                </button>
              )}
              {!showBcc && (
                <button
                  onClick={() => setShowBcc(true)}
                  className="text-xs font-medium text-gray-500 hover:text-violet-700"
                >
                  + BCC
                </button>
              )}
            </div>
            {showCc && (
              <Field label="CC">
                <input
                  value={cc.join(", ")}
                  onChange={(e) =>
                    setCc(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="comma-separated emails"
                  className="input"
                />
              </Field>
            )}
            {showBcc && (
              <Field label="BCC">
                <input
                  value={bcc.join(", ")}
                  onChange={(e) =>
                    setBcc(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="comma-separated emails"
                  className="input"
                />
              </Field>
            )}

            {/* Tracking */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                Track Program Analytics
              </label>
              <div className="flex flex-wrap gap-3">
                <ToggleChip
                  on={trackOpens}
                  onChange={setTrackOpens}
                  label="Track Opens"
                />
                <ToggleChip
                  on={trackReplies}
                  onChange={setTrackReplies}
                  label="Track Replies"
                />
                <ToggleChip
                  on={trackClicks}
                  onChange={setTrackClicks}
                  label="Track Clicks"
                />
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-700">
                <ToggleSwitch on={scheduleOn} onChange={setScheduleOn} />
                Schedule Send
              </label>
              {scheduleOn && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="input"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Email Content */}
        <CollapsibleSection
          title="Email Content"
          open={contentOpen}
          onToggle={() => setContentOpen((v) => !v)}
        >
          <div className="space-y-3 px-4 pb-4">
            <Field label="Email Subject" required>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
                className="input"
              />
            </Field>
            <Field label="Email Body" required>
              <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
                <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1">
                  <ToolbarBtn label="Bold">
                    <Bold size={12} />
                  </ToolbarBtn>
                  <ToolbarBtn label="Italic">
                    <Italic size={12} />
                  </ToolbarBtn>
                  <ToolbarBtn label="Underline">
                    <Underline size={12} />
                  </ToolbarBtn>
                  <ToolbarBtn label="List">
                    <List size={12} />
                  </ToolbarBtn>
                  <span className="mx-1 h-4 w-px bg-gray-300" />
                  <button
                    onClick={addMockAttachment}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <Paperclip size={11} />
                    Attach Files
                  </button>
                  <span className="mx-1 h-4 w-px bg-gray-300" />
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-700">
                    <ToggleSwitch
                      on={signatureOn}
                      onChange={setSignatureOn}
                    />
                    Signature
                  </label>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={9}
                  placeholder="Write your message…"
                  className="block w-full resize-none border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0"
                />
              </div>
            </Field>
            {attachments.length > 0 && (
              <ul className="space-y-1">
                {attachments.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[11px]"
                  >
                    <Paperclip size={11} className="text-gray-500" />
                    <span className="font-medium text-gray-800">
                      {a.name}
                    </span>
                    <span className="text-gray-500">
                      {(a.sizeKB / 1024).toFixed(2)} MB
                    </span>
                    <button
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, j) => j !== i)
                        )
                      }
                      className="ml-auto text-gray-400 hover:text-red-600"
                      aria-label={`Remove ${a.name}`}
                    >
                      <X size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleSection>
      </div>

      {/* Recipient picker */}
      {pickerOpen &&
        (receiverType === "reviewers" ? (
          <ReviewerPickerModal
            program={program}
            initialIds={recipients
              .filter((r) => r.kind === "reviewers")
              .map((r) => r.id)}
            onClose={() => setPickerOpen(false)}
            onConfirm={(rs, info) => {
              setRecipients(rs);
              setStageInfo(info);
              setPickerOpen(false);
            }}
          />
        ) : (
          <CandidatePickerModal
            programId={program.id}
            initialIds={recipients
              .filter((r) => r.kind === "candidates")
              .map((r) => r.id)}
            onClose={() => setPickerOpen(false)}
            onConfirm={(rs) => {
              setRecipients(rs);
              setPickerOpen(false);
            }}
          />
        ))}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(209 213 219);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
        }
        :global(.input:focus) {
          border-color: rgb(139 92 246);
          outline: none;
        }
      `}</style>
    </div>
  );
}

/* ----------------------------------------------------------- */

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-2.5 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="pt-3">{children}</div>}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative inline-flex h-4 w-7 items-center rounded-full transition-colors",
        on ? "bg-violet-600" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "inline-block h-3 w-3 transform rounded-full bg-white shadow transition",
          on ? "translate-x-3.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function ToggleChip({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
        on
          ? "border-violet-300 bg-violet-50 text-violet-700"
          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-4 w-7 items-center rounded-full transition-colors",
          on ? "bg-violet-600" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "inline-block h-3 w-3 transform rounded-full bg-white shadow transition",
            on ? "translate-x-3.5" : "translate-x-0.5"
          )}
        />
      </span>
      {label}
    </button>
  );
}

function ToolbarBtn({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </button>
  );
}

