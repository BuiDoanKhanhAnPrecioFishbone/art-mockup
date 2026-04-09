"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Select, Input } from "@/shared/ui";
import { CheckCircle2, X } from "lucide-react";
import { SKILL_CATEGORIES } from "@/shared/types/skill";
import type { SkillCategory } from "@/shared/types/skill";

interface ApproveSkillDialogProps {
  open: boolean;
  onClose: () => void;
  onApprove: (data: { category: SkillCategory; synonyms: string[] }) => void;
  skillName: string;
  approving?: boolean;
}

export function ApproveSkillDialog({ open, onClose, onApprove, skillName, approving }: ApproveSkillDialogProps) {
  const [category, setCategory] = useState<string>("");
  const [synonymInput, setSynonymInput] = useState("");
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    if (open) {
      setCategory("");
      setSynonymInput("");
      setSynonyms([]);
      setCategoryError("");
    }
  }, [open]);

  function addSynonym() {
    const trimmed = synonymInput.trim();
    if (trimmed && !synonyms.includes(trimmed)) {
      setSynonyms([...synonyms, trimmed]);
      setSynonymInput("");
    }
  }

  function removeSynonym(s: string) {
    setSynonyms(synonyms.filter((syn) => syn !== s));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSynonym();
    }
  }

  function handleApprove() {
    if (!category) {
      setCategoryError("Please select a category");
      return;
    }
    onApprove({ category: category as SkillCategory, synonyms });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Approve Skill"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={approving}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={approving}>
            {approving ? "Approving..." : "Approve"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <p className="text-sm text-gray-600">
            Approve <span className="font-semibold text-gray-900">{skillName}</span> and add it to the master skill library.
            Please assign a category and optional synonyms.
          </p>
        </div>

        <Select
          id="approve-category"
          label="Category"
          placeholder="Select a category..."
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            if (categoryError) setCategoryError("");
          }}
          options={SKILL_CATEGORIES.map((c) => ({ value: c, label: c }))}
          error={categoryError}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Synonyms</label>
          <div className="flex gap-2">
            <Input
              id="approve-synonyms"
              placeholder="Type a synonym and press Enter..."
              value={synonymInput}
              onChange={(e) => setSynonymInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button variant="secondary" onClick={addSynonym} disabled={!synonymInput.trim()}>
              Add
            </Button>
          </div>
          {synonyms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {synonyms.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  {s}
                  <button
                    onClick={() => removeSynonym(s)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
