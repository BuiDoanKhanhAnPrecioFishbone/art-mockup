"use client";

import { useEffect, useState } from "react";
import { CandidateDetailView } from "@/widgets/candidate-detail";
import type { Candidate, CandidateProfileData } from "@/entities/candidate";

interface ApplicationRow {
  candidateId: string;
  program: { id: string; title: string };
  status: Candidate["status"];
}

interface MyMeResponse {
  candidate: { id: string; name: string; email: string };
  profile: CandidateProfileData;
  applications: ApplicationRow[];
}

/** Candidate self-service profile. Renders the same `CandidateDetailView`
 *  HR uses — but flipped to `viewerMode="candidate"` so every action
 *  affordance (Move Step, More Action, Edit / Add / Delete, Compare,
 *  Send Email, etc.) is stripped and the Pipeline & Review +
 *  Assessment Notes tabs are hidden. Candidate can view + reply, that's
 *  it. */
export default function MyProfilePage() {
  const [me, setMe] = useState<MyMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/my/me")
      .then((r) => r.json())
      .then((d) => setMe(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !me) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-12 text-sm text-gray-400">
        Loading your profile…
      </div>
    );
  }

  // Synthesise a minimal Candidate row from the /me payload — the
  // detail view only uses name / email / status / programId for chrome
  // pieces (avatar initials, status pill, breadcrumb link target).
  const primary = me.applications[0];
  const candidate: Candidate = {
    id: me.candidate.id,
    programId: primary?.program.id ?? "",
    name: me.candidate.name,
    email: me.candidate.email,
    status: primary?.status ?? "on-going",
    skillsMatchPercent: 0,
    currentStageId: "",
    currentStepId: "",
    reviewerIds: [],
    pendingEmailCount: 0,
    hasNote: false,
  };

  return (
    <CandidateDetailView
      programId={primary?.program.id ?? ""}
      programTitle={primary?.program.title ?? "—"}
      initialCandidate={candidate}
      initialProfile={me.profile}
      siblingCandidates={[]}
      viewerMode="candidate"
    />
  );
}
