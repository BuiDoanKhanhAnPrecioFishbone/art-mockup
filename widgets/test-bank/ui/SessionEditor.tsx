"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  SESSION_STATUSES,
  SESSION_TYPES,
  joinDateTime,
  splitISODate,
  type SessionStatus,
  type SessionType,
  type Test,
  type TestSession,
} from "@/entities/test";

interface Props {
  /** Test the session belongs to. */
  testId: string;
}

/**
 * "Create new session" form — full-page, breadcrumb at top, two
 * grouped sections (General Information + Session Timing). Wireframe:
 * /yeSL6MIFGkCgOXqHOOBC3Z/?node-id=2868-143245
 */
export function SessionEditor({ testId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state — split start/end into date + time inputs per the design.
  const [name, setName] = useState("");
  const [boundTestId, setBoundTestId] = useState(testId);
  const [status, setStatus] = useState<SessionStatus>("Inactive");
  const [type, setType] = useState<SessionType>("Public");
  const [refreshMinutes, setRefreshMinutes] = useState(0);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("08:30");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("08:30");

  useEffect(() => {
    Promise.all([
      fetch(`/api/tests/${testId}`).then((r) => r.json()),
      fetch(`/api/tests`).then((r) => r.json()),
    ])
      .then(([detail, listing]) => {
        const t = detail.test as Test | undefined;
        if (!t) {
          showToast("error", "Test not found.");
          router.push("/tests");
          return;
        }
        setTest(t);
        setTests(listing.tests ?? []);
        setName(`${t.title} – Recruitment Assessment`);
        setDescription(t.description ?? "");
        // Default window: tomorrow → +14 days, both at 08:30 local.
        const start = new Date(Date.now() + 24 * 3600 * 1000);
        const end = new Date(Date.now() + 14 * 24 * 3600 * 1000);
        const s = splitISODate(start.toISOString());
        const e = splitISODate(end.toISOString());
        setStartDate(s.date);
        setEndDate(e.date);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  if (loading || !test) {
    return (
      <div className="px-8 py-12 text-center text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  const valid =
    name.trim().length > 0 &&
    boundTestId &&
    !!startDate &&
    !!endDate &&
    refreshMinutes >= 0;

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const startISO = joinDateTime(startDate, startTime);
      const endISO = joinDateTime(endDate, endTime);
      const res = await fetch(`/api/tests/${boundTestId}/sessions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          status,
          type,
          description,
          refreshAccessCodeMinutes: refreshMinutes,
          startISO,
          endISO,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error ?? "Could not create session.");
        return;
      }
      const { session } = (await res.json()) as { session: TestSession };
      showToast("success", `Session created — code ${session.accessCode}.`);
      router.push(`/tests/${boundTestId}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-xs font-medium text-gray-500">
            <Link href="/tests" className="hover:text-gray-800">
              <span className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
                Test
              </span>
            </Link>
            <span>/</span>
            <Link
              href={`/tests/${test.id}`}
              className="text-gray-700 hover:text-gray-900"
            >
              {test.title}
            </Link>
            <span>/</span>
            <span className="text-violet-700">Create new session</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            Create new session
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            {description || test.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/tests/${testId}`}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={save}
            disabled={!valid || saving}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Form card */}
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6">
        {/* Section: General Information */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-violet-700">
            General Information
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Title" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Scientist Intern – Recruitment Assessment"
                className="input"
              />
            </Field>
            <Field label="Test" required>
              <SelectBox
                value={boundTestId}
                options={tests.map((t) => ({ value: t.id, label: t.title }))}
                onChange={setBoundTestId}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Status" required>
              <SelectBox
                value={status}
                options={SESSION_STATUSES.map((s) => ({
                  value: s,
                  label: s,
                }))}
                onChange={(v) => setStatus(v as SessionStatus)}
              />
            </Field>
            <Field label="Type" required>
              <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
                {SESSION_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      type === t
                        ? "bg-violet-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Refresh Access Code time (minutes)" required>
              <input
                type="number"
                min={0}
                value={refreshMinutes}
                onChange={(e) =>
                  setRefreshMinutes(
                    Math.max(0, Number(e.target.value) || 0)
                  )
                }
                className="input"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short context for the candidate landing page."
              className="input resize-none"
            />
          </Field>
        </section>

        {/* Section: Session Timing */}
        <section className="space-y-4 border-t border-gray-100 pt-6">
          <h2 className="text-base font-semibold text-violet-700">
            Session Timing
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Session Start Date (yy-mm-dd)" required>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Session Start Time (24h)" required>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Session End Date (yy-mm-dd)" required>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Session End Time (24h)" required>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input"
              />
            </Field>
          </div>
        </section>
      </div>

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

function SelectBox({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-violet-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}
