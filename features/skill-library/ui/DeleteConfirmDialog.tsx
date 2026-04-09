"use client";

import { Modal, Button } from "@/shared/ui";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  skillName: string;
  deleting?: boolean;
}

export function DeleteConfirmDialog({ open, onClose, onConfirm, skillName, deleting }: DeleteConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Skill"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={deleting}
            className="!bg-red-600 hover:!bg-red-700"
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-red-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{skillName}</span>?
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
}
