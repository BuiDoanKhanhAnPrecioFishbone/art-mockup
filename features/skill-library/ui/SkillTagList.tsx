"use client";

import { X, GripHorizontal, AlertCircle } from "lucide-react";
import type { SkillTag, SkillPriority } from "@/shared/types/skill";

interface SkillTagListProps {
  tags: SkillTag[];
  onRemove: (skillId: string) => void;
  onReorder?: (tags: SkillTag[]) => void;
  /** When set, only renders tags of this priority (used inside priority columns) */
  priority?: SkillPriority;
  /** Called when a tag is dropped into this list from another priority column */
  onDropFromOtherColumn?: (skillId: string) => void;
}

/** Color by source — source takes priority over category */
function getTagStyle(source: SkillTag["source"]): string {
  switch (source) {
    case "ai-extracted":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "manual":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "duplicate":
      return "bg-red-100 text-red-800 border-red-300";
    case "library":
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

export function SkillTagList({
  tags,
  onRemove,
  onReorder,
  priority,
  onDropFromOtherColumn,
}: SkillTagListProps) {
  const displayTags = priority ? tags.filter((t) => t.priority === priority) : tags;

  function handleDragStart(e: React.DragEvent, tag: SkillTag) {
    e.dataTransfer.setData("text/plain", tag.skillId);
    e.dataTransfer.setData("application/skill-priority", tag.priority);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const skillId = e.dataTransfer.getData("text/plain");
    const sourcePriority = e.dataTransfer.getData("application/skill-priority");

    if (sourcePriority && sourcePriority !== priority && onDropFromOtherColumn) {
      onDropFromOtherColumn(skillId);
      return;
    }

    try {
      const skillJson = e.dataTransfer.getData("application/skill-json");
      if (skillJson && onDropFromOtherColumn) {
        const skill = JSON.parse(skillJson);
        onDropFromOtherColumn(skill.id);
      }
    } catch {
      // ignore
    }
  }

  function handleInternalDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    e.stopPropagation();
    const skillId = e.dataTransfer.getData("text/plain");
    const sourcePriority = e.dataTransfer.getData("application/skill-priority");

    if (sourcePriority && sourcePriority !== priority && onDropFromOtherColumn) {
      onDropFromOtherColumn(skillId);
      return;
    }

    if (!onReorder) return;
    const dragIdx = displayTags.findIndex((t) => t.skillId === skillId);
    if (dragIdx === -1 || dragIdx === dropIndex) return;

    const newTags = [...tags];
    const globalDragIdx = newTags.findIndex((t) => t.skillId === skillId);
    const globalDropTag = displayTags[dropIndex];
    const globalDropIdx = newTags.findIndex((t) => t.skillId === globalDropTag.skillId);

    const [moved] = newTags.splice(globalDragIdx, 1);
    newTags.splice(globalDropIdx, 0, moved);
    onReorder(newTags.map((t, i) => ({ ...t, order: i })));
  }

  if (displayTags.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="min-h-[40px] flex items-center justify-center"
      >
        <p className="text-xs text-gray-400 italic">Drop skills here</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap gap-2 min-h-[40px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {displayTags.map((tag, idx) => {
        const style = getTagStyle(tag.source);
        return (
          <div
            key={tag.skillId}
            draggable
            onDragStart={(e) => handleDragStart(e, tag)}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => handleInternalDrop(e, idx)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium cursor-grab active:cursor-grabbing ${style}`}
          >
            <GripHorizontal size={12} className="opacity-50 shrink-0" />
            {tag.name}

            {/* Source badges */}
            {tag.source === "ai-extracted" && (
              <span className="text-[10px] bg-purple-200 text-purple-800 rounded px-1 font-semibold shrink-0">
                AI
              </span>
            )}
            {tag.source === "manual" && (
              <span className="text-[10px] bg-blue-200 text-blue-800 rounded px-1 font-semibold shrink-0">
                new
              </span>
            )}
            {tag.source === "duplicate" && (
              <AlertCircle size={12} className="text-red-500 shrink-0" />
            )}

            <button
              onClick={() => onRemove(tag.skillId)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
