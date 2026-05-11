"use client";

import { useEffect, useState } from "react";
import { TestRunner } from "@/widgets/test-runner";
import type { Test, TestSession } from "@/entities/test";
import type { Question } from "@/entities/question";

/** Candidate Test Runner — wireframe nodes 2435:76737 / 2435:75777 /
 *  2435:75870 / 2435:76482. Loads the session + questions then hands
 *  everything to the TestRunner widget. */
export default function TakeRunPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
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
  }, [sessionId]);

  if (loading || !session || !test || !sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        Loading test…
      </div>
    );
  }

  return (
    <TestRunner
      sessionId={sessionId}
      session={session}
      test={test}
      questions={questions}
    />
  );
}
