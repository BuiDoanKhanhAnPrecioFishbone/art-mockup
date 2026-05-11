"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardHeader, CardContent, Button, Badge } from "@/shared/ui";
import {
  AIAutoExtractButton,
  KeywordLibraryBrowser,
  SkillTagList,
} from "@/features/skill-library";
import { BookOpen, Plus, HelpCircle, X, Sparkles, GripHorizontal, AlertCircle } from "lucide-react";
import type {
  CategorizationLabel,
  SkillTag,
  SkillCategory,
  SkillPriority,
} from "@/shared/types/skill";
import { useToast } from "@/shared/ui/toast";

const PRIORITY_CONFIG: Record<
  SkillPriority,
  { label: string; tooltip: string; badgeClass: string; headerClass: string; width: string }
> = {
  "must-have": {
    label: "Must-have",
    tooltip: "Mandatory skills (+100 pts). Candidates missing these will be heavily penalized in the matching system.",
    badgeClass: "bg-red-100 text-red-700",
    headerClass: "border-red-200 bg-red-50/50",
    width: "flex-[5]",
  },
  "nice-to-have": {
    label: "Nice-to-have",
    tooltip: "Preferred skills (+10 pts). These provide a competitive advantage and boost the candidate's ranking.",
    badgeClass: "bg-amber-100 text-amber-700",
    headerClass: "border-amber-200 bg-amber-50/50",
    width: "flex-[3]",
  },
  bonus: {
    label: "Bonus",
    tooltip: "Optional skills (+5 pts). These act as tie-breakers when comparing equally qualified candidates.",
    badgeClass: "bg-green-100 text-green-700",
    headerClass: "border-green-200 bg-green-50/50",
    width: "flex-[2]",
  },
};

const PRIORITIES: SkillPriority[] = ["must-have", "nice-to-have", "bonus"];

const DEFAULT_LABELS: CategorizationLabel[] = [
  { id: "lbl-1", name: "Frontend Development", order: 1 },
  { id: "lbl-2", name: "Backend Development", order: 2 },
  { id: "lbl-3", name: "DevOps & Infrastructure", order: 3 },
];

interface SkillsLabelsSectionProps {
  /** Controlled tags. Omit to use internal state (legacy mode). */
  tags?: SkillTag[];
  onTagsChange?: (tags: SkillTag[]) => void;
  /** Controlled labels. Omit to use internal state (legacy mode). */
  labels?: CategorizationLabel[];
  onLabelsChange?: (labels: CategorizationLabel[]) => void;
  /** Hide the bottom "Save Skills & Labels" button when the parent already has
   *  its own save bar (e.g. when embedded in a larger form). */
  hideSaveButton?: boolean;
  /** Hide the internal "Skills & Labels" CardHeader so the parent can render
   *  its own (e.g. matching wireframe wording). The action buttons (AI extract,
   *  Browse Library) move into the body. */
  hideHeader?: boolean;
}

export function SkillsLabelsSection({
  tags: tagsProp,
  onTagsChange,
  labels: labelsProp,
  onLabelsChange,
  hideSaveButton,
  hideHeader,
}: SkillsLabelsSectionProps = {}) {
  const { showToast } = useToast();

  // We mirror tags/labels in refs so functional updaters called multiple times
  // synchronously (e.g. inside a for-loop in handleLibraryApply) see the
  // latest accumulated value — controlled-mode props don't update mid-event,
  // so a closure-captured `tags` would only see the value from render time.
  const [internalTags, setInternalTags] = useState<SkillTag[]>([]);
  const tags = tagsProp ?? internalTags;
  const tagsRef = useRef(tags);
  tagsRef.current = tags;
  const setTags = useCallback(
    (next: SkillTag[] | ((prev: SkillTag[]) => SkillTag[])) => {
      const value = typeof next === "function" ? next(tagsRef.current) : next;
      tagsRef.current = value;
      if (onTagsChange) onTagsChange(value);
      else setInternalTags(value);
    },
    [onTagsChange]
  );

  const [internalLabels, setInternalLabels] = useState<CategorizationLabel[]>(DEFAULT_LABELS);
  const labels = labelsProp ?? internalLabels;
  const labelsRef = useRef(labels);
  labelsRef.current = labels;
  const setLabels = useCallback(
    (next: CategorizationLabel[] | ((prev: CategorizationLabel[]) => CategorizationLabel[])) => {
      const value = typeof next === "function" ? next(labelsRef.current) : next;
      labelsRef.current = value;
      if (onLabelsChange) onLabelsChange(value);
      else setInternalLabels(value);
    },
    [onLabelsChange]
  );
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [showInlineInput, setShowInlineInput] = useState<SkillPriority | null>(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [duplicateBar, setDuplicateBar] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState<SkillPriority | null>(null);
  const [draggedLabelId, setDraggedLabelId] = useState<string | null>(null);

  const hasAITags = tags.some((t) => t.source === "ai-extracted");
  const hasDuplicates = tags.some((t) => t.source === "duplicate");

  function countByPriority(p: SkillPriority) {
    return tags.filter((t) => t.priority === p).length;
  }

  function addTagOrMarkDuplicate(
    newTag: Omit<SkillTag, "source">,
    preferredSource: SkillTag["source"]
  ) {
    setTags((prev) => {
      const isDupe = prev.some(
        (t) => t.name.toLowerCase() === newTag.name.toLowerCase()
      );
      if (isDupe) {
        setDuplicateBar(`The skill "${newTag.name}" is already in the list.`);
        // Add as red duplicate
        return [
          ...prev,
          { ...newTag, source: "duplicate" as const },
        ];
      }
      return [...prev, { ...newTag, source: preferredSource }];
    });
  }

  const handleAIExtract = useCallback(
    (skills: Array<{ name: string; category: string }>) => {
      let count = 0;
      for (const s of skills) {
        addTagOrMarkDuplicate(
          {
            skillId: `ai-${Date.now()}-${count}`,
            name: s.name,
            category: s.category as SkillCategory,
            priority: "nice-to-have",
            order: tags.length + count,
          },
          "ai-extracted"
        );
        count++;
      }
      showToast("success", `${count} skills extracted by AI`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tags.length, showToast]
  );

  function handleAcceptAI() {
    setTags((prev) =>
      prev.map((t) =>
        t.source === "ai-extracted" ? { ...t, source: "library" } : t
      )
    );
    showToast("success", "AI skills accepted");
  }

  function handleLibraryApply(skills: Array<{ name: string; group: SkillPriority }>) {
    let count = 0;
    for (const s of skills) {
      addTagOrMarkDuplicate(
        {
          skillId: `lib-${Date.now()}-${count}`,
          name: s.name,
          category: "Uncategorized",
          priority: s.group,
          order: tags.length + count,
        },
        "library"
      );
      count++;
    }
    setLibraryOpen(false);
    showToast("success", `${count} skill${count !== 1 ? "s" : ""} added from library`);
  }

  function handleRemoveTag(skillId: string) {
    setTags((prev) => prev.filter((t) => t.skillId !== skillId));
  }

  function handleReorder(reordered: SkillTag[]) {
    setTags(reordered);
  }

  function handleMoveToPriority(skillId: string, targetPriority: SkillPriority) {
    setTags((prev) =>
      prev.map((t) => (t.skillId === skillId ? { ...t, priority: targetPriority } : t))
    );
  }

  function handleCreateNew(priority: SkillPriority) {
    if (!newSkillName.trim()) return;
    addTagOrMarkDuplicate(
      {
        skillId: `new-${Date.now()}`,
        name: newSkillName.trim(),
        category: "Uncategorized",
        priority,
        order: tags.length,
      },
      "manual"
    );
    setNewSkillName("");
    setShowInlineInput(null);
  }

  function handleColumnDrop(e: React.DragEvent, targetPriority: SkillPriority) {
    e.preventDefault();
    const skillId = e.dataTransfer.getData("text/plain");
    const sourcePriority = e.dataTransfer.getData("application/skill-priority");

    if (skillId && sourcePriority && sourcePriority !== targetPriority) {
      handleMoveToPriority(skillId, targetPriority);
      return;
    }

    try {
      const skillJson = e.dataTransfer.getData("application/skill-json");
      if (skillJson) {
        const skill = JSON.parse(skillJson);
        addTagOrMarkDuplicate(
          {
            skillId: skill.id || `drop-${Date.now()}`,
            name: skill.name,
            category: skill.category || "Uncategorized",
            priority: targetPriority,
            order: tags.length,
          },
          "library"
        );
      }
    } catch {
      // ignore
    }
  }

  // ---- Categorization label drag-to-reorder ----
  function handleLabelDragStart(e: React.DragEvent, id: string) {
    setDraggedLabelId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleLabelDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedLabelId || draggedLabelId === targetId) return;
    setLabels((prev) => {
      const fromIdx = prev.findIndex((l) => l.id === draggedLabelId);
      const toIdx = prev.findIndex((l) => l.id === targetId);
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((l, i) => ({ ...l, order: i + 1 }));
    });
    setDraggedLabelId(null);
  }

  function removeLabel(id: string) {
    setLabels((prev) => {
      const next = prev.filter((l) => l.id !== id);
      return next.map((l, i) => ({ ...l, order: i + 1 }));
    });
  }

  function addLabel(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLabels((prev) => {
      // Skip duplicates (case-insensitive).
      if (prev.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      const next = [
        ...prev,
        {
          id: `lbl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: trimmed,
          order: prev.length + 1,
        },
      ];
      return next;
    });
  }

  return (
    <>
      <Card>
        {!hideHeader && (
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">2. Skills &amp; Labels</h2>
                <HelpCircle size={14} className="text-gray-400 cursor-help" />
              </div>
              <div className="flex items-center gap-3">
                {hasAITags && (
                  <button
                    onClick={handleAcceptAI}
                    className="flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    <Sparkles size={14} />
                    Accept AI Skills
                  </button>
                )}
                <AIAutoExtractButton onExtracted={handleAIExtract} />
                <Button variant="secondary" onClick={() => setLibraryOpen(true)}>
                  <BookOpen size={16} />
                  Browse Library
                </Button>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent>
          {hideHeader && (
            <div className="mb-3 flex items-center justify-end gap-3">
              {hasAITags && (
                <button
                  onClick={handleAcceptAI}
                  className="flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
                >
                  <Sparkles size={14} />
                  Accept AI Skills
                </button>
              )}
              <AIAutoExtractButton onExtracted={handleAIExtract} />
              <Button variant="secondary" onClick={() => setLibraryOpen(true)}>
                <BookOpen size={16} />
                Browse Library
              </Button>
            </div>
          )}
          {/* Duplicate warning banner */}
          {hasDuplicates && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <span className="text-sm text-red-700 flex-1">
                Remove duplicate skills (shown in red) before saving.
              </span>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-purple-300 inline-block" /> AI extracted
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-300 inline-block" /> Newly added
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-300 inline-block" /> Duplicate
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> From library
            </span>
          </div>

          {/* Three priority columns */}
          <div className="flex gap-3 mb-4">
            {PRIORITIES.map((priority) => {
              const config = PRIORITY_CONFIG[priority];
              const count = countByPriority(priority);
              return (
                <div
                  key={priority}
                  className={`${config.width} min-w-0`}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => handleColumnDrop(e, priority)}
                >
                  {/* Column header */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border ${config.headerClass}`}>
                    <span className="text-sm font-semibold text-gray-800">{config.label}</span>
                    <Badge className={config.badgeClass}>
                      {count} skill{count !== 1 ? "s" : ""}
                    </Badge>
                    <div className="relative ml-auto">
                      <HelpCircle
                        size={13}
                        className="text-gray-400 cursor-help"
                        onMouseEnter={() => setTooltipVisible(priority)}
                        onMouseLeave={() => setTooltipVisible(null)}
                      />
                      {tooltipVisible === priority && (
                        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-gray-900 text-white text-xs p-2.5 shadow-lg">
                          {config.tooltip}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column body */}
                  <div className="border border-t-0 border-gray-200 rounded-b-lg p-3 min-h-[100px] bg-white">
                    <SkillTagList
                      tags={tags}
                      priority={priority}
                      onRemove={handleRemoveTag}
                      onReorder={handleReorder}
                      onDropFromOtherColumn={(skillId) => handleMoveToPriority(skillId, priority)}
                    />

                    {showInlineInput === priority ? (
                      <div className="flex items-center gap-1.5 mt-2 p-2 bg-gray-50 rounded-lg">
                        <input
                          type="text"
                          placeholder="Skill name..."
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateNew(priority);
                            if (e.key === "Escape") { setShowInlineInput(null); setNewSkillName(""); }
                          }}
                          className="flex-1 min-w-0 rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleCreateNew(priority)} disabled={!newSkillName.trim()}>
                          Add
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowInlineInput(null); setNewSkillName(""); }}>
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setShowInlineInput(priority); setNewSkillName(""); }}
                        className="flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Plus size={12} />
                        Create New
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Categorization Labels */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorization Labels</h3>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <div
                  key={label.id}
                  draggable
                  onDragStart={(e) => handleLabelDragStart(e, label.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleLabelDrop(e, label.id)}
                  className={`inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 cursor-grab active:cursor-grabbing hover:border-gray-400 transition-colors select-none ${draggedLabelId === label.id ? "opacity-40" : ""}`}
                >
                  <GripHorizontal size={13} className="text-gray-400 shrink-0" />
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] font-bold shrink-0">
                    {label.order}
                  </span>
                  <span>{label.name}</span>
                  <button
                    onClick={() => removeLabel(label.id)}
                    className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <AddLabelPill onAdd={addLabel} />
            </div>
          </div>

          {/* Duplicate detection info bar */}
          {duplicateBar && (
            <div className="flex items-center justify-between mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-sm text-amber-800 flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                {duplicateBar}
              </span>
              <button onClick={() => setDuplicateBar(null)} className="text-amber-400 hover:text-amber-600 transition-colors ml-2">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Save button — hidden when host form has its own save bar */}
          {!hideSaveButton && (
            <div className="mt-5 flex items-center justify-end gap-2">
              {hasDuplicates && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> Fix duplicate skills to save
                </span>
              )}
              <Button disabled={hasDuplicates}>
                Save Skills &amp; Labels
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <KeywordLibraryBrowser
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onApply={handleLibraryApply}
        alreadyAdded={tags.map((t) => t.name)}
      />
    </>
  );
}

/** Inline "+ Add Label" pill — sits at the end of the Categorization
 *  Labels list. Default state is a dashed pill; clicking turns it into
 *  a small text input. Enter or blur commits, Esc cancels. */
function AddLabelPill({ onAdd }: { onAdd: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  function commit() {
    if (value.trim()) onAdd(value);
    setValue("");
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1 rounded border-2 border-dashed border-gray-300 bg-transparent px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600"
      >
        <Plus size={13} />
        Add Label
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded border-2 border-dashed border-blue-300 bg-blue-50/40 px-2.5 py-1 text-sm">
      <Plus size={13} className="text-blue-500" />
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            setValue("");
            setEditing(false);
          }
        }}
        onBlur={commit}
        placeholder="New label name…"
        className="w-36 border-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
      />
    </div>
  );
}
