import { notFound } from "next/navigation";
import { getProgram } from "@/entities/program/api/fixtures";
import { getCandidate, listCandidates } from "@/entities/candidate/api/fixtures";
import {
  defaultProfileFor,
  getCandidateProfile,
} from "@/entities/candidate/api/profile-fixtures";
import { CandidateDetailView } from "@/widgets/candidate-detail";

/** Full Candidate Detail page — wireframe `3228:222166`. Routed under
 *  the program so the breadcrumb / siblings reflect the candidate's
 *  current program context. */
export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string; candidateId: string }>;
}) {
  const { id, candidateId } = await params;
  const program = getProgram(id);
  const candidate = getCandidate(candidateId);
  if (!program || !candidate) notFound();
  if (candidate.programId !== id) notFound();
  const profile =
    getCandidateProfile(candidateId) ??
    defaultProfileFor(candidateId, candidate.name, candidate.email);
  const siblings = listCandidates(id);
  return (
    <CandidateDetailView
      programId={id}
      programTitle={program.title}
      initialCandidate={candidate}
      initialProfile={profile}
      siblingCandidates={siblings}
    />
  );
}
