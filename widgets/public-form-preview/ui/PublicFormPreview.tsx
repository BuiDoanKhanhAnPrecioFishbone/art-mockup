"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, Loader2, Shield, Sparkles, Upload } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  PROTECTED_FIELD_IDS,
  type ProfileField,
  type Program,
  type PublicFormSettings,
} from "@/entities/program";

/**
 * Applicant-facing preview of a program's Public Form.
 *
 * Renders exactly what the candidate sees, honoring per-field and
 * per-section visibility from `program.publicForm.hiddenFieldIds /
 * hiddenSectionIds`. Used both as the in-app preview (linked from the
 * Public Form tab) and as the apply-flow surface.
 */
export function PublicFormPreview({ programId }: { programId: string }) {
  const { showToast } = useToast();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/programs/${programId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Program not found.");
        const d = await r.json();
        if (cancelled) return;
        setProgram(d.program);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message ?? "Could not load program.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [programId]);

  if (loading) {
    return (
      <Layout>
        <p className="py-12 text-center text-sm text-gray-400">
          Loading application form…
        </p>
      </Layout>
    );
  }
  if (error || !program) {
    return (
      <Layout>
        <p className="py-12 text-center text-sm font-medium text-red-600">
          {error ?? "Program not found."}
        </p>
      </Layout>
    );
  }

  const settings: PublicFormSettings | undefined = program.publicForm;
  const hiddenSectionIds = new Set(settings?.hiddenSectionIds ?? []);
  const hiddenFieldIds = new Set(settings?.hiddenFieldIds ?? []);
  const sections = (program.candidateProfile?.sections ?? []).filter(
    (s) => s.kind !== "skills" && !hiddenSectionIds.has(s.id)
  );

  // Resolve rows per section honoring layout, dropping hidden fields and
  // empty resulting rows.
  function resolveRows(sectionId: string, fields: ProfileField[]): ProfileField[][] {
    const section = program?.candidateProfile?.sections.find(
      (s) => s.id === sectionId
    );
    const layout = section?.layout;
    const visible = fields.filter((f) => !hiddenFieldIds.has(f.id));
    const byId = new Map(visible.map((f) => [f.id, f]));
    if (!layout) return visible.map((f) => [f]);
    const rows: ProfileField[][] = [];
    const seen = new Set<string>();
    for (const row of layout) {
      const cleaned = row
        .map((id) => byId.get(id))
        .filter((f): f is ProfileField => Boolean(f));
      if (cleaned.length === 0) continue;
      cleaned.forEach((f) => seen.add(f.id));
      rows.push(cleaned);
    }
    for (const f of visible) {
      if (!seen.has(f.id)) rows.push([f]);
    }
    return rows;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed || submitting) return;
    setSubmitting(true);
    // Mock submit — pretend to send and flip to success state.
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSubmitted(true);
    showToast("success", "Application submitted (mock).");
  }

  if (submitted) {
    return (
      <Layout>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
          <CheckCircle2 className="mx-auto mb-3 text-green-600" size={42} />
          <h2 className="text-lg font-semibold text-green-900">
            Application received
          </h2>
          <p className="mt-1 text-sm text-green-800">
            Thanks for applying to{" "}
            <strong>{program.title}</strong>. We&rsquo;ll get back to you via
            email at the address provided.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Preview banner */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800">
        <Eye size={13} />
        Applicant preview — this is how candidates see the form.
      </div>

      {/* Program header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {program.title}
        </h1>
        {program.position && (
          <p className="mt-1 text-sm text-gray-600">
            {program.position} · {program.level}
            {program.location ? ` · ${program.location}` : ""}
          </p>
        )}
        {program.description && (
          <p className="mt-3 max-w-2xl text-sm text-gray-700">
            {program.description}
          </p>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
            No sections enabled on this form. Edit the program&rsquo;s
            Public Form settings to choose what the candidate sees.
          </div>
        ) : (
          sections.map((section, idx) => {
            const rows = resolveRows(section.id, section.fields);
            if (rows.length === 0) return null;
            return (
              <section
                key={section.id}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <h2 className="mb-3 text-base font-semibold text-violet-700">
                  {idx + 1}. {section.name}
                </h2>
                <div className="space-y-3">
                  {rows.map((row, ri) => (
                    <div key={ri} className="flex flex-wrap items-end gap-3">
                      {row.map((f) => (
                        <div key={f.id} className="min-w-[180px] flex-1">
                          <PublicFieldInput field={f} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}

        {/* Privacy + submit */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-violet-600"
            />
            I acknowledge that I have read and agree to the{" "}
            <a className="text-violet-700 underline" href="#">
              Data Privacy Policy
            </a>
            .
          </label>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
            <Shield size={12} className="text-violet-500" />
            Protected by Google reCAPTCHA v3 — uploaded files are scanned for
            malware before storage.
          </div>
          <button
            type="submit"
            disabled={!agreed || submitting || sections.length === 0}
            className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </form>
    </Layout>
  );
}

/* ============================================================
 * Layout — branded shell that mimics what an external applicant sees
 * ============================================================ */

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-gray-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 text-white">
            <Sparkles size={16} />
          </div>
          <span className="text-sm font-semibold text-violet-700">
            precio fishbone
          </span>
          <span className="ml-auto text-[11px] text-gray-400">careers</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">{children}</main>
      <footer className="mx-auto max-w-2xl px-6 py-6 text-center text-[11px] text-gray-400">
        © Precio Fishbone · Powered by ART
      </footer>
    </div>
  );
}

/* ============================================================
 * Per-type field renderer — applicant-facing inputs
 * ============================================================ */

function PublicFieldInput({ field }: { field: ProfileField }) {
  const isProtected = PROTECTED_FIELD_IDS.has(field.id);
  const labelEl = (
    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
      {field.label}
      {field.required && <span className="text-red-500">*</span>}
    </label>
  );
  const baseInput =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none";

  switch (field.type) {
    case "textarea":
      return (
        <div>
          {labelEl}
          <textarea
            rows={4}
            placeholder="Type here…"
            className={cn(baseInput, "resize-none")}
          />
        </div>
      );
    case "radio":
      return (
        <div>
          {labelEl}
          <div className="space-y-1">
            {(field.options ?? []).map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="radio"
                  name={field.id}
                  className="accent-violet-600"
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      );
    case "checkbox":
      return (
        <div>
          {labelEl}
          <div className="space-y-1">
            {(field.options ?? []).map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-sm text-gray-700">
                <input type="checkbox" className="accent-violet-600" />
                {o}
              </label>
            ))}
          </div>
        </div>
      );
    case "select":
      return (
        <div>
          {labelEl}
          <select className={baseInput} defaultValue="">
            <option value="" disabled>
              Please select
            </option>
            {(field.options ?? []).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      );
    case "date":
      return (
        <div>
          {labelEl}
          <input type="date" className={baseInput} />
        </div>
      );
    case "time":
      return (
        <div>
          {labelEl}
          <input type="time" className={baseInput} />
        </div>
      );
    case "number":
      return (
        <div>
          {labelEl}
          <input type="number" placeholder="0" className={baseInput} />
        </div>
      );
    case "email":
      return (
        <div>
          {labelEl}
          <input
            type="email"
            placeholder="name@example.com"
            className={baseInput}
          />
        </div>
      );
    case "phone":
      return (
        <div>
          {labelEl}
          <input type="tel" placeholder="+1 555 …" className={baseInput} />
        </div>
      );
    case "url":
      return (
        <div>
          {labelEl}
          <input type="url" placeholder="https://…" className={baseInput} />
        </div>
      );
    case "file":
      return (
        <div>
          {labelEl}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-xs text-gray-600 hover:border-violet-400 hover:bg-violet-50">
            <Upload size={14} className="text-violet-500" />
            <span>
              <strong className="text-violet-700">Click to upload</strong> or
              drag & drop
              {field.allowedFileTypes && field.allowedFileTypes.length > 0 && (
                <>
                  {" · "}
                  {field.allowedFileTypes.join(", ").toUpperCase()}
                </>
              )}
              {field.maxFileSizeMB ? ` (max ${field.maxFileSizeMB} MB)` : ""}
            </span>
            <input type="file" className="hidden" />
          </label>
        </div>
      );
    default:
      return (
        <div>
          {labelEl}
          <input
            type="text"
            placeholder={isProtected ? field.label : "Type here…"}
            className={baseInput}
          />
        </div>
      );
  }
}
