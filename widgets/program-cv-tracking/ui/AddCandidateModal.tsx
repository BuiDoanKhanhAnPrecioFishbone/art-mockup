"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  CloudUpload,
  FileText,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { masterSkills } from "@/shared/fixtures/skills";
import { CV_SOURCES, type CVRecord, type CVSource } from "@/entities/cv-record";
import type { Program } from "@/entities/program";
import { ModalShell, SkillChip } from "./pieces";

/**
 * Multi-mode "Add Candidate" dialog.
 *
 * Three entry points:
 *   - "fresh"  : user clicked + Add New Candidate, no CV picked yet.
 *   - "draft"  : user clicked the edit icon on a CV row that's still
 *                AI-extracting / parsed but not yet saved.
 *   - "fix"    : user clicked the edit icon on a row needing review or with
 *                a duplicate / error condition.
 *
 * On Save the CV record is promoted to a Candidate via /promote.
 */
export interface AddCandidateModalProps {
  program: Program;
  /** When provided, pre-fills the form from this CV record. */
  cv?: CVRecord;
  onClose: () => void;
  onPromoted: (info: { candidateId: string; cvId?: string }) => void;
}

type Phase = "empty" | "parsing" | "ready";

const MOCK_PARSED = {
  fileName: "Phan_Hai_Trieu_Resume.pdf",
  parsedName: "Phan Hai Trieu",
  parsedEmail: "trieuphan3701@gmail.com",
  parsedPhone: "0967648928",
  source: "LinkedIn" as CVSource,
  skills: [
    "ReactJS",
    "TypeScript",
    "GraphQL",
    "Node.js",
    "Tailwind CSS",
    "Jest",
  ],
};

export function AddCandidateModal({
  program,
  cv,
  onClose,
  onPromoted,
}: AddCandidateModalProps) {
  const programSkillNames = useMemo(
    () =>
      new Set(
        (program.skills ?? []).map((s) => s.name.toLowerCase().trim())
      ),
    [program.skills]
  );
  const librarySkillNames = useMemo(
    () => new Set(masterSkills.map((s) => s.name.toLowerCase())),
    []
  );

  // Derive initial phase + form state from props.
  const initialPhase: Phase = !cv
    ? "empty"
    : cv.status === "extracting"
      ? "parsing"
      : "ready";

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [fileName, setFileName] = useState(cv?.fileName ?? "");
  const [name, setName] = useState(cv?.parsedName ?? "");
  const [email, setEmail] = useState(cv?.parsedEmail ?? "");
  const [phone, setPhone] = useState(cv?.parsedPhone ?? "");
  const [source, setSource] = useState<CVSource>(cv?.source ?? "LinkedIn");
  const [skills, setSkills] = useState<string[]>(
    () => cv?.skills.map((s) => s.name) ?? []
  );
  const [skillSearch, setSkillSearch] = useState("");
  const [skillSearchOpen, setSkillSearchOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the row was still extracting, simulate a parse delay then settle.
  useEffect(() => {
    if (phase !== "parsing") return;
    const t = setTimeout(() => {
      setPhase("ready");
    }, 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // Detect duplicate email warning (CVs with matching email already exist).
  const duplicateOfId = cv?.duplicateOfCandidateId;
  const showDuplicateWarning =
    !!duplicateOfId ||
    (cv?.status === "duplicate" && cv?.parsedEmail === email);

  function handlePickFile() {
    // Mock file picker — a real Browse/Drop would open a file dialog. Here
    // we instantly populate sample data and run the simulated parse.
    setPhase("parsing");
    setFileName(MOCK_PARSED.fileName);
    setTimeout(() => {
      setName(MOCK_PARSED.parsedName);
      setEmail(MOCK_PARSED.parsedEmail);
      setPhone(MOCK_PARSED.parsedPhone);
      setSource(MOCK_PARSED.source);
      setSkills(MOCK_PARSED.skills);
      setPhase("ready");
    }, 1500);
  }

  function classifySkill(skillName: string): {
    inProgramSkillSet: boolean;
    inLibrary: boolean;
  } {
    const lc = skillName.toLowerCase().trim();
    return {
      inProgramSkillSet: programSkillNames.has(lc),
      inLibrary: librarySkillNames.has(lc),
    };
  }

  const matchedCount = skills.filter(
    (s) => classifySkill(s).inProgramSkillSet
  ).length;
  const totalProgramSkills = program.skills?.length ?? 0;
  const matchedFraction = totalProgramSkills
    ? `${matchedCount}/${totalProgramSkills}`
    : `${matchedCount}`;

  const skillSuggestions = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return [] as { id: string; name: string }[];
    return masterSkills
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) &&
          !skills.some((sk) => sk.toLowerCase() === s.name.toLowerCase())
      )
      .slice(0, 6)
      .map((s) => ({ id: s.id, name: s.name }));
  }, [skillSearch, skills]);

  const valid =
    phase === "ready" && name.trim().length > 0 && email.trim().length > 0;

  async function handleSave() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Build a CV record on-the-fly if we don't have one (i.e. fresh add).
      let cvId = cv?.id;
      if (!cvId) {
        const created = await fetch("/api/cvs", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            programId: program.id,
            fileName: fileName || `${name}_CV.pdf`,
            type: "manual",
            source,
            status: "done",
            parsedName: name,
            parsedEmail: email,
            parsedPhone: phone,
            skills: skills.map((s) => {
              const { inProgramSkillSet } = classifySkill(s);
              return { name: s, inProgramSkillSet };
            }),
          }),
        }).then((r) => r.json());
        cvId = created?.cv?.id;
      } else {
        // Persist any edits on the existing CV before promoting.
        await fetch(`/api/cvs/${cvId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            parsedName: name,
            parsedEmail: email,
            parsedPhone: phone,
            source,
            skills: skills.map((s) => {
              const { inProgramSkillSet } = classifySkill(s);
              return { name: s, inProgramSkillSet };
            }),
            status: "done",
          }),
        });
      }
      if (!cvId) {
        setError("Could not stage CV record.");
        return;
      }
      // Pick a sensible default landing step — first step of first stage.
      const firstStage = program.workflow?.stages?.[0];
      const firstStep = firstStage?.steps?.[0];
      const promote = await fetch(`/api/cvs/${cvId}/promote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          programId: program.id,
          currentStageId: firstStage?.id ?? "",
          currentStepId: firstStep?.id ?? "",
        }),
      });
      if (!promote.ok) {
        setError("Promotion failed.");
        return;
      }
      const { candidate } = await promote.json();
      onPromoted({ candidateId: candidate.id, cvId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      title="Add Candidate"
      onClose={onClose}
      width="max-w-5xl"
      footer={
        <>
          {error && (
            <span className="mr-auto text-xs text-red-600">{error}</span>
          )}
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!valid || submitting}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {/* LEFT — CV preview / upload area */}
        <div className="border-b border-gray-100 p-5 md:border-b-0 md:border-r">
          {phase === "empty" ? (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <CloudUpload size={28} />
              </div>
              <p className="text-base font-semibold text-gray-900">
                Upload CV to Parse
              </p>
              <p className="mt-1 max-w-sm text-xs text-gray-500">
                Drag and drop a PDF or DOCX file here, or click to browse. The
                AI will automatically extract the candidate&apos;s information.
              </p>
              <button
                onClick={handlePickFile}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                <FileText size={14} />
                Browse Files
              </button>
            </div>
          ) : (
            <CVPreview fileName={fileName} parsing={phase === "parsing"} />
          )}
        </div>

        {/* RIGHT — Form */}
        <div className="space-y-5 p-5">
          <Section title="1. General Information">
            <Field label="Full Name" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Phan Hai Trieu"
                disabled={phase !== "ready"}
                className="input"
              />
            </Field>
            <Field
              label="Email"
              required
              error={
                showDuplicateWarning
                  ? "Email already exists in this Program"
                  : undefined
              }
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trieuphan3701@gmail.com"
                disabled={phase !== "ready"}
                className={cn(
                  "input",
                  showDuplicateWarning && "border-red-400 bg-red-50"
                )}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={phase !== "ready"}
                  className="input"
                />
              </Field>
              <Field label="Source">
                <div className="relative">
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as CVSource)}
                    disabled={phase !== "ready"}
                    className="input appearance-none pr-7"
                  >
                    {CV_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </Field>
            </div>
          </Section>

          <Section
            title="2. Skills Extraction"
            right={
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  matchedCount > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {matchedFraction}
              </span>
            }
          >
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={skillSearch}
                onChange={(e) => {
                  setSkillSearch(e.target.value);
                  setSkillSearchOpen(true);
                }}
                onFocus={() => setSkillSearchOpen(true)}
                onBlur={() => setTimeout(() => setSkillSearchOpen(false), 100)}
                placeholder="Search and add skills from Master Library…"
                disabled={phase !== "ready"}
                className="input w-full pl-9"
              />
              {skillSearchOpen && skillSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {skillSuggestions.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSkills((prev) => [...prev, s.name]);
                          setSkillSearch("");
                        }}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-violet-50"
                      >
                        <span className="font-medium text-gray-800">
                          {s.name}
                        </span>
                        <span className="text-gray-400">+ add</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {skills.length === 0 ? (
              <p className="text-xs text-gray-400">
                {phase === "parsing"
                  ? "AI is analysing the CV — skills will appear here…"
                  : "0 skills detected."}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => {
                  const cls = classifySkill(s);
                  return (
                    <SkillChip
                      key={s}
                      name={s}
                      {...cls}
                      onRemove={() =>
                        setSkills((prev) => prev.filter((x) => x !== s))
                      }
                    />
                  );
                })}
              </div>
            )}

            <p className="text-[11px] text-gray-500">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500 align-middle" />
              In program skill set
              <span className="ml-3 mr-1.5 inline-block h-2 w-2 rounded-full bg-violet-500 align-middle" />
              In library only
              <span className="ml-3 mr-1.5 inline-block h-2 w-2 rounded-full bg-gray-400 align-middle" />
              New skill (will need approval)
            </p>
          </Section>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(209 213 219);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
        }
        .input:focus {
          border-color: rgb(139 92 246);
          outline: none;
        }
        .input:disabled {
          background: rgb(249 250 251);
          color: rgb(107 114 128);
        }
      `}</style>
    </ModalShell>
  );
}

function CVPreview({
  fileName,
  parsing,
}: {
  fileName: string;
  parsing: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <FileText size={14} className="text-violet-600" />
        <p className="truncate text-xs font-medium text-gray-800">
          {fileName || "Uploaded CV"}
        </p>
        {parsing && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
            <Loader2 size={10} className="animate-spin" />
            Parsing…
          </span>
        )}
      </div>
      {parsing ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <Sparkles size={28} className="text-violet-500" />
          <p className="text-sm font-medium text-gray-700">
            AI is reading the CV…
          </p>
          <p className="text-xs text-gray-500">
            Extracting name, email, phone and skills.
          </p>
          <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-violet-100">
            <span className="block h-full animate-pulse rounded-full bg-violet-500" />
          </div>
        </div>
      ) : (
        // Mock plain-text preview — coloured boxes mimic the wireframe.
        <div className="space-y-2 p-4">
          <div className="h-7 w-3/4 rounded-md bg-gray-200" />
          <div className="h-4 w-1/2 rounded-md bg-gray-200" />
          <div className="mt-3 space-y-1">
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-11/12 rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-block rounded-full bg-violet-200 px-3 py-1 text-[11px] font-medium text-violet-800">
              ReactJS
            </span>
            <span className="inline-block rounded-full bg-violet-200 px-3 py-1 text-[11px] font-medium text-violet-800">
              TypeScript
            </span>
            <span className="inline-block rounded-full bg-violet-200 px-3 py-1 text-[11px] font-medium text-violet-800">
              GraphQL
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="h-3 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            <AlertCircle size={11} />
            Mock preview — actual file viewer not implemented in this demo
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        {right}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-red-600">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
