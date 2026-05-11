"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock, Pencil, AlertTriangle, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import type { Program } from "@/entities/program";
import type { SystemRole } from "@/entities/system-role";
import { useViewingRole } from "@/shared/lib/viewing-role";
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
import {
  ProgramSessionsHRTab,
  ProgramSessionsTab,
} from "@/widgets/program-sessions";

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
  /** When the user is on an existing program, every Settings sub-tab
   *  starts in view mode. They click the per-tab Edit button to open
   *  THIS settings tab for editing — the others stay read-only. Save
   *  PATCHes only this tab's slice; Cancel reverts to the snapshot. */
  const [editingSettingsTab, setEditingSettingsTab] =
    useState<SettingsTab | null>(null);
  const [tabSnapshot, setTabSnapshot] = useState<ProgramDraft | null>(null);
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
   *  mutated when in demo mode — the sample is purely visual.
   *  Memoised so that when showFilled is on, we don't churn out a fresh
   *  sample object reference every parent render (which would force the
   *  whole tab subtree to re-render needlessly and could mask edits). */
  const displayDraft = useMemo(
    () => (showFilled ? getSampleDraft() : draft),
    [showFilled, draft]
  );

  function patch(updates: Partial<ProgramDraft>) {
    // If user is in "Filled data" demo mode and tries to edit something,
    // automatically flip it off and apply the edit. Previously we
    // silently dropped these patches, which made it look like edits
    // weren't syncing between tabs — the demo overlay was masking them.
    if (showFilled) {
      setShowFilled(false);
    }
    // For existing programs, the user must have explicitly clicked
    // "Edit [tab]" before any patches land. Outside of Settings tabs
    // (e.g. Pipelines) this guard doesn't apply.
    //
    // Workflow is the exception: it has its own per-step Edit / Save
    // model (you click Edit on a step panel to change a criterion, etc.)
    // independent of the tab-level Edit toggle that gates drag-drop. So
    // workflow patches are always allowed; the user explicitly opted in
    // by entering step-edit mode.
    if (
      mode === "edit" &&
      programTab === "settings" &&
      settingsTab !== "workflow" &&
      editingSettingsTab !== settingsTab
    ) {
      return;
    }
    setDraft((d) => ({ ...d, ...updates }));
  }

  /** Pipelines / Emails / Reports are only meaningful once a program exists
   *  with applicants and live data — for a draft (new program) we lock them
   *  and force the user into Settings. */
  function isProgramTabAvailable(tab: ProgramTab): boolean {
    if (tab === "settings") return true;
    return mode === "edit";
  }

  // Role-aware outer-tab filtering. The viewing-role pattern (see
  // `docs/requirements/12-viewing-role-pattern.md`) drives which
  // tabs each role sees on a program detail. Reviewers, per the
  // wireframe, only see Sessions; Standard Users get a read-only
  // subset; Admin / Manager / Recruiter see everything.
  const [roles, setRoles] = useState<SystemRole[]>([]);
  useEffect(() => {
    fetch("/api/system-roles")
      .then((r) => r.json())
      .then((d) => setRoles(d.roles ?? []))
      .catch(() => setRoles([]));
  }, []);
  const { roleId } = useViewingRole(roles);
  const visibleTabIds = useMemo<ProgramTab[]>(() => {
    switch (roleId) {
      case "role-reviewer":
        return ["sessions"];
      case "role-candidate":
        return [];
      case "role-standard-user":
        return ["pipelines", "sessions", "reports"];
      default:
        // Admin / Manager / Recruiter — full access.
        return ["pipelines", "cv-tracking", "sessions", "emails", "reports", "settings"];
    }
  }, [roleId]);
  const visibleProgramTabs = PROGRAM_TABS.filter((t) =>
    visibleTabIds.includes(t.id)
  );

  // If the active tab is hidden for this role, snap back to the first
  // visible one so the user isn't stuck staring at an empty body.
  useEffect(() => {
    if (visibleTabIds.length === 0) return;
    if (!visibleTabIds.includes(programTab)) {
      setProgramTab(visibleTabIds[0]);
    }
  }, [visibleTabIds, programTab]);

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

  /** "New Program" flow → show the global Cancel + Save Draft + Save &
   *  Publish bar across the top. "Edit existing" flow → switch to a
   *  per-tab Edit / Cancel / Save model on each Settings sub-tab. */
  const showCreateSaveBar = mode === "new" && programTab === "settings";
  const showPerTabEdit = mode === "edit" && programTab === "settings";

  function enterEditTab() {
    setTabSnapshot(draft);
    setEditingSettingsTab(settingsTab);
  }
  function cancelEditTab() {
    if (tabSnapshot) setDraft(tabSnapshot);
    setTabSnapshot(null);
    setEditingSettingsTab(null);
  }
  async function saveEditTab() {
    if (!initialProgram) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/programs/${initialProgram.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error ?? "Save failed.");
        return;
      }
      showToast("success", `${SETTINGS_TABS.find((t) => t.id === editingSettingsTab)?.label ?? "Tab"} saved.`);
      setTabSnapshot(null);
      setEditingSettingsTab(null);
    } finally {
      setSaving(false);
    }
  }

  /** When the user switches Settings sub-tab while one is in edit mode,
   *  snap back to view (revert pending changes) so they don't leak. */
  function changeSettingsTab(t: SettingsTab) {
    if (editingSettingsTab && editingSettingsTab !== t) {
      cancelEditTab();
    }
    setSettingsTab(t);
  }

  const isCurrentTabEditing =
    showPerTabEdit && editingSettingsTab === settingsTab;
  const tabReadOnly = showPerTabEdit && !isCurrentTabEditing;

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
              {showCreateSaveBar && (
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
              {/* The per-tab Edit / Cancel / Save buttons live INSIDE
               *  each Settings tab's content header (rendered by
               *  SettingsLayout), not up here. The page header is kept
               *  simple: title + status + (create-only) save bar. */}
            </div>
          </div>
        </div>

        {/* Outer tab nav. The visible tab set is filtered by the
         *  active viewing role (Reviewer = Sessions only, Standard
         *  User = read-only subset, Admin / Manager / Recruiter =
         *  everything). */}
        <div className="px-8">
          <nav className="flex gap-1">
            {visibleProgramTabs.map((tab) => {
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
          onChangeTab={changeSettingsTab}
          draft={displayDraft}
          onPatch={patch}
          initialProgram={initialProgram}
          // Read-only when previewing demo data, OR when in edit-an-
          // existing-program mode and the user hasn't clicked Edit on
          // this specific sub-tab yet.
          readOnly={showFilled || tabReadOnly}
          // Per-tab Edit / Cancel / Save controls live in the tab's
          // own content header — only enabled in edit-an-existing
          // mode (the create flow uses the global save bar instead).
          showPerTabEdit={showPerTabEdit}
          isCurrentTabEditing={isCurrentTabEditing}
          saving={saving}
          onEnterEdit={enterEditTab}
          onCancelEdit={cancelEditTab}
          onSaveEdit={saveEditTab}
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
      ) : programTab === "sessions" && initialProgram ? (
        <div className="px-8 py-6">
          {/* Reviewer = compact per-session row list (the wireframe's
           *  Reviewer view). HR / Admin / Manager / Recruiter /
           *  Standard User get the rich stage-grouped layout with
           *  Composition + Status badges and Review-Process bars. */}
          {roleId === "role-reviewer" ? (
            <ProgramSessionsTab programId={initialProgram.id} />
          ) : (
            <ProgramSessionsHRTab
              programId={initialProgram.id}
              canCreate={roleId !== "role-standard-user"}
            />
          )}
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
  showPerTabEdit,
  isCurrentTabEditing,
  saving,
  onEnterEdit,
  onCancelEdit,
  onSaveEdit,
}: {
  activeTab: SettingsTab;
  onChangeTab: (t: SettingsTab) => void;
  draft: ProgramDraft;
  onPatch: (updates: Partial<ProgramDraft>) => void;
  initialProgram?: Program;
  readOnly: boolean;
  showPerTabEdit?: boolean;
  isCurrentTabEditing?: boolean;
  saving?: boolean;
  onEnterEdit?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
}) {
  const activeTabLabel =
    SETTINGS_TABS.find((t) => t.id === activeTab)?.label ?? "";
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
        {/* Per-tab Edit / Cancel / Save bar — anchored at the top of
         *  each Settings sub-tab's content. Only shown for existing
         *  programs (the create flow uses the global save bar above). */}
        {showPerTabEdit && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-violet-700">
                {activeTabLabel}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  isCurrentTabEditing
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {isCurrentTabEditing ? "Edit mode" : "View mode"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isCurrentTabEditing ? (
                <button
                  onClick={onEnterEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  <Pencil size={13} />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={onCancelEdit}
                    disabled={saving}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSaveEdit}
                    disabled={saving}
                    className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {/* Single amber lock-warning banner across the top of the
         *  inner content pane — appears on every Settings sub-tab.
         *  Source-of-truth rules in `07-sessions.md` §7.6: while the
         *  program is in its active hiring period, only time-related
         *  settings (Hiring Period dates, session end-time extensions)
         *  may change. The user can dismiss it for the session. */}
        <SettingsLockedBanner />

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
              readOnly={readOnly}
            />
          )}
          {activeTab === "workflow" && (
            <WorkflowTab
              draft={draft}
              onChange={onPatch}
              readOnly={readOnly}
            />
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

/* ---------------------------------------------------------------- */
/*  Settings-locked banner                                           */
/*                                                                   */
/*  Single amber bar across the top of the Settings tab body — same  */
/*  copy on every sub-tab. Surfaces the rule from `07-sessions.md`   */
/*  §7.6: while the program is in its active hiring period, only     */
/*  time-related settings can be modified. Dismissible per session.  */
/* ---------------------------------------------------------------- */

function SettingsLockedBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      className="mb-4 flex items-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-sm text-gray-900"
      role="note"
    >
      <AlertTriangle size={14} className="shrink-0 text-gray-900" />
      <p className="flex-1">
        Settings are locked during the active hiring period. Only
        time-related settings can be modified.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        title="Dismiss"
        className="shrink-0 rounded p-0.5 text-gray-700 hover:bg-amber-400/40"
      >
        <X size={14} />
      </button>
    </div>
  );
}
