"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  CandidateIllustration,
  TakeShell,
} from "@/widgets/take-shell";
import { cn } from "@/shared/lib/cn";
import type { Test, TestSession } from "@/entities/test";
import type { Question } from "@/entities/question";

/** Test Overview — wireframe nodes 2435:74998 (Ready) and 2435:75153
 *  (Inactive). Same layout in both states; the right-side card swaps
 *  out the badge tone, the disabled state of the Start button, and
 *  whether the candidate can tick the consent box. */
export default function TakeOverviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [candidate, setCandidate] = useState({ name: "", email: "" });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    fetch(`/api/take/${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        setSession(d.session ?? null);
        setTest(d.test ?? null);
        setQuestions(d.questions ?? []);
      })
      .finally(() => setLoading(false));
    try {
      const raw = window.localStorage.getItem(
        `take:${sessionId}:candidate`
      );
      if (raw) setCandidate(JSON.parse(raw));
    } catch {}
  }, [sessionId]);

  if (loading || !session || !test) {
    return (
      <TakeShell title="Loading test…">
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          Loading…
        </div>
      </TakeShell>
    );
  }

  /** Status mapping per wireframe: Active → "Ready to Start" purple
   *  badge + enabled Start button; everything else → grey "Inactive"
   *  badge + disabled Start button. */
  const isReady = session.status === "Active";
  const statusLabel = isReady ? "Ready to Start" : "Inactive";

  return (
    <TakeShell
      badge={
        <>
          <span className="text-gray-500">Test access</span>
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-medium",
              isReady
                ? "bg-violet-100 text-violet-700"
                : "bg-gray-200 text-gray-600"
            )}
          >
            {statusLabel}
          </span>
        </>
      }
      title={test.title}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
        {/* Left: Test overview */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">
            Test overview
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            You&rsquo;re about to start your test. Review the key details
            before you begin.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat label="Duration" value={`${test.durationMinutes} minutes`} />
            <Stat
              label="Deadline"
              value={formatDeadline(session.endISO)}
            />
          </div>

          <h3 className="mt-6 text-sm font-medium text-gray-700">
            Assessment rules
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <Bullet tone="violet">
              You may skip questions and return to them later during the test.
            </Bullet>
            <Bullet tone="violet">
              You may update your answers before final submission.
            </Bullet>
            <Bullet tone="violet">
              Final submission is allowed only once.
            </Bullet>
            <Bullet tone="red">
              <span className="text-red-600">
                Leaving the test tab, copying or pasting content, opening
                developer tools, or using multiple browser windows or
                monitors may be flagged by the system.
                <br />
                You may receive a warning if such activity is detected.
              </span>
            </Bullet>
          </ul>
        </div>

        {/* Right: Candidate identity + consent + Start */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mx-auto h-32 w-full max-w-[220px]">
            <CandidateIllustration />
          </div>

          <div className="mt-5 space-y-1.5 text-sm">
            <p>
              <span className="text-gray-500">Name : </span>
              <span className="font-medium text-gray-900">
                {candidate.name || "—"}
              </span>
            </p>
            <div className="flex items-center justify-between">
              <p>
                <span className="text-gray-500">Email : </span>
                <span className="font-medium text-gray-900">
                  {candidate.email || "—"}
                </span>
              </p>
              <button
                type="button"
                title="Change email"
                onClick={() => router.push("/take")}
                className="text-red-500 hover:text-red-600"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          <label
            className={cn(
              "mt-5 flex items-start gap-2 text-xs",
              isReady ? "text-gray-700" : "text-gray-400"
            )}
          >
            <input
              type="checkbox"
              checked={accepted}
              disabled={!isReady}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            I have read and understood the instructions.
          </label>

          <button
            type="button"
            disabled={!isReady || !accepted}
            onClick={() =>
              router.push(`/take/${sessionId}/run`)
            }
            className={cn(
              "mt-3 w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              isReady && accepted
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-gray-300 text-gray-500"
            )}
          >
            {isReady ? "Start Test" : "Inactive Test"}
          </button>

          <p className="sr-only">{questions.length} questions to answer.</p>
        </div>
      </div>
    </TakeShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 px-3 py-2.5">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function Bullet({
  tone,
  children,
}: {
  tone: "violet" | "red";
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={cn(
          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
          tone === "violet" ? "bg-violet-500" : "bg-red-500"
        )}
      />
      <span className="text-gray-700">{children}</span>
    </li>
  );
}

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}, ${hh}:${mi}`;
}
