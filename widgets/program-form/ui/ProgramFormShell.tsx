"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import type { Program } from "@/entities/program";
import {
  PROGRAM_TABS,
  SETTINGS_TABS,
  getSampleDraft,
  programToDraft,
  validateForDraft,
  validateForPublish,
  type ProgramDraft,
  type ProgramTab,
  type SettingsTab,
} from "../model/types";
import { CandidateProfileTab } from "./tabs/CandidateProfileTab";
import { ProgramInfoTab } from "./tabs/ProgramInfoTab";
import { PublicFormTab } from "./tabs/PublicFormTab";
import { TabPlaceholder } from "./tabs/TabPlaceholder";
import { WorkflowTab } from "./tabs/WorkflowTab";
import { PipelineTab } from "@/widgets/program-pipeline";
import { CVTrackingTab } from "@/widgets/program-cv-tracking";
import { EmailsTab } from "@/widgets/program-emails";

type Mode = "new" | "edit";

interface ProgramFormShellProps {
  mode: Mode;
  initialProgram?: Program;
  cloneTitleSuffix?: string;
}

export function ProgramFormShell({
  mode,
  initialProgram,
  cloneTitleSuffix,
}: ProgramFormShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  // Allow callers to deep-link to a specific outer tab via ?tab=… (e.g.
  // "View Applicants" on the program card lands on the Pipelines tab).
  const initialTab: ProgramTab = (() => {
    const t = searchParams?.get("tab");
    if (
      t === "pipelines" ||
      t === "cv-tracking" ||
      t === "emails" ||
      t === "reports" ||
      t === "settings"
    ) {
      return t;
    }
    return "settings";
  })();
  const [programTab, setProgramTab] = useState<ProgramTab>(initialTab);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("program-info");
  const [saving, setSaving] = useState(false);
  /** Demo overlay — shows a fully populated sample draft (read-only) so the
   *  user can quickly walk a customer through what the filled form looks
   *  like. Toggling off restores the real draft untouched. */
  const [showFilled, setShowFilled] = useState(false);

  const [draft, setDraft] = useState<ProgramDraft>(() => {
    if (!initialProgram) {
      // New programs land on a fully populated sample draft so the form
      // is never staring back at the user with empty fields. They can
      // overwrite anything; the Filled data toggle still lets them
      // jump back to the canonical sample for reference.
      return getSampleDraft();
    }
    const base = programToDraft(initialProgram);
    if (cloneTitleSuffix) {
      return { ...base, title: `${base.title}${cloneTitleSuffix}`, status: "draft" };
    }
    return base;
  });

  /** What gets passed to the tabs for rendering. The real draft is never
   *  mutated when in demo mode — the sample is purely visual. */
  const displayDraft = showFilled ? getSampleDraft() : draft;

  function patch(updates: Partial<ProgramDraft>) {
    // In demo / read-only mode we silently drop edits so accidental clicks on
    // delete / add / etc. don't pollute the real draft.
    if (showFilled) return;
    setDraft((d) => ({ ...d, ...updates }));
  }

  /** Pipelines / Emails / Reports are only meaningful once a program exists
   *  with applicants and live data — for a draft (new program) we lock them
   *  and force the user into Settings. */
  function isProgramTabAvailable(tab: ProgramTab): boolean {
    if (tab === "settings") return true;
    return mode === "edit";
  }

  async function save(intent: "draft" | "publish") {
    const issues =
      intent === "publish" ? validateForPublish(draft) : validateForDraft(draft);
    if (issues.length > 0) {
      showToast("error", issues[0].message);
      return;
    }
    setSaving(true);
    const payload = {
      ...draft,
      status: intent === "publish" ? "active" : "draft",
    };
    try {
      let res: Response;
      if (mode === "edit" && initialProgram) {
        res = await fetch(`/api/programs/${initialProgram.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/programs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error ?? "Save failed.");
        return;
      }
      showToast(
        "success",
        intent === "publish"
          ? `Program "${draft.title}" is published.`
          : `Draft saved.`
      );
      router.push("/programs");
    } finally {
      setSaving(false);
    }
  }

  const headerTitle =
    mode === "edit"
      ? draft.title || initialProgram?.title || "Edit Program"
      : draft.title || "New Program";

  const showSaveBar = programTab === "settings";

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-5">
          <button
            onClick={() => router.push("/programs")}
            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={14} />
            Programs
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {headerTitle}
              </h1>
              <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {mode === "new"
                  ? "Draft"
                  : draft.status === "active"
                    ? "Active"
                    : draft.status === "closed"
                      ? "Closed"
                      : "Draft"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Demo toggle — only shown on the Create New Program flow.
               *  Lets the recruiter snap back to the canonical sample
               *  draft after they've started overwriting fields. Hidden
               *  in edit mode, where the program already has real data. */}
              {mode === "new" && (
                <label
                  className={cn(
                    "mr-1 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    showFilled
                      ? "border-violet-300 bg-violet-50 text-violet-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  )}
                  title="Show the canonical pre-filled sample — read-only preview."
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showFilled}
                    onClick={() => setShowFilled((v) => !v)}
                    className={cn(
                      "relative inline-flex h-4 w-7 items-center rounded-full transition",
                      showFilled ? "bg-violet-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-3 w-3 transform rounded-full bg-white shadow transition",
                        showFilled ? "translate-x-3.5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                  Filled data
                </label>
              )}
              {showSaveBar && (
                <>
                  <button
                    onClick={() => router.push("/programs")}
                    disabled={saving}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => save("draft")}
                    disabled={saving || showFilled}
                    title={showFilled ? "Disabled while previewing demo data." : undefined}
                    className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => save("publish")}
                    disabled={saving || showFilled}
                    title={showFilled ? "Disabled while previewing demo data." : undefined}
                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    Save & Publish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Outer tab nav (Pipelines / Emails / Reports / Settings) */}
        <div className="px-8">
          <nav className="flex gap-1">
            {PROGRAM_TABS.map((tab) => {
              const available = isProgramTabAvailable(tab.id);
              const active = programTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => available && setProgramTab(tab.id)}
                  disabled={!available}
                  title={
                    !available
                      ? "Available after the program is published."
                      : undefined
                  }
                  className={cn(
                    "relative inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "text-violet-700"
                      : available
                        ? "text-gray-500 hover:text-gray-700"
                        : "cursor-not-allowed text-gray-300"
                  )}
                >
                  {tab.label}
                  {!available && <Lock size={11} />}
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Outer tab content */}
      {programTab === "settings" ? (
        <SettingsLayout
          activeTab={settingsTab}
          onChangeTab={setSettingsTab}
          draft={displayDraft}
          onPatch={patch}
          initialProgram={initialProgram}
          readOnly={showFilled}
        />
      ) : programTab === "pipelines" && initialProgram ? (
        <div className="px-8 py-6">
          <PipelineTab
            program={
              showFilled
                ? // Overlay the sample workflow onto the saved program so
                  // pipeline stages render in demo mode even when the real
                  // program hasn't configured a workflow yet.
                  { ...initialProgram, workflow: displayDraft.workflow }
                : initialProgram
            }
          />
        </div>
      ) : programTab === "cv-tracking" && initialProgram ? (
        <div className="px-8 py-6">
          <CVTrackingTab
            program={
              showFilled
                ? { ...initialProgram, workflow: displayDraft.workflow }
                : initialProgram
            }
          />
        </div>
      ) : programTab === "emails" && initialProgram ? (
        <div className="px-8 py-6">
          <EmailsTab
            program={
              showFilled
                ? { ...initialProgram, workflow: displayDraft.workflow }
                : initialProgram
            }
          />
        </div>
      ) : (
        <div className="px-8 py-6">
          <TabPlaceholder
            title={PROGRAM_TABS.find((t) => t.id === programTab)?.label ?? ""}
            description={
              programTab === "emails"
                ? "Sent / scheduled email log for this program with delivery status."
                : "Funnel metrics, time-to-hire, source performance, scorecard distributions."
            }
          />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- */
/* Settings layout — left vertical rail + tab content             */
/* -------------------------------------------------------------- */

function SettingsLayout({
  activeTab,
  onChangeTab,
  draft,
  onPatch,
  initialProgram,
  readOnly,
}: {
  activeTab: SettingsTab;
  onChangeTab: (t: SettingsTab) => void;
  draft: ProgramDraft;
  onPatch: (updates: Partial<ProgramDraft>) => void;
  initialProgram?: Program;
  readOnly: boolean;
}) {
  return (
    <div className="flex">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <p className="px-5 pt-5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Settings
        </p>
        <nav className="mt-2 flex flex-col">
          {SETTINGS_TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={cn(
                  "relative px-5 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "bg-violet-50 font-semibold text-violet-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {active && (
                  <span className="absolute inset-y-1 left-0 w-0.5 rounded-r bg-violet-600" />
                )}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="relative flex-1 min-w-0 px-8 py-6">
        {/* In read-only / demo mode we disable text-input editing via CSS but
         *  KEEP buttons clickable so users can expand/collapse sections,
         *  switch tabs, open menus, and explore the populated structure.
         *  All onPatch calls are silently dropped at the parent level, so
         *  any destructive button (delete / clear) is a safe no-op. */}
        <div
          className={cn(
            readOnly &&
              "select-none [&_input:not([role='switch'])]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none [&_input]:cursor-default [&_select]:cursor-default [&_textarea]:cursor-default"
          )}
        >
          {activeTab === "program-info" && (
            <ProgramInfoTab draft={draft} onChange={onPatch} />
          )}
          {activeTab === "candidate-profile" && (
            <CandidateProfileTab draft={draft} onChange={onPatch} />
          )}
          {activeTab === "public-form" && (
            <PublicFormTab
              draft={draft}
              onChange={onPatch}
              programId={initialProgram?.id}
            />
          )}
          {activeTab === "workflow" && (
            <WorkflowTab draft={draft} onChange={onPatch} />
          )}
        </div>
        {readOnly && (
          <div className="pointer-events-none absolute right-12 top-2 rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 shadow-sm">
            Demo data — read-only
          </div>
        )}
      </div>
    </div>
  );
}
