"use client";

import { X } from "lucide-react";

/** Test Guidance modal — wireframe node 3379:192083. Centred overlay
 *  listing how each piece of the runner UI works. Static copy. */
export function TestGuidanceModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Test Guidance
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        <ul className="flex-1 space-y-2 overflow-y-auto px-5 py-4 text-xs leading-relaxed text-gray-700">
          <Bullet>
            <strong>Time left</strong> shows the time you have to do the test.
          </Bullet>
          <Bullet>
            <strong>Question List button</strong> shows questions in the test
            and you can navigate to them if the test allows.
          </Bullet>
          <Bullet>
            <strong>Navigation button</strong> is used to navigate to next or
            previous question if the test allows.
          </Bullet>
          <Bullet>
            <strong>Submit answer button</strong> is used to submit your
            current question.
          </Bullet>
          <Bullet>
            <strong>Flag for review button</strong> is used to flag a question
            to review later.
          </Bullet>
          <Bullet>
            <strong>Finish button</strong> is used to submit your test.
            Remember that you can submit your test once. So submit your test
            carefully.
          </Bullet>
          <Bullet>
            <strong>For essay and testing questions</strong>, fill your answer
            in editor.
          </Bullet>
          <Bullet>
            <strong>For multiple choices questions</strong>, check options
            that you think they fit to answer.
          </Bullet>
          <Bullet>
            <strong>For Coding questions:</strong>
            <ul className="mt-1 ml-4 list-disc space-y-1 text-gray-600">
              <li>
                Code editor is used to fill your code with the given template.
              </li>
              <li>
                Another editor is used to show example test cases that you can
                use to debug.
              </li>
              <li>
                Run test case button is used to try your code with example
                test cases.
              </li>
              <li>
                Flag for review is used to flag a question to review later.
              </li>
            </ul>
          </Bullet>
        </ul>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
      <span>{children}</span>
    </li>
  );
}
