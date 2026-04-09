"use client";

import { Modal, Button } from "@/shared/ui";
import { AlertTriangle } from "lucide-react";

interface RejectSkillDialogProps {
  open: boolean;
  onClose: () => void;
  onReject: () => void;
  skillName: string;
  rejecting?: boolean;
}

export function RejectSkillDialog({ open, onClose, onReject, skillName, rejecting }: RejectSkillDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject Skill"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={rejecting}>
            Cancel
          </Button>
          <Button
            onClick={onReject}
            disabled={rejecting}
            className="!bg-red-600 hover:!bg-red-700"
          >
            {rejecting ? "Rejecting..." : "Reject"}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-amber-600" />
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to reject <span className="font-semibold text-gray-900">{skillName}</span>?
          This skill will be removed from the pending approvals list.
        </p>
      </div>
    </Modal>
  );
}
