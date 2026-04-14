"use client";

import { useState } from "react";
import { CheckCircle2, Upload, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";

type SubmitState = "idle" | "submitting" | "success";

// Simulated custom fields for the public form demo
const DEMO_CUSTOM_FIELDS = [
  {
    id: "years-exp",
    type: "number" as const,
    label: "Years of Marketing Experience",
    required: true,
  },
  {
    id: "portfolio",
    type: "short-text" as const,
    label: "Portfolio / LinkedIn URL",
    required: false,
  },
  {
    id: "work-type",
    type: "dropdown" as const,
    label: "Preferred Work Arrangement",
    required: true,
    options: ["Remote", "Hybrid", "On-site"],
  },
];

function SourceOptions() {
  return (
    <>
      <option value="">Select an option…</option>
      <option>LinkedIn</option>
      <option>Company Website</option>
      <option>Referral</option>
      <option>Job Fair</option>
      <option>Other</option>
    </>
  );
}

export default function PublicApplicationFormPage() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [agreed, setAgreed] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (formData: FormData) => {
    const errs: Record<string, string> = {};
    if (!formData.get("full-name")) errs["full-name"] = "Full name is required";
    if (!formData.get("email")) errs.email = "Email address is required";
    if (!fileName) errs.resume = "Please upload your CV";
    if (!agreed) errs.privacy = "You must agree to the Privacy Policy";
    const yearsExp = formData.get("years-exp");
    if (!yearsExp) errs["years-exp"] = "This field is required";
    const workType = formData.get("work-type");
    if (!workType) errs["work-type"] = "Please select an option";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitState("submitting");
    setTimeout(() => setSubmitState("success"), 1800);
  };

  // ── success screen ──────────────────────────────────────────────────────────
  if (submitState === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Submitted!
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Thank you for applying to{" "}
            <span className="font-medium text-gray-700">Q1 Marketing Hiring</span>{" "}
            at PrecioFishbone. We&apos;ll review your application and get back to
            you within 5–7 business days.
          </p>
          <p className="text-sm text-gray-400">
            A confirmation email has been sent to your inbox.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Job Board
          </Link>
        </div>
      </div>
    );
  }

  // ── form screen ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <header className="bg-purple-700 text-white px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <div className="font-bold text-lg tracking-tight">PrecioFishbone</div>
          <div className="h-5 w-px bg-purple-400" />
          <div className="text-sm opacity-80">Careers</div>
        </div>
      </header>

      {/* job context */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-xl mx-auto">
          <p className="text-xs text-gray-400 mb-1">Marketing · Remote</p>
          <h1 className="text-xl font-bold text-gray-900">Q1 Marketing Hiring</h1>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["Marketing Strategy", "Content Creation", "Analytics", "Social Media"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* form */}
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* form title */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Application Form
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Fields marked <span className="text-red-400">*</span> are required.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">
            {/* ── core fields ── */}
            <FormGroup
              id="full-name"
              label="Full Name"
              required
              error={errors["full-name"]}
            >
              <input
                id="full-name"
                name="full-name"
                type="text"
                placeholder="Jane Doe"
                className={inputCls(!!errors["full-name"])}
              />
            </FormGroup>

            <FormGroup
              id="email"
              label="Email Address"
              required
              error={errors.email}
            >
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                className={inputCls(!!errors.email)}
              />
            </FormGroup>

            <FormGroup id="phone" label="Phone Number" error={errors.phone}>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+46 70 000 0000"
                className={inputCls(false)}
              />
            </FormGroup>

            <FormGroup
              id="source"
              label="Source (How did you hear about us?)"
              error={errors.source}
            >
              <div className="relative">
                <select
                  id="source"
                  name="source"
                  className={`${inputCls(false)} appearance-none pr-8`}
                >
                  <SourceOptions />
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </FormGroup>

            {/* resume upload */}
            <FormGroup
              id="resume"
              label="Resume / CV"
              required
              error={errors.resume}
              hint="PDF or DOCX · max 5 MB"
            >
              <label
                htmlFor="resume-upload"
                className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
                  fileName
                    ? "border-green-300 bg-green-50"
                    : errors.resume
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Upload
                  size={16}
                  className={
                    fileName ? "text-green-600" : "text-gray-400"
                  }
                />
                <span className="text-sm text-gray-600">
                  {fileName ?? "Click to upload or drag & drop"}
                </span>
                <input
                  id="resume-upload"
                  name="resume"
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) =>
                    setFileName(e.target.files?.[0]?.name ?? null)
                  }
                />
              </label>
            </FormGroup>

            {/* ── custom fields ── */}
            <div className="border-t border-dashed border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Additional Questions
              </p>

              {DEMO_CUSTOM_FIELDS.map((field) => (
                <div key={field.id} className="mb-4">
                  <FormGroup
                    id={field.id}
                    label={field.label}
                    required={field.required}
                    error={errors[field.id]}
                  >
                    {field.type === "dropdown" ? (
                      <div className="relative">
                        <select
                          id={field.id}
                          name={field.id}
                          className={`${inputCls(!!errors[field.id])} appearance-none pr-8`}
                        >
                          <option value="">Select an option…</option>
                          {field.options?.map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    ) : (
                      <input
                        id={field.id}
                        name={field.id}
                        type={field.type === "number" ? "number" : "text"}
                        min={field.type === "number" ? 0 : undefined}
                        className={inputCls(!!errors[field.id])}
                        placeholder={
                          field.type === "number"
                            ? "e.g. 3"
                            : "Your answer…"
                        }
                      />
                    )}
                  </FormGroup>
                </div>
              ))}
            </div>

            {/* ── privacy consent ── */}
            <div
              className={`flex items-start gap-3 p-3 rounded-xl border ${
                errors.privacy
                  ? "border-red-200 bg-red-50"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <input
                id="privacy"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-purple-700 cursor-pointer"
              />
              <label htmlFor="privacy" className="text-sm text-gray-600 cursor-pointer">
                I acknowledge that I have read and agree to the{" "}
                <a href="#" className="text-purple-700 underline hover:no-underline">
                  Data Privacy Policy
                </a>
                .
              </label>
            </div>
            {errors.privacy && (
              <p className="text-xs text-red-500 -mt-3">{errors.privacy}</p>
            )}

            {/* submit */}
            <button
              type="submit"
              disabled={submitState === "submitting"}
              className="w-full py-3 rounded-xl bg-purple-700 text-white font-semibold text-sm hover:bg-purple-800 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitState === "submitting"
                ? "Submitting…"
                : "Submit Application"}
            </button>
          </form>
        </div>

        {/* footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Protected by reCAPTCHA · Powered by PrecioFishbone ATS
        </p>
      </div>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
function inputCls(hasError: boolean) {
  return `w-full rounded-xl border ${
    hasError ? "border-red-300 bg-red-50" : "border-gray-200"
  } px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
    hasError ? "focus:ring-red-300" : "focus:ring-purple-300"
  } transition`;
}

function FormGroup({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && (
          <span className="ml-2 text-xs font-normal text-gray-400">{hint}</span>
        )}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
