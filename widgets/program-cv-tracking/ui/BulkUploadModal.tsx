"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  CloudUpload,
  FileText,
  HelpCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { CV_SOURCES, type CVSource } from "@/entities/cv-record";
import type { Program } from "@/entities/program";
import { ModalShell } from "./pieces";

interface StagedFile {
  id: string;
  name: string;
  sizeKB: number;
  /** Upload progress 0–100. */
  progress: number;
  /** When true the file landed past server validation. */
  done: boolean;
  /** When set, the file was rejected. */
  error?: string;
}

const MOCK_FILES: Omit<StagedFile, "id" | "progress" | "done">[] = [
  { name: "CV_Bui_Hoang_Vu.pdf", sizeKB: 2640 },
  { name: "CV_Khoa_Anh.pdf", sizeKB: 5028 },
  { name: "Resume_Maria_Lin.pdf", sizeKB: 1840 },
  { name: "Phan_Hai_Trieu_Resume.pdf", sizeKB: 990 },
];

export function BulkUploadModal({
  program,
  onClose,
  onCompleted,
}: {
  program: Program;
  onClose: () => void;
  onCompleted: (count: number) => void;
}) {
  const [source, setSource] = useState<CVSource | "">("");
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [phase, setPhase] = useState<"staging" | "uploading" | "done">(
    "staging"
  );

  function addMockFiles() {
    const next: StagedFile[] = MOCK_FILES.map((m, i) => ({
      ...m,
      id: `f-${Date.now()}-${i}`,
      progress: 0,
      done: false,
    }));
    setFiles((prev) => [...prev, ...next]);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function startUpload() {
    if (!source || files.length === 0 || phase !== "staging") return;
    setPhase("uploading");

    // Simulate per-file streaming upload with a staggered progress ramp.
    const animateOne = (id: string) =>
      new Promise<void>((resolve) => {
        let p = 0;
        const tick = setInterval(() => {
          p += 12 + Math.random() * 16;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? { ...f, progress: Math.min(100, p) }
                : f
            )
          );
          if (p >= 100) {
            clearInterval(tick);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, progress: 100, done: true } : f
              )
            );
            resolve();
          }
        }, 140);
      });

    // Kick off two at a time so the modal feels lively.
    const queue = [...files];
    const workers = [
      (async () => {
        while (queue.length) {
          const f = queue.shift();
          if (f) await animateOne(f.id);
        }
      })(),
      (async () => {
        while (queue.length) {
          const f = queue.shift();
          if (f) await animateOne(f.id);
        }
      })(),
    ];
    await Promise.all(workers);

    // Persist each as a CV record in "extracting" status so the table
    // shows them parsing in real time. Server will set the createdAt.
    const created = await Promise.all(
      MOCK_FILES.map((m) =>
        fetch("/api/cvs", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            programId: program.id,
            fileName: m.name,
            fileSizeKB: m.sizeKB,
            type: "manual",
            source,
            status: "extracting",
            skills: [],
          }),
        }).then((r) => r.json())
      )
    );

    // Schedule each to settle into a final status to demo the AI parsing.
    created.forEach((res, i) => {
      const id = res?.cv?.id;
      if (!id) return;
      setTimeout(
        () => {
          // Flip to "done" with mock parsed data.
          fetch(`/api/cvs/${id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              status: "done",
              parsedName: MOCK_FILES[i % MOCK_FILES.length].name
                .replace(/^CV_|Resume_/i, "")
                .replace(/\.(pdf|docx)$/i, "")
                .replace(/_/g, " "),
              parsedEmail: `applicant${i + 1}@example.com`,
              skills: [
                { name: "Communication", inProgramSkillSet: false },
                { name: "Problem Solving", inProgramSkillSet: false },
              ],
            }),
          });
        },
        2200 + i * 800
      );
    });

    setPhase("done");
    onCompleted(files.length);
  }

  return (
    <ModalShell
      title="Bulk Upload CVs"
      subtitle="Upload up to 50 files at once."
      onClose={onClose}
      width="max-w-2xl"
      footer={
        phase === "done" ? (
          <button
            onClick={onClose}
            className="rounded-lg bg-violet-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            Close
          </button>
        ) : (
          <>
            <button
              onClick={onClose}
              disabled={phase === "uploading"}
              className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={startUpload}
              disabled={
                !source || files.length === 0 || phase === "uploading"
              }
              className="rounded-lg bg-violet-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === "uploading" ? "Uploading…" : "Upload"}
            </button>
          </>
        )
      }
    >
      <div className="space-y-5 p-5">
        {/* Drop area */}
        <button
          type="button"
          onClick={addMockFiles}
          disabled={phase !== "staging"}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors",
            phase === "staging" && "hover:border-violet-400 hover:bg-violet-50",
            phase !== "staging" && "cursor-not-allowed opacity-70"
          )}
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <CloudUpload size={26} />
          </span>
          <p className="text-sm font-medium text-gray-800">
            Click to upload or drag and drop
          </p>
          <p className="text-[11px] text-gray-500">
            PDF, DOCX up to 5MB each (Max 50 files)
          </p>
        </button>

        {/* Source */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
            Source<span className="text-red-500">*</span>
            <span title="Where these CVs came from. Tagged on each parsed candidate.">
              <HelpCircle size={11} className="text-gray-400" />
            </span>
          </label>
          <div className="relative">
            <select
              value={source}
              onChange={(e) =>
                setSource((e.target.value || "") as CVSource | "")
              }
              disabled={phase !== "staging"}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-violet-500 focus:outline-none disabled:bg-gray-50"
            >
              <option value="">Please Select</option>
              {CV_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Staged files */}
        {files.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-700">
              Staged Files ({files.length})
            </p>
            <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-3 rounded-md bg-white px-3 py-2 shadow-sm"
                >
                  <FileText size={16} className="text-violet-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-900">
                      {f.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {(f.sizeKB / 1024).toFixed(2)} MB
                    </p>
                    {phase !== "staging" && (
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                        <span
                          className={cn(
                            "block h-full rounded-full transition-[width]",
                            f.done ? "bg-green-500" : "bg-violet-500"
                          )}
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {phase === "staging" ? (
                    <button
                      onClick={() => removeFile(f.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${f.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : f.done ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check size={12} />
                    </span>
                  ) : (
                    <Loader2
                      size={14}
                      className="animate-spin text-violet-500"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
