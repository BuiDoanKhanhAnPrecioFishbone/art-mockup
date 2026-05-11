"use client";

import { useEffect, useState } from "react";
import {
  CandidateIllustration,
  TakeShell,
} from "@/widgets/take-shell";
import type { Test, TestSession } from "@/entities/test";

/** Candidate Thank-You — wireframe node 2435:75626. Confirmation
 *  panel shown after Submit. */
export default function TakeDonePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [session, setSession] = useState<TestSession | null>(null);
  const [test, setTest] = useState<Test | null>(null);

  useEffect(() => {
    params.then(({ sessionId }) => {
      fetch(`/api/take/${sessionId}`)
        .then((r) => r.json())
        .then((d) => {
          setSession(d.session ?? null);
          setTest(d.test ?? null);
        });
    });
  }, [params]);

  return (
    <TakeShell
      badge={
        <>
          <span className="text-gray-500">Test Acess</span>
          <span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
            Finished
          </span>
        </>
      }
      title={test?.title ?? session?.name ?? "Test completed"}
    >
      <div className="rounded-xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
          <div className="mx-auto h-48 w-full max-w-sm md:mx-0">
            <CandidateIllustration />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-violet-600">
              Your answers has been submitted!
            </h2>
            <p className="mt-3 text-sm text-gray-700">
              Thank you for completing the test!
              <br />
              We appreciate the time and effort you put into your submission.
              <br />
              Our team will review your responses and reach out if there are
              any
              <br />
              next steps in the hiring process.
            </p>
          </div>
        </div>
      </div>
    </TakeShell>
  );
}
