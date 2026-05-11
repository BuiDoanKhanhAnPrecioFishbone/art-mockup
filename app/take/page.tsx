"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateIllustration, TakeShell } from "@/widgets/take-shell";
import { cn } from "@/shared/lib/cn";

interface DemoSession {
  id: string;
  accessCode: string;
  type: "Public" | "Private" | "Private Onsite";
  status: "Upcoming" | "Active" | "Closing" | "Completed" | "Cancelled";
  name: string;
  testTitle: string | null;
}

const STATUS_TONE: Record<DemoSession["status"], string> = {
  Upcoming: "bg-amber-100 text-amber-700",
  Active: "bg-emerald-100 text-emerald-700",
  Closing: "bg-sky-100 text-sky-700",
  Completed: "bg-gray-200 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

/** Candidate Test Entry — wireframe nodes 2435:75466 (Public) and
 *  2435:75308 (Private). The form starts in "Public" shape with Name +
 *  Email + Private Code; once the access code resolves to a Private /
 *  Onsite session, the Name field is hidden on subsequent attempts in
 *  the same browser tab to mimic a logged-in candidate. */
export default function TakeEntryPage() {
  const router = useRouter();
  const [name, setName] = useState("Thai Son");
  const [email, setEmail] = useState("tranlethaison@gmail.com");
  // Pre-filled with `9876cz` — the seeded Active Public session
  // (sess-3) so the demo "Continue" button works out of the box.
  // The Demo helper below lets the viewer pick another code.
  const [code, setCode] = useState("9876cz");
  const [variant, setVariant] = useState<"Public" | "Private">("Public");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoSessions, setDemoSessions] = useState<DemoSession[]>([]);

  useEffect(() => {
    fetch("/api/take/demo-sessions")
      .then((r) => r.json())
      .then((d) => setDemoSessions(d.sessions ?? []))
      .catch(() => setDemoSessions([]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/take/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      // Cache the candidate identity for the rest of the flow so the
      // overview can greet them by name.
      try {
        window.localStorage.setItem(
          `take:${data.sessionId}:candidate`,
          JSON.stringify({ name: name || "Candidate", email })
        );
      } catch {}
      router.push(`/take/${data.sessionId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TakeShell
      badge={
        <>
          <span className="text-gray-500">Deadline</span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-800">
            07/02/2026, 02:00
          </span>
        </>
      }
      title={
        variant === "Public"
          ? "Software Engineer Public Test"
          : "Software Engineer Intern Test"
      }
    >
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: illustration */}
          <div className="hidden items-center justify-center p-8 md:flex">
            <div className="h-64 w-full max-w-sm">
              <CandidateIllustration />
            </div>
          </div>

          {/* Right: form */}
          <form onSubmit={submit} className="p-8">
            <h2 className="text-2xl font-semibold text-violet-600">
              Test Access
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Please provide your details before starting the test.
            </p>

            {/* The Name field is the only difference between the Public
             *  and Private variants of this form. */}
            {variant === "Public" && (
              <Field label="Name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  required
                />
              </Field>
            )}

            <Field label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                required
              />
            </Field>

            <Field label="Private Code" required>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-mono focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                required
              />
            </Field>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-md bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              {submitting ? "Verifying…" : "Continue"}
            </button>

            {/* Demo helper: switch the form between Public / Private to
             *  match either wireframe variant. Not in the real product. */}
            <p className="mt-4 text-center text-[11px] text-gray-400">
              Demo only ·{" "}
              <button
                type="button"
                onClick={() =>
                  setVariant((v) => (v === "Public" ? "Private" : "Public"))
                }
                className="underline hover:text-gray-600"
              >
                Switch to {variant === "Public" ? "Private" : "Public"} form
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Demo helper — lists every seeded access code with its status
       *  so the demo viewer can pick one without guessing. Click a row
       *  to pre-fill the Code field above; only sessions in `Active`
       *  status will let you continue past the Test Overview screen. */}
      {demoSessions.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-dashed border-violet-200 bg-violet-50/30">
          <div className="flex items-center justify-between gap-2 border-b border-violet-100 px-4 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
              Demo helper · sample access codes
            </p>
            <p className="text-[11px] text-gray-500">
              Click a row to pre-fill the form
            </p>
          </div>
          <ul className="divide-y divide-violet-100">
            {demoSessions.map((s) => {
              const active = s.accessCode === code;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCode(s.accessCode);
                      setError(null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors",
                      active
                        ? "bg-violet-100 text-violet-800"
                        : "hover:bg-violet-50/60"
                    )}
                  >
                    <span className="font-mono text-[11px] font-semibold text-gray-900">
                      {s.accessCode}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium",
                        STATUS_TONE[s.status]
                      )}
                    >
                      {s.status}
                    </span>
                    <span className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-600">
                      {s.type}
                    </span>
                    <span className="ml-auto truncate text-[11px] text-gray-500">
                      {s.testTitle ?? s.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-violet-100 px-4 py-2 text-[10px] text-gray-500">
            Tip: pick a code with the green <strong>Active</strong> tag —
            other states route to the &ldquo;Inactive Test&rdquo; overview
            (intentional for demoing those states).
          </p>
        </div>
      )}
    </TakeShell>
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
    <div className="mt-4">
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label} {required && <span className="text-violet-600">*</span>}
      </label>
      {children}
    </div>
  );
}
