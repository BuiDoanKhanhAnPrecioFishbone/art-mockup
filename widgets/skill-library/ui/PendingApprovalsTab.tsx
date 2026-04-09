"use client";

import { useState } from "react";
import { Badge, EmptyState } from "@/shared/ui";
import {
  MergeKeywordDialog,
  ApproveSkillDialog,
  RejectSkillDialog,
} from "@/features/skill-library";
import { GitMerge, Check, X, Clock } from "lucide-react";
import type { PendingApproval } from "@/shared/types/skill";
import { useToast } from "@/shared/ui/toast";

interface PendingApprovalsTabProps {
  approvals: PendingApproval[];
  onApprovalsChange: (approvals: PendingApproval[]) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PendingApprovalsTab({ approvals, onApprovalsChange }: PendingApprovalsTabProps) {
  const { showToast } = useToast();
  const [mergeTarget, setMergeTarget] = useState<PendingApproval | null>(null);
  const [approveTarget, setApproveTarget] = useState<PendingApproval | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingApproval | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleMerge(targetSkillId: string) {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 500));
    onApprovalsChange(approvals.filter((a) => a.id !== mergeTarget?.id));
    showToast("success", `"${mergeTarget?.skill.name}" merged successfully`);
    setProcessing(false);
    setMergeTarget(null);
  }

  async function handleApprove(data: { category: import("@/shared/types/skill").SkillCategory; synonyms: string[] }) {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 400));
    onApprovalsChange(approvals.filter((a) => a.id !== approveTarget?.id));
    showToast("success", `"${approveTarget?.skill.name}" approved as ${data.category}`);
    setProcessing(false);
    setApproveTarget(null);
  }

  async function handleReject() {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 400));
    onApprovalsChange(approvals.filter((a) => a.id !== rejectTarget?.id));
    showToast("success", `"${rejectTarget?.skill.name}" rejected`);
    setProcessing(false);
    setRejectTarget(null);
  }

  if (approvals.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Clock size={48} />}
          title="No pending approvals at the moment"
          description="All skill submissions have been reviewed."
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {approvals.map((approval) => (
              <tr key={approval.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{approval.skill.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="warning">Pending</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{approval.skill.category}</td>
                <td className="px-4 py-3 text-gray-500">{approval.submittedBy}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(approval.submittedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setMergeTarget(approval)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      title="Merge"
                    >
                      <GitMerge size={16} />
                    </button>
                    <button
                      onClick={() => setApproveTarget(approval)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setRejectTarget(approval)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <MergeKeywordDialog
        open={!!mergeTarget}
        onClose={() => setMergeTarget(null)}
        onMerge={handleMerge}
        skillId={mergeTarget?.skill.id ?? ""}
        skillName={mergeTarget?.skill.name ?? ""}
        merging={processing}
      />
      <ApproveSkillDialog
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onApprove={handleApprove}
        skillName={approveTarget?.skill.name ?? ""}
        approving={processing}
      />
      <RejectSkillDialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onReject={handleReject}
        skillName={rejectTarget?.skill.name ?? ""}
        rejecting={processing}
      />
    </div>
  );
}
