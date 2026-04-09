"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles, Send, RefreshCw, Copy, ChevronRight,
  CheckCircle2, AlertCircle, Loader2, Lightbulb, X
} from "lucide-react";

type Step = "idle" | "loading" | "result" | "error";

const EXAMPLE_PROMPTS = [
  "Invite the candidate for a 30-minute technical interview next week and mention their impressive Github portfolio.",
  "Write a professional welcome email for a new Senior Product Designer joining the team next Monday. Include details about the onboarding schedule and team lunch.",
  "Send a warm application-received confirmation to a UX designer candidate. Keep the tone friendly and professional.",
];

const TONES = ["Professional", "Friendly", "Formal", "Casual", "Enthusiastic"];
const LENGTHS = ["Short", "Medium", "Long"];
const LANGUAGES = ["English", "Vietnamese", "Japanese", "French", "Spanish"];

export default function ComposePage() {
  const [step, setStep] = useState<Step>("idle");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 500;
  const abortRef = useRef(false);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    abortRef.current = false;
    setStep("loading");
    setResult(null);

    // Simulate AI latency
    await new Promise((r) => setTimeout(r, 2200));
    if (abortRef.current) return;

    try {
      const res = await fetch("/api/email-management/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tone, length, language }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch {
      setStep("error");
    }
  }

  function handleCopy(type: "subject" | "body") {
    const text = type === "subject" ? result?.subject : result?.body;
    navigator.clipboard?.writeText(text ?? "").catch(() => {});
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  }

  function handleReset() {
    abortRef.current = true;
    setStep("idle");
    setResult(null);
    setPrompt("");
    setCharCount(0);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-8 py-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <Link href="/flows/email-management" className="hover:text-gray-600 transition-colors">Email Management</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">AI Magic Draft</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" />
              AI Magic Draft
            </h1>
            <p className="text-sm text-gray-500">Describe what you want to say — AI will write it for you</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* Left panel — Prompt + Controls */}
        <div className="w-[420px] shrink-0 border-r border-gray-200 bg-white flex flex-col">
          <div className="flex-1 overflow-auto p-6 space-y-5">
            {/* Prompt */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Your Request
              </label>
              <textarea
                value={prompt}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setPrompt(e.target.value);
                    setCharCount(e.target.value.length);
                  }
                }}
                placeholder="e.g., Invite the candidate for a 30-minute technical interview next week and mention their impressive Github portfolio..."
                rows={6}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${charCount > MAX_CHARS * 0.9 ? "text-amber-500" : "text-gray-400"}`}>
                  {charCount} / {MAX_CHARS} characters
                </span>
              </div>
            </div>

            {/* Example prompts */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb size={13} className="text-amber-500" />
                <span className="text-xs font-medium text-gray-500">Example prompts</span>
              </div>
              <div className="space-y-1.5">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setPrompt(p); setCharCount(p.length); }}
                    className="w-full text-left text-xs text-gray-500 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg px-3 py-2 transition-colors leading-relaxed border border-transparent hover:border-purple-200"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tone</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Length</label>
                <div className="flex gap-1.5">
                  {LENGTHS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <div className="shrink-0 p-5 border-t border-gray-100">
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || step === "loading"}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
            >
              {step === "loading" ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate</>
              )}
            </button>
          </div>
        </div>

        {/* Right panel — Output */}
        <div className="flex-1 overflow-auto bg-gray-50 flex flex-col">
          {/* IDLE */}
          {step === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-5">
                <Sparkles size={28} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">AI is ready</h2>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                Enter your request on the left and click <strong>Generate</strong> for the AI to start writing.
              </p>
            </div>
          )}

          {/* LOADING */}
          {step === "loading" && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-5 animate-pulse">
                <Sparkles size={28} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2 animate-pulse">
                Putting thoughts into words…
              </h2>
              <p className="text-sm text-gray-500">
                AI is analysing the variables and drafting optimal content for you.
              </p>
              <div className="mt-6 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <button
                onClick={() => { abortRef.current = true; setStep("idle"); }}
                className="mt-8 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ERROR */}
          {step === "error" && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-5">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Oops! AI is busy</h2>
              <p className="text-sm text-gray-500 mb-1">
                AI is busy or there&apos;s a connection error.
              </p>
              <p className="text-sm text-gray-400">Please try again later.</p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={14} /> Reset
                </button>
              </div>
            </div>
          )}

          {/* RESULT */}
          {step === "result" && result && (
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-800">Draft Generated</span>
                  <span className="text-xs text-gray-400">— {tone} · {length} · {language}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw size={12} /> Regenerate
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <X size={12} /> Clear
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</span>
                  <button
                    onClick={() => handleCopy("subject")}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Copy size={12} />
                    {copied === "subject" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">{result.subject}</p>
                </div>
              </div>

              {/* Body */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Body</span>
                  <button
                    onClick={() => handleCopy("body")}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Copy size={12} />
                    {copied === "body" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="px-4 py-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                    {result.body}
                  </pre>
                </div>
              </div>

              {/* Use in template CTA */}
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Happy with this draft?</p>
                  <p className="text-xs text-purple-600 mt-0.5">Save it as a reusable template</p>
                </div>
                <Link
                  href={`/flows/email-management/templates/new`}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  <Send size={14} />
                  Use as Template
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
