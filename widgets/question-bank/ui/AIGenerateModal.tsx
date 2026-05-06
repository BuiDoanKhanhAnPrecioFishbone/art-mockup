"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  DIFFICULTIES,
  QUESTION_TYPE_LABEL,
  type Difficulty,
  type Question,
  type QuestionType,
} from "@/entities/question";

const TYPES: QuestionType[] = [
  "essay",
  "multiple-choice",
  "csharp",
  "javascript",
  "testing",
];

/**
 * "AI Generating Question" modal — accepts a Type / Difficulty / Tags /
 * Description and asks /api/questions/ai-generate for a draft. The parent
 * decides what to do with the returned question (apply to current draft,
 * preview, etc.).
 */
export function AIGenerateModal({
  defaultType,
  defaultDifficulty,
  defaultTags,
  onClose,
  onAccept,
}: {
  defaultType?: QuestionType;
  defaultDifficulty?: Difficulty;
  defaultTags?: string[];
  onClose: () => void;
  onAccept: (q: Question) => void;
}) {
  const { showToast } = useToast();
  const [type, setType] = useState<QuestionType>(defaultType ?? "essay");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    defaultDifficulty ?? "Medium"
  );
  const [tagsInput, setTagsInput] = useState((defaultTags ?? []).join(", "));
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function generate() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/questions/ai-generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          difficulty,
          tags: tagsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          description: description.trim(),
        }),
      });
      if (!res.ok) {
        showToast("error", "AI generation failed.");
        return;
      }
      const { question } = (await res.json()) as { question: Question };
      onAccept(question);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-violet-50 shadow-2xl md:grid-cols-[1fr_1fr]">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-200/60" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-yellow-200/60" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-gray-500 hover:text-gray-900"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="col-span-full px-6 pb-2 pt-5">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-violet-900">
            <Sparkles size={18} className="text-violet-600" />
            AI Generating Question
          </h3>
          <p className="mt-0.5 text-sm text-violet-900/80">
            Let AI help you generate a question based on your inputs.
          </p>
        </div>

        {/* Illustration */}
        <div className="relative flex items-center justify-center px-6 pb-6 pt-2">
          <Illustration />
        </div>

        {/* Form */}
        <div className="space-y-3 bg-white/70 px-6 py-5 backdrop-blur-sm md:rounded-l-3xl">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Type" required>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                className="input"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {QUESTION_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Difficulty" required>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="input"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Tags" required>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. JavaScript, Algorithms, Frontend"
              className="input"
            />
          </Field>
          <Field label="Description" required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the topic / scenario you want a question about…"
              className="input resize-none"
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={generate}
              disabled={
                submitting ||
                !description.trim() ||
                tagsInput.trim().length === 0
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Confirm
                </>
              )}
            </button>
          </div>
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

/** Inline SVG of a person + laptop + chat bubble — matches the wireframe
 *  illustration without needing an external asset. */
function Illustration() {
  return (
    <svg
      viewBox="0 0 220 200"
      className={cn("h-44 w-full max-w-[260px]")}
      aria-hidden
    >
      <ellipse cx="110" cy="180" rx="90" ry="6" fill="#a78bfa" opacity="0.15" />
      {/* Laptop */}
      <rect x="50" y="100" width="120" height="70" rx="6" fill="#fde68a" />
      <rect x="58" y="108" width="104" height="50" rx="3" fill="#fbbf24" />
      <rect x="40" y="170" width="140" height="6" rx="3" fill="#f59e0b" />
      {/* Person */}
      <circle cx="60" cy="60" r="14" fill="#fcd34d" />
      <rect x="50" y="74" width="20" height="40" rx="4" fill="#7c3aed" />
      <rect x="44" y="80" width="8" height="22" rx="3" fill="#7c3aed" />
      {/* Chat bubble */}
      <rect x="125" y="40" width="60" height="40" rx="8" fill="#fff" stroke="#a78bfa" strokeWidth="2" />
      <circle cx="140" cy="60" r="3" fill="#a78bfa" />
      <circle cx="155" cy="60" r="3" fill="#a78bfa" />
      <circle cx="170" cy="60" r="3" fill="#a78bfa" />
      {/* Sparkle */}
      <path d="M195 25 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" fill="#fbbf24" />
    </svg>
  );
}
