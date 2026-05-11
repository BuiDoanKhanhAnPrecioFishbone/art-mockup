"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Italic,
  Mail,
  MailOpen,
  MoreHorizontal,
  Paperclip,
  Plus,
  Reply,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  bucketThreadsByDirection,
  type CandidateEmailMessage,
  type CandidateEmailThread,
} from "@/entities/candidate";

type Bucket = "sent" | "inbox";

const SENDER_TONES = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-sky-500",
];

/** Emails tab — wireframe nodes 3228:225537 (empty), 3228:225544
 *  (Sent thread list + expanded), 3228:225551 (Inbox view). Splits
 *  the candidate's email threads into Sent / Inbox by the direction
 *  of the most-recent message and renders each thread as a
 *  collapsible card with a per-message accordion. */
export function EmailsTab({
  threads,
  candidateName,
  candidateEmail,
  onSaveThreads,
  saving,
  viewerMode = "hr",
}: {
  threads: CandidateEmailThread[];
  candidateName: string;
  candidateEmail: string;
  /** When `candidate`, hide outbound compose ("Send Email" / empty
   *  state CTA) — candidates can read + reply but not initiate net-
   *  new HR threads. Reply on existing messages stays available. */
  viewerMode?: "hr" | "candidate";
  onSaveThreads: (next: CandidateEmailThread[]) => void;
  saving: boolean;
}) {
  // Candidates land on the Inbox bucket — that's where HR-sent
  // messages they need to reply to live (the wireframe's "received"
  // bucket from their POV). HR users still default to Sent.
  const [bucket, setBucket] = useState<Bucket>(
    viewerMode === "candidate" ? "inbox" : "sent"
  );
  const [composing, setComposing] = useState(false);
  /** Map of threadId → expanded state. Default = collapsed. */
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);

  const canCompose = viewerMode !== "candidate";
  const grouped = useMemo(() => bucketThreadsByDirection(threads), [threads]);
  const visible = bucket === "sent" ? grouped.sent : grouped.inbox;

  // Auto-expand the first thread when switching buckets, so the
  // operator always sees content without an extra click.
  useEffect(() => {
    setExpandedThreadId(visible[0]?.id ?? null);
  }, [bucket, visible.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (threads.length === 0) {
    return (
      <EmptyState
        canCompose={canCompose}
        onSendNew={() => setComposing(true)}
        composing={composing}
        onCloseCompose={() => setComposing(false)}
        candidateEmail={candidateEmail}
        onSend={(msg) => {
          const newThread: CandidateEmailThread = {
            id: `thr-${Date.now()}`,
            subject: msg.subject || "(no subject)",
            messages: [
              {
                id: `msg-${Date.now()}`,
                from: "you@art.com",
                to: [candidateEmail],
                sentAtISO: new Date().toISOString(),
                direction: "sent",
                body: msg.body,
              },
            ],
          };
          onSaveThreads([newThread]);
          setComposing(false);
        }}
      />
    );
  }

  function postReply(threadId: string, body: string) {
    const next = threads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            messages: [
              ...t.messages,
              {
                id: `msg-${Date.now()}`,
                from: "you@art.com",
                to: [candidateEmail],
                sentAtISO: new Date().toISOString(),
                direction: "sent" as const,
                body,
              },
            ],
          }
        : t
    );
    onSaveThreads(next);
  }

  return (
    <div>
      {/* Toolbar — bucket toggle + count + Send Email */}
      <div className="mb-3 flex items-center gap-3">
        <h3 className="inline-flex items-center gap-1.5 text-base font-semibold text-violet-700">
          Emails
          <span
            title="Threads exchanged with this candidate"
            className="grid h-4 w-4 cursor-help place-items-center rounded-full bg-gray-200 text-[10px] text-gray-600"
          >
            ?
          </span>
        </h3>

        <div className="ml-auto flex items-center gap-2">
          <BucketToggle
            bucket={bucket}
            onChange={setBucket}
            sentCount={grouped.sent.length}
            inboxCount={grouped.inbox.length}
          />
          {saving && (
            <span className="text-xs text-gray-400">Saving…</span>
          )}
          {canCompose && (
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
            >
              <Send size={11} /> Send Email
            </button>
          )}
        </div>
      </div>

      {/* Thread list */}
      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          No {bucket === "sent" ? "outbound" : "incoming"} emails yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              expanded={expandedThreadId === thread.id}
              onToggle={() =>
                setExpandedThreadId((cur) =>
                  cur === thread.id ? null : thread.id
                )
              }
              candidateName={candidateName}
              candidateEmail={candidateEmail}
              onReply={(body) => postReply(thread.id, body)}
            />
          ))}
        </ul>
      )}

      {/* Compose new email modal */}
      {composing && (
        <ComposeModal
          candidateEmail={candidateEmail}
          onClose={() => setComposing(false)}
          onSend={(msg) => {
            const newThread: CandidateEmailThread = {
              id: `thr-${Date.now()}`,
              subject: msg.subject || "(no subject)",
              messages: [
                {
                  id: `msg-${Date.now()}`,
                  from: "you@art.com",
                  to: [candidateEmail],
                  sentAtISO: new Date().toISOString(),
                  direction: "sent",
                  body: msg.body,
                },
              ],
            };
            onSaveThreads([newThread, ...threads]);
            setComposing(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Bucket toggle ---------- */

function BucketToggle({
  bucket,
  onChange,
  sentCount,
  inboxCount,
}: {
  bucket: Bucket;
  onChange: (b: Bucket) => void;
  sentCount: number;
  inboxCount: number;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-gray-200 bg-white text-xs">
      <button
        type="button"
        onClick={() => onChange("sent")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5",
          bucket === "sent"
            ? "bg-violet-50 font-medium text-violet-700"
            : "text-gray-600 hover:bg-gray-50"
        )}
      >
        <MailOpen size={12} /> Sent
        <span className="rounded bg-gray-100 px-1 text-[10px] tabular-nums text-gray-700">
          {sentCount}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange("inbox")}
        className={cn(
          "inline-flex items-center gap-1.5 border-l border-gray-200 px-3 py-1.5",
          bucket === "inbox"
            ? "bg-violet-50 font-medium text-violet-700"
            : "text-gray-600 hover:bg-gray-50"
        )}
      >
        <Mail size={12} /> Inbox
        <span className="rounded bg-gray-100 px-1 text-[10px] tabular-nums text-gray-700">
          {inboxCount}
        </span>
      </button>
    </div>
  );
}

/* ---------- Thread card ---------- */

function ThreadCard({
  thread,
  expanded,
  onToggle,
  candidateName,
  candidateEmail,
  onReply,
}: {
  thread: CandidateEmailThread;
  expanded: boolean;
  onToggle: () => void;
  candidateName: string;
  candidateEmail: string;
  onReply: (body: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const last = thread.messages[thread.messages.length - 1];

  // Wireframe: only show the last message expanded by default and
  // collapse older ones into "...Show N previous messages".
  const hidden = !showAll && thread.messages.length > 1;
  const visibleMessages = hidden
    ? thread.messages.slice(-1)
    : thread.messages;

  return (
    <li className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Subject row */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gray-300 text-gray-400">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {thread.contextLabel && (
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">
            {thread.contextLabel}
            {thread.contextHref && <ExternalLink size={10} />}
          </span>
        )}
        <span className="flex-1 truncate text-sm font-medium text-gray-900">
          {thread.subject}
        </span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-gray-600">
          {thread.messages.length}
        </span>
        <span className="text-[11px] text-gray-400">
          {formatStamp(last?.sentAtISO ?? "")}
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-gray-100">
          {hidden && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="block w-full bg-gray-50 px-4 py-2 text-center text-xs font-medium text-gray-500 hover:bg-gray-100"
            >
              … Show {thread.messages.length - 1} previous messages
            </button>
          )}
          {visibleMessages.map((msg, i) => (
            <MessageCard
              key={msg.id}
              message={msg}
              isLast={i === visibleMessages.length - 1}
              onReply={onReply}
              candidateName={candidateName}
              candidateEmail={candidateEmail}
            />
          ))}
        </div>
      )}
    </li>
  );
}

/* ---------- Single message ---------- */

function MessageCard({
  message,
  isLast,
  onReply,
  candidateName,
  candidateEmail,
}: {
  message: CandidateEmailMessage;
  isLast: boolean;
  onReply: (body: string) => void;
  candidateName: string;
  candidateEmail: string;
}) {
  const [showFull, setShowFull] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const idx =
    Math.abs(
      message.from.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    ) % SENDER_TONES.length;
  const initials = message.from.slice(0, 2).toUpperCase();
  const lines = message.body.split("\n");
  const truncated = lines.length > 6 && !showFull;
  const shown = truncated ? lines.slice(0, 5).join("\n") + "…" : message.body;

  return (
    <article className="border-t border-gray-100 px-5 py-4 first:border-t-0">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white",
            SENDER_TONES[idx]
          )}
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-900">
            {message.from}
            {message.fromVia && (
              <span className="text-gray-500"> (via {message.fromVia})</span>
            )}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            to {message.to.join(", ")}
            {message.cc && message.cc.length > 0 && (
              <> · cc {message.cc.join(", ")}</>
            )}
            {message.bcc && message.bcc.length > 0 && (
              <> · bcc {message.bcc.join(", ")}</>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[11px] text-gray-500">
          <span>{formatStamp(message.sentAtISO)}</span>
          <button
            type="button"
            title="More"
            className="rounded p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mt-3 pl-10">
        <p className="whitespace-pre-line text-sm text-gray-700">{shown}</p>
        {truncated && (
          <button
            type="button"
            onClick={() => setShowFull(true)}
            className="mt-1 text-xs font-medium text-violet-600 hover:text-violet-800"
          >
            Show More
          </button>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {message.attachments.map((a) => (
              <AttachmentChip key={a.name} attachment={a} />
            ))}
          </div>
        )}

        {/* Reply controls — only on the last (newest) message */}
        {isLast && (
          <div className="mt-4 flex items-center justify-end">
            <div className="inline-flex overflow-hidden rounded-md border border-gray-200">
              <button
                type="button"
                onClick={() => setReplyOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Reply size={11} />
                Reply
              </button>
              <button
                type="button"
                onClick={() => setReplyOpen(true)}
                title="Reply All"
                className="border-l border-gray-200 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                <ChevronDown size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Inline reply composer */}
        {isLast && replyOpen && (
          <ReplyComposer
            candidateName={candidateName}
            candidateEmail={candidateEmail}
            onClose={() => setReplyOpen(false)}
            onSend={(body) => {
              onReply(body);
              setReplyOpen(false);
            }}
          />
        )}
      </div>
    </article>
  );
}

/* ---------- Attachment chip ---------- */

function AttachmentChip({
  attachment,
}: {
  attachment: { name: string; size: string; type?: string };
}) {
  const ext = (attachment.name.split(".").pop() ?? "").toUpperCase();
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 hover:border-violet-300 hover:bg-violet-50/40"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-red-50 text-[9px] font-bold text-red-600">
        {ext || <Paperclip size={11} />}
      </span>
      <span className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-900">
          {attachment.name}
        </p>
        <p className="text-[11px] text-gray-500">{attachment.size}</p>
      </span>
    </a>
  );
}

/* ---------- Inline reply composer ---------- */

function ReplyComposer({
  candidateName,
  candidateEmail,
  onClose,
  onSend,
}: {
  candidateName: string;
  candidateEmail: string;
  onClose: () => void;
  onSend: (body: string) => void;
}) {
  const [body, setBody] = useState("");
  const [template, setTemplate] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="mt-3 overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-xs">
        <span className="text-gray-500">to {candidateEmail}</span>
        <button
          type="button"
          className="text-violet-600 hover:text-violet-800"
        >
          +CC, BCC
        </button>
      </div>

      <textarea
        ref={ref}
        rows={5}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Hi ${candidateName.split(" ")[0]},\n\n…`}
        className="block w-full resize-y px-3 py-2 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none"
      />

      {/* Format toolbar */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-3 py-2 text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <button
            type="button"
            title="Bold"
            className="rounded p-1 hover:bg-white hover:text-gray-800"
          >
            <Bold size={12} />
          </button>
          <button
            type="button"
            title="Italic"
            className="rounded p-1 hover:bg-white hover:text-gray-800"
          >
            <Italic size={12} />
          </button>
          <button
            type="button"
            title="Attach"
            className="inline-flex items-center gap-1 rounded p-1 hover:bg-white hover:text-gray-800"
          >
            <Paperclip size={12} /> Attach Files
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1 text-gray-500">
            Template
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="rounded border border-gray-200 bg-white px-2 py-0.5 text-xs"
            >
              <option value="">Please Select</option>
              <option>Test Invitation</option>
              <option>Interview Confirmation</option>
              <option>Offer Letter</option>
            </select>
          </label>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSend(body)}
            disabled={!body.trim()}
            className="rounded-md bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700 disabled:bg-violet-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */

function EmptyState({
  canCompose,
  onSendNew,
  composing,
  candidateEmail,
  onCloseCompose,
  onSend,
}: {
  canCompose: boolean;
  onSendNew: () => void;
  composing: boolean;
  candidateEmail: string;
  onCloseCompose: () => void;
  onSend: (msg: { subject: string; body: string }) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
      <ConfettiIllustration />
      <p className="mt-4 text-base font-semibold text-gray-800">
        The Email log is empty
      </p>
      <p className="mx-auto mt-1 max-w-md text-xs text-gray-500">
        {canCompose
          ? "You and the candidate have not exchanged any content via email. Start by sending the first notification or invitation letter."
          : "Your recruiter hasn't sent you any emails yet. New invitations and updates will land here automatically."}
      </p>
      {canCompose && (
        <button
          type="button"
          onClick={onSendNew}
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={13} /> Send New Emails
        </button>
      )}

      {composing && canCompose && (
        <ComposeModal
          candidateEmail={candidateEmail}
          onClose={onCloseCompose}
          onSend={onSend}
        />
      )}
    </div>
  );
}

function ConfettiIllustration() {
  // Wireframe-fidelity stand-in for the empty-state illustration.
  return (
    <svg
      viewBox="0 0 220 130"
      className="mx-auto h-32 w-auto"
      aria-hidden
    >
      {/* Stars / confetti */}
      <polygon
        points="20,75 24,82 32,82 26,87 28,95 20,90 12,95 14,87 8,82 16,82"
        fill="#fde68a"
      />
      <polygon
        points="40,55 43,60 48,60 44,63 45,68 40,65 35,68 36,63 32,60 37,60"
        fill="#c4b5fd"
      />
      <polygon
        points="190,80 194,87 202,87 196,92 198,100 190,95 182,100 184,92 178,87 186,87"
        fill="#fbcfe8"
      />
      {/* Envelope */}
      <rect
        x="80"
        y="50"
        width="80"
        height="55"
        rx="4"
        fill="#fff"
        stroke="#c4b5fd"
        strokeWidth={2}
      />
      <polyline
        points="80,52 120,80 160,52"
        fill="none"
        stroke="#7c3aed"
        strokeWidth={2}
      />
      {/* Letter triangle */}
      <polygon
        points="80,105 120,82 160,105"
        fill="#7c3aed"
        opacity={0.85}
      />
    </svg>
  );
}

/* ---------- Compose modal ---------- */

function ComposeModal({
  candidateEmail,
  onClose,
  onSend,
}: {
  candidateEmail: string;
  onClose: () => void;
  onSend: (msg: { subject: string; body: string }) => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">
            New Email
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <div className="grid grid-cols-[80px_1fr] items-center gap-2">
            <label className="text-xs font-medium text-gray-500">To</label>
            <input
              type="email"
              value={candidateEmail}
              readOnly
              className="block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            />
            <label className="text-xs font-medium text-gray-500">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this email about?"
              className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Compose your message…"
            className="block w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!subject.trim() || !body.trim()}
            onClick={() => onSend({ subject, body })}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:bg-violet-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time}, ${date}`;
}
