"use client";

import { useState, useRef } from "react";
import {
  Sparkles, X, HelpCircle, ChevronLeft, ChevronRight,
  RefreshCw, Loader2, AlertCircle, Plus, Search,
  ChevronDown, RotateCcw
} from "lucide-react";
import { templateVariables } from "@/shared/fixtures/email-variables";

// ── Types ─────────────────────────────────────────────────────────────────────
type DraftStep = "idle" | "generating" | "error" | "result";

const TONES = ["Professional", "Friendly", "Formal"] as const;
const LENGTHS = ["Shorten", "Normal", "Details"] as const;
const LANGUAGES = ["English", "Vietnamese", "Japanese", "French", "Spanish"];

const AI_ACTIONS_CONTENT = ["Shorten", "More detail"];
const AI_ACTIONS_TONE = ["More professional", "More friendly", "More..."];

const VARIABLE_CATEGORIES = ["candidate", "job", "interview", "company", "sender"] as const;

// Simulated multiple drafts
const MOCK_DRAFTS: Array<{ subject: string; body: string }> = [
  {
    subject: "Invitation to Interview – {JobTitle} at {CompanyName}",
    body: `Dear {CandidateName},\n\nThank you for your interest in the {JobTitle} position at {CompanyName}.\n\nWe were impressed by your profile and would like to invite you to an interview on {InterviewDate} at {InterviewTime}.\n\nThe interview will be held at {InterviewLocation} and is expected to last {InterviewDuration}.\n\nPlease confirm your availability by replying to this email. Should you have any questions, feel free to reach out.\n\nWe look forward to speaking with you.\n\nBest regards,\n{SenderName}\n{SenderTitle}\n{CompanyName}`,
  },
  {
    subject: "We'd love to chat – {JobTitle} role",
    body: `Hi {CandidateName},\n\nGreat news! After reviewing your application for the {JobTitle} role at {CompanyName}, we'd love to schedule a conversation.\n\nCould you join us on {InterviewDate} at {InterviewTime}? The session will take about {InterviewDuration} via {InterviewLocation}.\n\nLet us know if that works for you!\n\nCheers,\n{SenderName} from {CompanyName}`,
  },
  {
    subject: "Interview Invitation: {JobTitle} – {CompanyName}",
    body: `Dear {CandidateName},\n\nWe are pleased to inform you that you have been shortlisted for the {JobTitle} position within the {Department} department at {CompanyName}.\n\nYou are cordially invited to attend an interview scheduled for {InterviewDate} at {InterviewTime} at {InterviewLocation}. The interview is expected to run for {InterviewDuration}.\n\nKindly confirm your attendance at your earliest convenience.\n\nYours sincerely,\n{SenderName}\n{SenderTitle} | {CompanyName}`,
  },
];

// ── Variable chip in result body ──────────────────────────────────────────────
const SAMPLE: Record<string, string> = {};
templateVariables.forEach((v) => { SAMPLE[v.key] = v.example; });
const VAR_REGEX = /(\{[A-Za-z]+\})/g;

function ResultText({ text }: { text: string }) {
  const parts = text.split(VAR_REGEX);
  return (
    <>
      {parts.flatMap((part, i) => {
        if (!part.match(/^\{[A-Za-z]+\}$/)) {
          return part.split("\n").map((line, j, arr) => (
            <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
          ));
        }
        const sample = SAMPLE[part];
        return [
          <span
            key={i}
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium mx-0.5 ${
              sample
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
            }`}
          >
            {sample ?? part}
          </span>
        ];
      })}
    </>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className ?? ""}`} />;
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function AIMagicDraftModal({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply?: (subject: string, body: string) => void;
}) {
  // Form state
  const [purpose, setPurpose] = useState("");
  const [selectedVars, setSelectedVars] = useState<string[]>(["{CompanyName}", "{JobTitle}"]);
  const [tone, setTone] = useState<typeof TONES[number]>("Professional");
  const [language, setLanguage] = useState("English");
  const [length, setLength] = useState<typeof LENGTHS[number]>("Normal");

  // Output state
  const [step, setStep] = useState<DraftStep>("idle");
  const [draftIndex, setDraftIndex] = useState(0);
  const [drafts, setDrafts] = useState<Array<{ subject: string; body: string }>>([]);

  // Variable sidebar
  const [varSearch, setVarSearch] = useState("");
  const [showAddVar, setShowAddVar] = useState(false);

  const abortRef = useRef(false);

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleGenerate() {
    abortRef.current = false;
    setStep("generating");
    setDrafts([]);
    setDraftIndex(0);

    await new Promise((r) => setTimeout(r, 2400));
    if (abortRef.current) return;

    try {
      const res = await fetch("/api/email-management/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: purpose, tone, length, language }),
      });
      if (!res.ok) throw new Error();
      // Use mock drafts for richer demo
      setDrafts(MOCK_DRAFTS);
      setDraftIndex(0);
      setStep("result");
    } catch {
      setStep("error");
    }
  }

  function handleStop() {
    abortRef.current = true;
    setStep("idle");
  }

  function handleRetry() {
    handleGenerate();
  }

  function removeVar(key: string) {
    setSelectedVars((v) => v.filter((k) => k !== key));
  }

  function addVar(key: string) {
    if (!selectedVars.includes(key)) setSelectedVars((v) => [...v, key]);
    setShowAddVar(false);
  }

  const currentDraft = drafts[draftIndex];
  const filteredVars = templateVariables.filter(
    (v) =>
      !varSearch ||
      v.label.toLowerCase().includes(varSearch.toLowerCase()) ||
      v.key.toLowerCase().includes(varSearch.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-black/50 backdrop-blur-sm">
      <div className="m-auto w-full max-w-6xl h-[90vh] rounded-2xl bg-white shadow-2xl flex overflow-hidden">

        {/* ── Far-left Variables sidebar ────────────────────────────────────── */}
        <aside className="w-52 shrink-0 border-r border-gray-100 flex flex-col bg-gray-50">
          <div className="px-3 py-3 border-b border-gray-200 shrink-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Variables</p>
            <div className="relative">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={varSearch}
                onChange={(e) => setVarSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-md border border-gray-200 bg-white pl-6 pr-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {VARIABLE_CATEGORIES.map((cat) => {
              const vars = filteredVars.filter((v) => v.category === cat);
              if (!vars.length) return null;
              return (
                <div key={cat}>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-1">{cat}</p>
                  {vars.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => addVar(v.key)}
                      className="w-full flex flex-col items-start rounded-lg px-2 py-1.5 hover:bg-white hover:shadow-sm text-left transition-all group"
                    >
                      <code className="text-[10px] font-mono text-purple-600">{v.key}</code>
                      <span className="text-[10px] text-gray-400 truncate w-full">{v.example}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Left form panel ───────────────────────────────────────────────── */}
        <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col">
          {/* Panel header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">AI Magic Draft</span>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <HelpCircle size={14} />
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* CONTENT section */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Content</p>

              {/* Purpose textarea */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Purpose of the Email
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setPurpose(e.target.value);
                  }}
                  placeholder="Describe the purpose of this email, e.g. invite candidate for technical interview..."
                  rows={5}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none leading-relaxed"
                />
                <div className="flex justify-end mt-0.5">
                  <span className={`text-[10px] ${purpose.length > 450 ? "text-amber-500" : "text-gray-400"}`}>
                    {purpose.length}/500
                  </span>
                </div>
              </div>

              {/* Variables to include */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Variables to Include
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedVars.map((key) => {
                    const v = templateVariables.find((t) => t.key === key);
                    const label = v ? v.label : key.replace(/[{}]/g, "");
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700"
                      >
                        {label}
                        <button
                          onClick={() => removeVar(key)}
                          className="text-purple-400 hover:text-purple-700 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    );
                  })}
                  <div className="relative">
                    <button
                      onClick={() => setShowAddVar((v) => !v)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[11px] text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
                    >
                      <Plus size={10} /> Add Variable
                    </button>
                    {showAddVar && (
                      <div className="absolute top-full left-0 mt-1 z-10 w-52 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                        <div className="max-h-56 overflow-y-auto">
                          {templateVariables
                            .filter((v) => !selectedVars.includes(v.key))
                            .map((v) => (
                              <button
                                key={v.key}
                                onClick={() => addVar(v.key)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-purple-50 transition-colors"
                              >
                                <code className="text-[10px] font-mono text-purple-600 bg-purple-50 px-1 rounded">{v.key}</code>
                                <span className="text-xs text-gray-600 truncate">{v.label}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SETTINGS section */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Settings</p>

              {/* Tone */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tone</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                        tone === t
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Language</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 pr-7"
                  >
                    {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Length</label>
                <div className="flex gap-1.5">
                  {LENGTHS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      className={`flex-1 rounded-full py-1 text-[11px] font-medium transition-colors ${
                        length === l
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate / Stop button */}
          <div className="shrink-0 p-4 border-t border-gray-100">
            {step === "generating" ? (
              <div className="flex gap-2">
                <button
                  onClick={handleStop}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={13} /> Stop
                </button>
                <button
                  disabled
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-400 py-2 text-xs font-medium text-white opacity-75 cursor-not-allowed"
                >
                  <Loader2 size={13} className="animate-spin" /> Generating...
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!purpose.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <Sparkles size={14} />
                Generate
              </button>
            )}
          </div>
        </div>

        {/* ── Right output panel ────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main output area */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Result header bar (only in result state) */}
            {step === "result" && (
              <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDraftIndex((i) => Math.max(0, i - 1))}
                    disabled={draftIndex === 0}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-medium text-gray-600">
                    {draftIndex + 1} / {drafts.length}
                  </span>
                  <button
                    onClick={() => setDraftIndex((i) => Math.min(drafts.length - 1, i + 1))}
                    disabled={draftIndex === drafts.length - 1}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    AI Action <ChevronDown size={12} />
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw size={12} /> Regenerate
                  </button>
                </div>
              </div>
            )}

            {/* Content area */}
            <div className="flex-1 overflow-auto bg-gray-50">

              {/* IDLE */}
              {step === "idle" && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                    <Sparkles size={24} className="text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Enter your request on the left and click Generate
                  </p>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                    AI will produce multiple draft variations for you to choose from
                  </p>
                </div>
              )}

              {/* GENERATING */}
              {step === "generating" && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-5">
                    <Loader2 size={18} className="text-purple-500 animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Putting thoughts into words...</p>
                      <p className="text-xs text-gray-400">AI is analysing the variables and composing your email</p>
                    </div>
                  </div>
                  {/* Skeleton subject */}
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Email Subject</p>
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  {/* Skeleton body */}
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Email Body</p>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                      <Skeleton className="h-3 w-2/3" />
                      <div className="pt-1" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {step === "error" && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertCircle size={28} className="text-red-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Oops! AI is busy or there&apos;s a connection error.</p>
                  <p className="text-xs text-gray-400 mb-5">Please try again later.</p>
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                  >
                    <RotateCcw size={14} /> Retry
                  </button>
                </div>
              )}

              {/* RESULT */}
              {step === "result" && currentDraft && (
                <div className="p-6 space-y-4">
                  {/* Subject */}
                  <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Email Subject</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800 leading-relaxed">
                        <ResultText text={currentDraft.subject} />
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Email Body</p>
                    </div>
                    <div className="px-4 py-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <ResultText text={currentDraft.body} />
                      </p>
                    </div>
                  </div>

                  {/* Regenerate new draft CTA */}
                  <button
                    onClick={handleGenerate}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-purple-300 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <RefreshCw size={14} /> Regenerate New Draft
                  </button>
                </div>
              )}
            </div>

            {/* Apply button (result state only) */}
            {step === "result" && currentDraft && onApply && (
              <div className="shrink-0 px-6 py-3 border-t border-gray-100 bg-white flex justify-end">
                <button
                  onClick={() => { onApply(currentDraft.subject, currentDraft.body); onClose(); }}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
                >
                  <Sparkles size={14} /> Use This Draft
                </button>
              </div>
            )}
          </div>

          {/* AI Action sidebar (result state only) */}
          {step === "result" && (
            <aside className="w-44 shrink-0 border-l border-gray-100 bg-white flex flex-col">
              <div className="px-3 py-3 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">AI Action</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-medium px-2 mb-1">Content</p>
                  {AI_ACTIONS_CONTENT.map((action) => (
                    <button
                      key={action}
                      className="w-full text-left rounded-lg px-2 py-1.5 text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium px-2 mb-1">Tone</p>
                  {AI_ACTIONS_TONE.map((action) => (
                    <button
                      key={action}
                      className="w-full text-left rounded-lg px-2 py-1.5 text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
