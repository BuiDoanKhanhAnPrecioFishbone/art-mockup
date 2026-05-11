"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Download,
  FileText,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  CANDIDATE_SKILL_TIER_LABEL,
  CANDIDATE_STATUS_LABEL,
  averageSkillScore,
  candidateInitials,
  groupSkillsByTier,
  type Candidate,
  type CandidateEducation,
  type CandidateExperience,
  type CandidateProfileData,
  type CandidateSkill,
  type CandidateSkillTier,
} from "@/entities/candidate";
import { SkillEvaluationModal } from "./SkillEvaluationModal";
import { EditEducationModal } from "./EditEducationModal";
import { EditExperienceModal } from "./EditExperienceModal";
import { DeleteSkillConfirm } from "./DeleteSkillConfirm";
import { PipelineReviewTab } from "./PipelineReviewTab";
import { EmailsTab } from "./EmailsTab";
import { ApplicationHistoryTab as ApplicationHistoryTabReal } from "./ApplicationHistoryTab";
import type {
  CandidateEmailThread,
  CandidateStepProgress,
} from "@/entities/candidate";
import { Eye, EyeOff, MoveRight } from "lucide-react";

type DetailTab =
  | "profile"
  | "pipeline"
  | "emails"
  | "history"
  | "tests"
  | "career"
  | "notes";

const DETAIL_TABS: { id: DetailTab; label: string; badge?: number | string }[] = [
  { id: "profile", label: "Profile" },
  { id: "pipeline", label: "Pipeline & Review" },
  { id: "emails", label: "Emails" },
  { id: "history", label: "Application History" },
  { id: "tests", label: "Tests & Score" },
  { id: "career", label: "Career" },
  { id: "notes", label: "Assessment Notes" },
];

/** Tabs the Candidate role is allowed to see on its own profile.
 *  Pipeline & Review and Assessment Notes are HR-internal (per
 *  `docs/requirements/02-recruitment-program.md` reviewer feedback
 *  is not surfaced to the candidate). Tests & Score and Career fall
 *  back to placeholders for everyone, so we keep them visible. */
const CANDIDATE_VISIBLE_TABS: DetailTab[] = [
  "profile",
  "emails",
  "history",
  "tests",
  "career",
];

export type CandidateDetailViewerMode = "hr" | "candidate";

/** Full Candidate Detail page — wireframe `3228:222166`. Top header
 *  + outer tabs + the Profile tab body (CV preview rail on the left,
 *  numbered sections on the right). Other tabs render placeholder
 *  panels for now.
 *
 *  When `viewerMode === "candidate"` the page reuses the same chrome
 *  but strips every action affordance (Edit / Add / Delete / Move
 *  Step / More Action / navigator / status change), hides reviewer-
 *  internal tabs (Pipeline & Review, Assessment Notes), filters the
 *  Emails tab to only the candidate's own threads, and disables the
 *  outbound "Send Email" button — candidates can read incoming
 *  threads + Reply, nothing more. */
export function CandidateDetailView({
  programId,
  programTitle,
  initialCandidate,
  initialProfile,
  siblingCandidates,
  viewerMode = "hr",
}: {
  programId: string;
  programTitle: string;
  initialCandidate: Candidate;
  initialProfile: CandidateProfileData;
  /** Other candidates in the same program — drives the "4/100" prev /
   *  next navigator + the selection drawer. */
  siblingCandidates: Candidate[];
  viewerMode?: CandidateDetailViewerMode;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<DetailTab>("profile");
  const [profile, setProfile] = useState<CandidateProfileData>(initialProfile);
  const [savingFlag, setSavingFlag] = useState(false);
  const [showCandidateList, setShowCandidateList] = useState(false);
  /** Hide-Preview toggle — collapses the CV preview rail on the
   *  Profile tab. Persisted to localStorage so the choice survives
   *  navigation. */
  const [hidePreview, setHidePreview] = useState(false);
  useEffect(() => {
    try {
      const v = window.localStorage.getItem("candidate-detail:hide-preview");
      if (v === "true") setHidePreview(true);
    } catch {}
  }, []);
  function toggleHidePreview() {
    setHidePreview((cur) => {
      const next = !cur;
      try {
        window.localStorage.setItem(
          "candidate-detail:hide-preview",
          String(next)
        );
      } catch {}
      return next;
    });
  }

  /** Index of this candidate in the program's roster — drives the
   *  "4/100 Candidates" header label and the prev/next arrows. */
  const positionIdx = siblingCandidates.findIndex(
    (c) => c.id === initialCandidate.id
  );
  const total = siblingCandidates.length;
  const prevId =
    positionIdx > 0 ? siblingCandidates[positionIdx - 1].id : null;
  const nextId =
    positionIdx >= 0 && positionIdx < total - 1
      ? siblingCandidates[positionIdx + 1].id
      : null;

  /** Persist a profile patch back to the API. */
  async function persist(patch: Partial<CandidateProfileData>) {
    setSavingFlag(true);
    try {
      const res = await fetch(`/api/candidates/${initialCandidate.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
    } finally {
      setSavingFlag(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header — fixed-height card */}
      <Header
        candidate={initialCandidate}
        profile={profile}
        programId={programId}
        programTitle={programTitle}
        positionIdx={positionIdx}
        total={total}
        prevId={prevId}
        nextId={nextId}
        onShowList={() => setShowCandidateList((v) => !v)}
        hidePreview={hidePreview}
        onToggleHidePreview={toggleHidePreview}
        viewerMode={viewerMode}
      />

      {/* Outer tabs */}
      <nav className="bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 border-b border-gray-200 px-8">
          {DETAIL_TABS.filter((t) =>
            viewerMode === "candidate"
              ? CANDIDATE_VISIBLE_TABS.includes(t.id)
              : true
          ).map((t) => {
            const active = tab === t.id;
            // Count badge for the Emails tab — total threads on the
            // candidate (matches the wireframe's "Emails 3" pill).
            const badge =
              t.id === "emails"
                ? (profile.emailThreads ?? []).length
                : undefined;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "text-violet-700"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {t.label}
                {badge !== undefined && badge > 0 && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-700">
                    {badge}
                  </span>
                )}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-8 py-6">
        {tab === "profile" ? (
          <ProfileBody
            profile={profile}
            hidePreview={hidePreview}
            viewerMode={viewerMode}
            onSaveSkills={(skills) => persist({ skills })}
            onSaveEducation={(education) => persist({ education })}
            onSaveExperience={(experience) => persist({ experience })}
            saving={savingFlag}
          />
        ) : tab === "pipeline" && viewerMode === "hr" ? (
          <PipelineReviewTab
            candidateId={initialCandidate.id}
            candidateName={initialCandidate.name}
            programId={programId}
            profile={profile}
            onSavePipeline={(pipeline: CandidateStepProgress[]) =>
              persist({ pipeline })
            }
            saving={savingFlag}
          />
        ) : tab === "emails" ? (
          <EmailsTab
            threads={filterThreadsForViewer(
              profile.emailThreads ?? [],
              viewerMode,
              profile.general.email
            )}
            candidateName={initialCandidate.name}
            candidateEmail={profile.general.email}
            saving={savingFlag}
            viewerMode={viewerMode}
            onSaveThreads={(emailThreads: CandidateEmailThread[]) =>
              persist({ emailThreads })
            }
          />
        ) : tab === "history" ? (
          <ApplicationHistoryTabReal
            history={profile.applicationHistory ?? []}
            viewerMode={viewerMode}
          />
        ) : tab === "tests" ? (
          <Placeholder
            title="Tests & Score"
            body="Test history and per-skill score breakdown will land here in a follow-up."
          />
        ) : tab === "career" ? (
          <Placeholder
            title="Career"
            body="Past programs the candidate has applied to will land here."
          />
        ) : (
          <Placeholder
            title="Assessment Notes"
            body="Reviewer notes captured against this candidate will land here."
          />
        )}
      </main>

      {/* Candidate selection drawer — HR-only (candidates can't browse
       *  other candidates). */}
      {showCandidateList && viewerMode === "hr" && (
        <CandidateListDrawer
          siblings={siblingCandidates}
          activeId={initialCandidate.id}
          onClose={() => setShowCandidateList(false)}
          onPick={(id) => {
            setShowCandidateList(false);
            router.push(`/programs/${programId}/candidates/${id}`);
          }}
        />
      )}
    </div>
  );
}

/** Email-thread visibility for the candidate. They can see threads
 *  where they were either sender or recipient on at least one
 *  message (e.g. test invitations, interview confirmations, their
 *  own replies). They cannot see internal HR-to-HR threads about
 *  them (e.g. "discussing the candidate's health record"). */
function filterThreadsForViewer(
  threads: CandidateEmailThread[],
  mode: CandidateDetailViewerMode,
  candidateEmail: string
): CandidateEmailThread[] {
  if (mode !== "candidate") return threads;
  const target = candidateEmail.toLowerCase();
  return threads.filter((t) =>
    t.messages.some((m) => {
      if (m.from.toLowerCase() === target) return true;
      if (m.to.some((to) => to.toLowerCase() === target)) return true;
      if (m.cc?.some((cc) => cc.toLowerCase() === target)) return true;
      return false;
    })
  );
}

/* ---------- Header ---------- */

function Header({
  candidate,
  profile,
  programId,
  programTitle,
  positionIdx,
  total,
  prevId,
  nextId,
  onShowList,
  hidePreview,
  onToggleHidePreview,
  viewerMode,
}: {
  candidate: Candidate;
  profile: CandidateProfileData;
  programId: string;
  programTitle: string;
  positionIdx: number;
  total: number;
  prevId: string | null;
  nextId: string | null;
  onShowList: () => void;
  hidePreview: boolean;
  onToggleHidePreview: () => void;
  viewerMode: CandidateDetailViewerMode;
}) {
  const isHr = viewerMode === "hr";
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-8 py-4">
        {/* Breadcrumb — points at HR program detail for HR, the
         *  candidate's own portal for the candidate. */}
        <nav className="text-xs text-gray-500">
          {isHr ? (
            <>
              <Link
                href="/programs"
                className="text-gray-500 underline hover:text-gray-700"
              >
                Programs
              </Link>
              <span className="px-1.5 text-gray-300">/</span>
              <Link
                href={`/programs/${programId}/edit`}
                className="text-violet-600 underline hover:text-violet-800"
              >
                {programTitle}
              </Link>
              <span className="px-1.5 text-gray-300">/</span>
              <span className="font-medium text-gray-900">
                {candidate.name}
              </span>
            </>
          ) : (
            <>
              <Link
                href="/my/applications"
                className="text-gray-500 underline hover:text-gray-700"
              >
                My Applications
              </Link>
              <span className="px-1.5 text-gray-300">/</span>
              <span className="font-medium text-gray-900">My Profile</span>
            </>
          )}
        </nav>

        {/* Title + actions row */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {/* HR: Back-to-Pipeline link. Candidate: nothing extra
           *  (their own profile, no pipeline to back out to). */}
          {isHr && (
            <>
              <Link
                href={`/programs/${programId}/edit?tab=pipelines`}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={13} /> Back to Pipeline
              </Link>
              <span className="text-gray-300">|</span>
            </>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">
            {candidate.name}
          </h1>

          {/* Status chip — clickable for HR (opens change-status), pure
           *  badge for candidate (read-only). */}
          {isHr ? (
            <button
              type="button"
              title="Change status"
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                STATUS_TONE[candidate.status] ?? "bg-gray-200 text-gray-700"
              )}
            >
              {CANDIDATE_STATUS_LABEL[candidate.status]}
              <ChevronDown size={11} />
            </button>
          ) : (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                STATUS_TONE[candidate.status] ?? "bg-gray-200 text-gray-700"
              )}
            >
              {CANDIDATE_STATUS_LABEL[candidate.status]}
            </span>
          )}

          {/* HR-only action cluster: candidate navigator, Hide
           *  Preview, Move Step, More Action. Candidates see none of
           *  these — they can only view their own profile. */}
          {isHr && (
            <div className="ml-auto flex items-center gap-2">
              <Link
                href={
                  prevId
                    ? `/programs/${programId}/candidates/${prevId}`
                    : "#"
                }
                aria-disabled={!prevId}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium",
                  prevId
                    ? "text-gray-700 hover:bg-gray-50"
                    : "cursor-not-allowed text-gray-300"
                )}
              >
                <ArrowLeft size={13} /> Previous
              </Link>
              <button
                type="button"
                onClick={onShowList}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {positionIdx + 1}/{total} Candidates
                <ChevronDown size={12} />
              </button>
              <Link
                href={
                  nextId
                    ? `/programs/${programId}/candidates/${nextId}`
                    : "#"
                }
                aria-disabled={!nextId}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium",
                  nextId
                    ? "text-gray-700 hover:bg-gray-50"
                    : "cursor-not-allowed text-gray-300"
                )}
              >
                Next <ArrowRight size={13} />
              </Link>

              {/* Hide / Show CV preview toggle (wireframe `Hide
               *  Preview`) */}
              <button
                type="button"
                onClick={onToggleHidePreview}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {hidePreview ? <Eye size={12} /> : <EyeOff size={12} />}
                {hidePreview ? "Show Preview" : "Hide Preview"}
              </button>

              {/* Move-Step shortcut (replaces the wireframe's "Hire
               *  Process" — same semantic on this page). */}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
              >
                Move Step <MoveRight size={12} />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                More Action <MoreHorizontal size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Hint row — initials/avatar + email + program */}
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">
            {candidateInitials(candidate.name)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Mail size={12} /> {profile.general.email}
          </span>
        </div>
      </div>
    </div>
  );
}

const STATUS_TONE: Record<Candidate["status"], string> = {
  "on-going": "bg-violet-100 text-violet-700",
  hired: "bg-emerald-100 text-emerald-700",
  completed: "bg-sky-100 text-sky-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-200 text-gray-600",
};

/* ---------- Profile body ---------- */

function ProfileBody({
  profile,
  hidePreview = false,
  viewerMode = "hr",
  onSaveSkills,
  onSaveEducation,
  onSaveExperience,
  saving,
}: {
  profile: CandidateProfileData;
  hidePreview?: boolean;
  viewerMode?: CandidateDetailViewerMode;
  onSaveSkills: (skills: CandidateSkill[]) => void;
  onSaveEducation: (education: CandidateEducation[]) => void;
  onSaveExperience: (experience: CandidateExperience[]) => void;
  saving: boolean;
}) {
  const readOnly = viewerMode === "candidate";
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        hidePreview ? "" : "lg:grid-cols-[280px_1fr]"
      )}
    >
      {/* Left: CV preview rail (collapsed when Hide Preview is on) */}
      {!hidePreview && <CVPreviewRail profile={profile} />}

      {/* Right: stacked sections */}
      <div className="space-y-4">
        <ProfileSectionHeader saving={saving} readOnly={readOnly} />
        <Section1General profile={profile} />
        <Section2Skills
          skills={profile.skills}
          missingSkills={profile.missingSkills}
          unselectedSkills={profile.unselectedSkills}
          onSave={onSaveSkills}
          readOnly={readOnly}
        />
        <Section3Education
          education={profile.education}
          onSave={onSaveEducation}
          readOnly={readOnly}
        />
        <Section4Experiences
          experience={profile.experience}
          onSave={onSaveExperience}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

/* ---------- CV preview rail ---------- */

function CVPreviewRail({ profile }: { profile: CandidateProfileData }) {
  return (
    // `self-start` keeps the card at its natural content height
    // instead of stretching to match the (much taller) Profile column
    // on the right.
    <aside className="self-start rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <FileText size={12} /> CV Preview
        </p>
        {profile.cvUrl && (
          <a
            href={profile.cvUrl}
            download
            className="inline-flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-800"
          >
            <Download size={11} /> Download
          </a>
        )}
      </div>
      {/* Wireframe placeholder — a faux rendered CV. The real product
       *  embeds the original PDF; here we just hint at the layout. */}
      <div className="mt-3 aspect-[3/4] rounded border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 text-[10px] leading-relaxed text-gray-400">
        <div className="flex items-center gap-1 text-[12px] font-semibold leading-none text-gray-700">
          <span>precio</span>
          <span className="text-orange-500">f</span>
          <span>ishbone</span>
        </div>
        <div className="mt-3 h-2 w-3/4 rounded bg-gray-100" />
        <div className="mt-2 h-2 w-2/3 rounded bg-gray-100" />
        <div className="mt-6 space-y-1.5">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded bg-gray-100"
              style={{ width: `${60 + ((i * 7) % 35)}%` }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ---------- Profile section header ---------- */

function ProfileSectionHeader({
  saving,
  readOnly,
}: {
  saving: boolean;
  readOnly: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-base font-semibold text-violet-600">Profile</h2>
      {!readOnly && <Pencil size={13} className="text-gray-400" />}
      {saving && (
        <span className="ml-auto text-xs text-gray-400">Saving…</span>
      )}
    </div>
  );
}

/* ---------- Section 1: General Info ---------- */

function Section1General({ profile }: { profile: CandidateProfileData }) {
  const g = profile.general;
  return (
    <Card title="1. General Info">
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-3">
        <Field label="Full Name" value={g.fullName} />
        <Field label="Email" value={g.email} />
        <Field label="Source" value={g.source ?? "—"} />
        <Field label="Date of Birth" value={g.dateOfBirth ?? "—"} />
        <Field label="Phone" value={g.phone ?? "—"} />
        <Field label="Location" value={g.location ?? "—"} />
        <Field label="Portfolio" value={g.portfolio ?? "—"} />
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900">{value}</p>
    </div>
  );
}

/* ---------- Section 2: Skills ---------- */

function Section2Skills({
  skills,
  missingSkills,
  unselectedSkills,
  onSave,
  readOnly = false,
}: {
  skills: CandidateSkill[];
  missingSkills: { name: string; tier: CandidateSkillTier }[];
  unselectedSkills: string[];
  onSave: (next: CandidateSkill[]) => void;
  readOnly?: boolean;
}) {
  const [evalOpen, setEvalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<CandidateSkill | null>(
    null
  );
  const grouped = useMemo(() => groupSkillsByTier(skills), [skills]);
  const score = averageSkillScore(skills);
  const missingByTier = useMemo(() => {
    const out: Record<CandidateSkillTier, string[]> = {
      "must-have": [],
      "nice-to-have": [],
      bonus: [],
    };
    for (const m of missingSkills) out[m.tier].push(m.name);
    return out;
  }, [missingSkills]);

  function removeSkill(skill: CandidateSkill) {
    if (skill.score > 0) {
      setConfirmDelete(skill);
      return;
    }
    onSave(skills.filter((s) => s.id !== skill.id));
  }

  // Reviewer-rated bands (Missing Skills + per-skill scores) are
  // HR-internal — when a candidate is viewing their own profile we
  // hide them entirely and reduce the section to a chip list with no
  // scores.
  const showReviewerSignals = !readOnly;
  return (
    <Card
      title="2. Skills"
      action={
        readOnly ? null : (
          <button
            type="button"
            onClick={() => setEvalOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
          >
            <Pencil size={11} /> Add Skill Evaluation
          </button>
        )
      }
    >
      <div
        className={cn(
          "grid grid-cols-1 gap-6",
          showReviewerSignals ? "md:grid-cols-[160px_1fr]" : ""
        )}
      >
        {/* Score gauge — HR-only signal. */}
        {showReviewerSignals && <ScoreGauge percent={score} />}

        {/* Selected by tier */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {readOnly ? "My skills" : "Selected Evaluation"}
          </h4>
          <div className="mt-2 space-y-2">
            {(["must-have", "nice-to-have", "bonus"] as CandidateSkillTier[]).map(
              (tier) => (
                <SkillTierRow
                  key={tier}
                  tier={tier}
                  skills={grouped[tier]}
                  onRemove={removeSkill}
                  readOnly={readOnly}
                />
              )
            )}
          </div>

          {/* Missing skills — HR-only. */}
          {showReviewerSignals &&
            (missingByTier["must-have"].length > 0 ||
              missingByTier["nice-to-have"].length > 0 ||
              missingByTier.bonus.length > 0) && (
              <>
                <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Missing Skills
                </h4>
                <div className="mt-2 space-y-2">
                  {(
                    ["must-have", "nice-to-have", "bonus"] as CandidateSkillTier[]
                  )
                    .filter((t) => missingByTier[t].length > 0)
                    .map((tier) => (
                      <MissingTierRow
                        key={tier}
                        tier={tier}
                        names={missingByTier[tier]}
                      />
                    ))}
                </div>
              </>
            )}

          {/* Unselected skills */}
          {unselectedSkills.length > 0 && (
            <>
              <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Unselected Skills
                <span className="ml-1 text-gray-400">
                  ({unselectedSkills.length})
                </span>
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {unselectedSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600"
                  >
                    {s}
                    {!readOnly && (
                      <button
                        type="button"
                        title="Remove"
                        className="text-gray-300 hover:text-red-500"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {evalOpen && !readOnly && (
        <SkillEvaluationModal
          skills={skills}
          onSave={(next) => {
            onSave(next);
            setEvalOpen(false);
          }}
          onClose={() => setEvalOpen(false)}
        />
      )}
      {confirmDelete && !readOnly && (
        <DeleteSkillConfirm
          onConfirm={() => {
            onSave(skills.filter((s) => s.id !== confirmDelete.id));
            setConfirmDelete(null);
          }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </Card>
  );
}

function ScoreGauge({ percent }: { percent: number }) {
  const tone =
    percent >= 80
      ? "text-emerald-500 bg-emerald-100"
      : percent >= 60
        ? "text-amber-500 bg-amber-100"
        : "text-red-500 bg-red-100";
  // Conic-gradient gauge — the inner circle hides the centre.
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative grid h-32 w-32 place-items-center rounded-full"
        style={{
          background: `conic-gradient(currentColor ${percent}%, #e5e7eb ${percent}%)`,
          color:
            percent >= 80
              ? "#10b981"
              : percent >= 60
                ? "#f59e0b"
                : "#ef4444",
        }}
      >
        <div className="grid h-24 w-24 place-items-center rounded-full bg-white">
          <p className="text-2xl font-semibold text-gray-900 tabular-nums">
            {percent}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Average
          </p>
        </div>
      </div>
      <span
        className={cn(
          "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
          tone
        )}
      >
        {percent >= 80
          ? "Strong"
          : percent >= 60
            ? "Average"
            : "Weak"}
      </span>
    </div>
  );
}

function SkillTierRow({
  tier,
  skills,
  onRemove,
  readOnly = false,
}: {
  tier: CandidateSkillTier;
  skills: CandidateSkill[];
  onRemove: (s: CandidateSkill) => void;
  readOnly?: boolean;
}) {
  if (skills.length === 0) return null;
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
          TIER_DOT[tier]
        )}
      >
        ●
      </span>
      <div>
        <p className="text-[11px] font-medium text-gray-500">
          {CANDIDATE_SKILL_TIER_LABEL[tier]}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <SkillChip
              key={s.id}
              skill={s}
              onRemove={() => onRemove(s)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillChip({
  skill,
  onRemove,
  readOnly = false,
}: {
  skill: CandidateSkill;
  onRemove: () => void;
  readOnly?: boolean;
}) {
  const rated = skill.score > 0;
  // Per-skill score badge is reviewer-rated → hidden from the
  // candidate. Remove (X) button also hidden in readOnly mode.
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
        rated && !readOnly
          ? "bg-violet-100 text-violet-700"
          : readOnly
            ? "bg-gray-100 text-gray-700"
            : "border border-dashed border-gray-300 bg-white text-gray-500"
      )}
    >
      {skill.name}
      {rated && !readOnly && (
        <span className="inline-flex items-center gap-0.5 text-amber-500">
          <Star size={9} fill="currentColor" /> {skill.score}
        </span>
      )}
      {!readOnly && (
        <button
          type="button"
          onClick={onRemove}
          className="text-violet-400 hover:text-red-500"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

const TIER_DOT: Record<CandidateSkillTier, string> = {
  "must-have": "bg-violet-500 text-violet-500",
  "nice-to-have": "bg-amber-500 text-amber-500",
  bonus: "bg-emerald-500 text-emerald-500",
};

function MissingTierRow({
  tier,
  names,
}: {
  tier: CandidateSkillTier;
  names: string[];
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
          TIER_DOT[tier]
        )}
      >
        ●
      </span>
      <div>
        <p className="text-[11px] font-medium text-gray-500">
          {CANDIDATE_SKILL_TIER_LABEL[tier]}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {names.map((n) => (
            <span
              key={n}
              className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600"
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Section 3: Education ---------- */

function Section3Education({
  education,
  onSave,
  readOnly = false,
}: {
  education: CandidateEducation[];
  onSave: (next: CandidateEducation[]) => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState<CandidateEducation | null | "new">(
    null
  );

  function commit(entry: CandidateEducation) {
    const exists = education.some((e) => e.id === entry.id);
    onSave(
      exists
        ? education.map((e) => (e.id === entry.id ? entry : e))
        : [...education, entry]
    );
    setEditing(null);
  }

  function remove(id: string) {
    onSave(education.filter((e) => e.id !== id));
  }

  return (
    <Card
      title="3. Education"
      action={
        readOnly ? null : (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
          >
            <Plus size={11} /> Add
          </button>
        )
      }
    >
      {education.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-500">
          No education entries yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {education.map((ed) => (
            <li
              key={ed.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">School / Institution</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ed.institution}
                  </p>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      type="button"
                      onClick={() => setEditing(ed)}
                      className="rounded p-1 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(ed.id)}
                      className="rounded p-1 hover:bg-gray-50 hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label="Degree / Level" value={ed.degreeLevel || "—"} />
                <Field label="Major" value={ed.major || "—"} />
                <Field
                  label="Duration"
                  value={formatDateRange(ed.startDate, ed.endDate)}
                />
                <div className="md:col-span-3">
                  <Field label="Link" value={ed.link || "—"} />
                </div>
                <div className="md:col-span-3">
                  <Field
                    label="Description"
                    value={ed.description || "—"}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <EditEducationModal
          initial={editing === "new" ? null : editing}
          onSave={commit}
          onClose={() => setEditing(null)}
        />
      )}
    </Card>
  );
}

/* ---------- Section 4: Experiences ---------- */

function Section4Experiences({
  experience,
  onSave,
  readOnly = false,
}: {
  experience: CandidateExperience[];
  onSave: (next: CandidateExperience[]) => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState<CandidateExperience | null | "new">(
    null
  );

  function commit(entry: CandidateExperience) {
    const exists = experience.some((e) => e.id === entry.id);
    onSave(
      exists
        ? experience.map((e) => (e.id === entry.id ? entry : e))
        : [...experience, entry]
    );
    setEditing(null);
  }

  function remove(id: string) {
    onSave(experience.filter((e) => e.id !== id));
  }

  return (
    <Card
      title="4. Experiences"
      action={
        readOnly ? null : (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
          >
            <Plus size={11} /> Add
          </button>
        )
      }
    >
      {experience.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-500">
          No experience entries yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {experience.map((ex) => (
            <li
              key={ex.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">Project Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ex.projectName}
                  </p>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      type="button"
                      onClick={() => setEditing(ex)}
                      className="rounded p-1 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(ex.id)}
                      className="rounded p-1 hover:bg-gray-50 hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                <Field label="Company / Organization" value={ex.company || "—"} />
                <Field label="Role" value={ex.role || "—"} />
                <Field label="Location" value={ex.location || "—"} />
                <Field
                  label="Headcount"
                  value={ex.headcount?.toString() ?? "—"}
                />
                <Field
                  label="Duration"
                  value={formatDateRange(ex.startDate, ex.endDate)}
                />
                <div className="md:col-span-4">
                  <Field label="Link" value={ex.link || "—"} />
                </div>
                <div className="md:col-span-4">
                  <Field label="Description" value={ex.description || "—"} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <EditExperienceModal
          initial={editing === "new" ? null : editing}
          onSave={commit}
          onClose={() => setEditing(null)}
        />
      )}
    </Card>
  );
}

/* ---------- Shared primitives ---------- */

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-violet-600">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{body}</p>
    </div>
  );
}

/* ---------- Candidate selection drawer ---------- */

function CandidateListDrawer({
  siblings,
  activeId,
  onClose,
  onPick,
}: {
  siblings: Candidate[];
  activeId: string;
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 p-6"
      onClick={onClose}
    >
      <div
        className="mt-16 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">
            {siblings.length} Candidates
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
        <ul className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
          {siblings.map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onPick(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-violet-50 text-violet-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold",
                      active
                        ? "bg-violet-200 text-violet-800"
                        : "bg-gray-200 text-gray-700"
                    )}
                  >
                    {candidateInitials(c.name)}
                  </span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-[11px] text-gray-400">
                    {c.email}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return "—";
  const fmt = (s?: string) => {
    if (!s) return "—";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  return `${fmt(start)} → ${fmt(end)}`;
}
