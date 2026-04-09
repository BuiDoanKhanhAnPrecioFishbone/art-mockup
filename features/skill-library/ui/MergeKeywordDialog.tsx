"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal, Button, Input } from "@/shared/ui";
import { Loader2, Sparkles, Search, Check } from "lucide-react";
import type { Skill } from "@/shared/types/skill";
import { masterSkills, mergeCandidatesMap } from "@/shared/fixtures/skills";

interface MergeKeywordDialogProps {
  open: boolean;
  onClose: () => void;
  onMerge: (targetId: string) => void;
  skillId: string;
  skillName: string;
  merging?: boolean;
}

export function MergeKeywordDialog({
  open,
  onClose,
  onMerge,
  skillId,
  skillName,
  merging,
}: MergeKeywordDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSuggestionId, setAiSuggestionId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedTarget(null);
      setAiSearching(false);
      setAiSuggestionId(null);
    }
  }, [open]);

  const filteredSkills = useMemo(() => {
    if (!search.trim()) return masterSkills;
    const q = search.toLowerCase();
    return masterSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [search]);

  function handleAiFindMatch() {
    setAiSearching(true);
    // Simulate AI analysis
    setTimeout(() => {
      const candidates = mergeCandidatesMap[skillId] || mergeCandidatesMap.default;
      // Pick the highest similarity match
      const best = candidates.reduce((a, b) => (a.similarity > b.similarity ? a : b));
      setAiSuggestionId(best.id);
      setSelectedTarget(best.id);
      setAiSearching(false);
    }, 1000);
  }

  function handleConfirm() {
    if (selectedTarget) {
      onMerge(selectedTarget);
    }
  }

  const selectedSkill = masterSkills.find((s) => s.id === selectedTarget);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Merge "${skillName}"`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={merging}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedTarget || merging}>
            {merging ? "Merging..." : "Confirm Merge"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Select a master skill to merge <span className="font-semibold text-gray-900">{skillName}</span> into.
          The pending skill will be removed and its references will point to the selected master skill.
        </p>

        {/* Search + AI button row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="merge-search"
              placeholder="Search master skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!pl-9"
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleAiFindMatch}
            disabled={aiSearching}
            className="shrink-0 gap-1.5"
          >
            {aiSearching ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {aiSearching ? "Finding..." : "AI Match"}
          </Button>
        </div>

        {/* AI suggestion banner */}
        {aiSuggestionId && !aiSearching && (
          <div className="flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-200 px-3 py-2 text-sm">
            <Sparkles size={14} className="text-purple-600 shrink-0" />
            <span className="text-purple-700">
              AI suggests merging into <span className="font-semibold">{masterSkills.find(s => s.id === aiSuggestionId)?.name}</span>
            </span>
          </div>
        )}

        {/* Skill list */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
          {filteredSkills.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No skills match your search
            </div>
          ) : (
            filteredSkills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedTarget(skill.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                  selectedTarget === skill.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                } ${aiSuggestionId === skill.id && selectedTarget !== skill.id ? "bg-purple-50/50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedTarget === skill.id
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedTarget === skill.id && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {skill.name}
                      {aiSuggestionId === skill.id && (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-purple-600 font-normal">
                          <Sparkles size={10} /> AI recommended
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{skill.category} &middot; Used {skill.usageCount} times</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Selected summary */}
        {selectedSkill && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-600">
            Will merge <span className="font-medium text-gray-900">{skillName}</span>
            {" "}into{" "}
            <span className="font-medium text-gray-900">{selectedSkill.name}</span>
            {" "}({selectedSkill.category})
          </div>
        )}
      </div>
    </Modal>
  );
}
