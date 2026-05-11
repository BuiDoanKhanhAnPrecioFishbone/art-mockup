"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Copy,
  FileText,
  GripVertical,
  HelpCircle,
  List,
  Lock,
  MoreVertical,
  Pen,
  Plus,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  FIELD_TYPE_LABEL,
  SECTION_TEMPLATES,
  TOOLBOX_FIELD_TYPES,
  defaultLabelForType,
  getSectionRows,
  instantiateSection,
  newCustomField,
  type CandidateProfile,
  type ProfileField,
  type ProfileFieldType,
  type ProfileSection,
} from "@/entities/program";
import type { ProgramDraft } from "../../model/types";

/* ============================================================
 * Drag-and-drop payload — one shared MIME, four payload kinds.
 * ============================================================ */

const DND_MIME = "application/x-art-mockup-profile";

type DragPayload =
  | { kind: "section-template"; templateId: string }
  | { kind: "component"; fieldType: ProfileFieldType }
  | { kind: "section"; sectionId: string }
  | { kind: "field"; fromSectionId: string; fieldId: string };

function setDragPayload(e: React.DragEvent, payload: DragPayload) {
  e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
  // text/plain fallback so other targets (or the system) get something usable.
  e.dataTransfer.setData("text/plain", payload.kind);
  e.dataTransfer.effectAllowed = "move";
}

function readDragPayload(e: React.DragEvent): DragPayload | null {
  try {
    const raw = e.dataTransfer.getData(DND_MIME);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ============================================================
 * Tab
 * ============================================================ */

interface CandidateProfileTabProps {
  draft: ProgramDraft;
  onChange: (updates: Partial<ProgramDraft>) => void;
}

export function CandidateProfileTab({ draft, onChange }: CandidateProfileTabProps) {
  const { showToast } = useToast();
  const profile = draft.candidateProfile;
  const [toolboxTab, setToolboxTab] = useState<"sections" | "components">("sections");

  /** Multiple sections can be open at once. Default: every section open. */
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(
    () => new Set(profile.sections.map((s) => s.id))
  );

  /** Most recently expanded section — fallback drop target for click-to-add
   *  when there's no obvious "active" section. */
  const lastFocusedRef = useRef<string>(profile.sections[0]?.id ?? "");

  /** Insertion index hovered during a drag over the section list (null = no
   *  active drop). Same idea per-section for fields, but tracked locally
   *  inside SectionCard. */
  const [sectionDropIdx, setSectionDropIdx] = useState<number | null>(null);

  /** Set while ANY drag is in progress — used to surface drop zones (which
   *  are otherwise tiny slivers users can't see or hit). */
  const [dragKind, setDragKind] = useState<DragPayload["kind"] | null>(null);

  function update(next: CandidateProfile) {
    onChange({ candidateProfile: next });
  }

  function toggleSection(id: string) {
    setOpenSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    lastFocusedRef.current = id;
  }

  function expandSection(id: string) {
    setOpenSectionIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    lastFocusedRef.current = id;
  }

  function patchSection(id: string, patch: Partial<ProfileSection>) {
    update({
      ...profile,
      sections: profile.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function deleteSection(id: string) {
    setOpenSectionIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    update({ ...profile, sections: profile.sections.filter((s) => s.id !== id) });
  }

  function addSection(
    template: (typeof SECTION_TEMPLATES)[number],
    insertAt?: number
  ) {
    const section = instantiateSection(template);
    // Defensive guard — system sections (General Information /
    // Skills) cannot be repeated. The current toolbox doesn't
    // surface system templates, but if a future code path tries to
    // add one we silently refuse + toast the user.
    if (
      section.kind !== "custom" &&
      profile.sections.some((s) => s.kind === section.kind)
    ) {
      showToast(
        "error",
        `${section.name} is a system section — only one is allowed per program.`
      );
      return;
    }
    const next = [...profile.sections];
    if (insertAt === undefined || insertAt < 0 || insertAt > next.length) {
      next.push(section);
    } else {
      next.splice(insertAt, 0, section);
    }
    update({ ...profile, sections: next });
    expandSection(section.id);
  }

  function reorderSection(sectionId: string, insertAt: number) {
    const fromIdx = profile.sections.findIndex((s) => s.id === sectionId);
    if (fromIdx === -1) return;
    const next = [...profile.sections];
    const [moved] = next.splice(fromIdx, 1);
    // Adjust target index if removing earlier item shifted everything left.
    const adjusted = insertAt > fromIdx ? insertAt - 1 : insertAt;
    next.splice(Math.max(0, Math.min(adjusted, next.length)), 0, moved);
    update({ ...profile, sections: next });
  }

  /** Add a brand-new field to a section. `target` decides where it lands:
   *   - { kind: 'newRow', rowIdx } → inserts a new row at rowIdx with this
   *     field as its only member.
   *   - { kind: 'joinRow', rowIdx } → appends to the existing row at rowIdx. */
  type AddTarget =
    | { kind: "newRow"; rowIdx: number }
    | { kind: "joinRow"; rowIdx: number };

  function addFieldToSection(
    sectionId: string,
    type: ProfileFieldType,
    target: AddTarget = { kind: "newRow", rowIdx: Number.MAX_SAFE_INTEGER }
  ) {
    const sec = profile.sections.find((s) => s.id === sectionId);
    if (!sec || sec.kind === "skills") {
      // Skills section can't host fields. Fall back to first non-skills section.
      const fallback = profile.sections.find((s) => s.kind !== "skills");
      if (!fallback) return;
      addFieldToSection(fallback.id, type, target);
      return;
    }
    const field = newCustomField(type);
    const newFields = [...sec.fields, field];
    const currentLayout = getSectionRows(sec);
    let newLayout: string[][];
    if (target.kind === "newRow") {
      newLayout = [...currentLayout];
      const at = Math.max(0, Math.min(target.rowIdx, newLayout.length));
      newLayout.splice(at, 0, [field.id]);
    } else {
      newLayout = currentLayout.map((row, i) =>
        i === target.rowIdx ? [...row, field.id] : row
      );
    }
    patchSection(sectionId, { fields: newFields, layout: newLayout });
    expandSection(sectionId);
  }

  /** Move a field to a new row position. `target` is identical in shape to
   *  AddTarget for addFieldToSection. */
  type MoveTarget =
    | { kind: "newRow"; rowIdx: number }
    | { kind: "joinRow"; rowIdx: number };

  function moveField(
    fromSectionId: string,
    fieldId: string,
    toSectionId: string,
    target: MoveTarget
  ) {
    const fromSec = profile.sections.find((s) => s.id === fromSectionId);
    if (!fromSec) return;
    const field = fromSec.fields.find((f) => f.id === fieldId);
    if (!field) return;

    // System fields can't leave their original section.
    if (field.system && fromSectionId !== toSectionId) return;
    const toSec = profile.sections.find((s) => s.id === toSectionId);
    if (!toSec || toSec.kind === "skills") return;

    // Strip the field from its source layout (and prune empty rows).
    const fromLayout = getSectionRows(fromSec)
      .map((row) => row.filter((id) => id !== fieldId))
      .filter((row) => row.length > 0);

    const sameSection = fromSectionId === toSectionId;

    // Insert into destination layout.
    let toLayout = sameSection ? fromLayout : getSectionRows(toSec);
    if (target.kind === "newRow") {
      toLayout = [...toLayout];
      const at = Math.max(0, Math.min(target.rowIdx, toLayout.length));
      toLayout.splice(at, 0, [fieldId]);
    } else {
      toLayout = toLayout.map((row, i) =>
        i === target.rowIdx ? [...row, fieldId] : row
      );
    }

    if (sameSection) {
      patchSection(fromSectionId, { layout: toLayout });
    } else {
      const fromFields = fromSec.fields.filter((f) => f.id !== fieldId);
      const toFields = [...toSec.fields, field];
      update({
        ...profile,
        sections: profile.sections.map((s) => {
          if (s.id === fromSectionId) return { ...s, fields: fromFields, layout: fromLayout };
          if (s.id === toSectionId) return { ...s, fields: toFields, layout: toLayout };
          return s;
        }),
      });
      expandSection(toSectionId);
    }
  }

  /* -------- Section list drop handlers (templates + section reorder) -------- */

  function onSectionListDragOver(e: React.DragEvent, idx: number) {
    if (!isOurDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setSectionDropIdx(idx);
  }

  function onSectionListDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    const payload = readDragPayload(e);
    setSectionDropIdx(null);
    setDragKind(null);
    if (!payload) return;
    if (payload.kind === "section-template") {
      const template = SECTION_TEMPLATES.find((t) => t.id === payload.templateId);
      if (template) addSection(template, idx);
    } else if (payload.kind === "section") {
      reorderSection(payload.sectionId, idx);
    }
  }

  function onSectionListDragLeave() {
    setSectionDropIdx(null);
  }

  /** Drop zones for sections show only for section-template / section drags. */
  const sectionDropActive = dragKind === "section-template" || dragKind === "section";

  return (
    <div className="flex gap-6">
      {/* ============================================================
       * Left: section list
       * ============================================================ */}
      <div className="flex-1 min-w-0 space-y-3" onDragLeave={onSectionListDragLeave}>
        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-xs text-violet-900">
          <p className="font-medium">Profile builder</p>
          <p className="mt-1 text-violet-800/80">
            Drag items from the toolbox into the section list, drag fields
            between sections to relayout, or click an item in the toolbox to
            append it. System sections and the 3 default fields (Full Name /
            Email / Resume) cannot be removed.
          </p>
        </div>

        {/* Drop zone above the first section */}
        <SectionDropLine
          active={sectionDropIdx === 0}
          visible={sectionDropActive}
          onDragOver={(e) => onSectionListDragOver(e, 0)}
          onDrop={(e) => onSectionListDrop(e, 0)}
        />

        {profile.sections.map((section, idx) => (
          <div key={section.id}>
            <SectionCard
              section={section}
              index={idx}
              totalSections={profile.sections.length}
              open={openSectionIds.has(section.id)}
              onToggleOpen={() => toggleSection(section.id)}
              onPatch={(patch) => patchSection(section.id, patch)}
              onDelete={() => deleteSection(section.id)}
              onMove={(d) => {
                const target = idx + d;
                if (target < 0 || target >= profile.sections.length) return;
                reorderSection(section.id, target + (d > 0 ? 1 : 0));
              }}
              onAddFieldHere={(type, target) =>
                addFieldToSection(section.id, type, target)
              }
              onMoveFieldHere={(payload, target) =>
                moveField(payload.fromSectionId, payload.fieldId, section.id, target)
              }
              setDragKind={setDragKind}
              dragKind={dragKind}
            />
            <SectionDropLine
              active={sectionDropIdx === idx + 1}
              visible={sectionDropActive}
              onDragOver={(e) => onSectionListDragOver(e, idx + 1)}
              onDrop={(e) => onSectionListDrop(e, idx + 1)}
            />
          </div>
        ))}

        <p className="text-center text-xs text-gray-400">
          Drag from the toolbox or click an item to append.
        </p>
      </div>

      {/* ============================================================
       * Right: toolbox
       * ============================================================ */}
      <aside className="sticky top-4 w-72 shrink-0 self-start rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-700">
            Toolbox
            <HelpCircle size={11} className="text-gray-400" />
          </h3>
          <Link
            href="/templates/sections"
            target="_blank"
            className="text-[11px] font-medium text-violet-700 hover:text-violet-900"
            title="Open the section template library in a new tab."
          >
            Manage Library →
          </Link>
        </div>

        <div className="flex border-b border-gray-200 text-xs font-medium">
          <button
            onClick={() => setToolboxTab("sections")}
            className={cn(
              "flex-1 px-3 py-2 transition-colors",
              toolboxTab === "sections"
                ? "border-b-2 border-violet-600 text-violet-700"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Section tpl
          </button>
          <button
            onClick={() => setToolboxTab("components")}
            className={cn(
              "flex-1 px-3 py-2 transition-colors",
              toolboxTab === "components"
                ? "border-b-2 border-violet-600 text-violet-700"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Components
          </button>
        </div>

        <div className="max-h-[600px] overflow-y-auto p-2">
          {toolboxTab === "sections" ? (
            <ul className="space-y-1">
              {SECTION_TEMPLATES.map((tpl) => (
                <li key={tpl.id}>
                  <button
                    draggable
                    onDragStart={(e) => {
                      setDragPayload(e, { kind: "section-template", templateId: tpl.id });
                      setDragKind("section-template");
                    }}
                    onDragEnd={() => setDragKind(null)}
                    onClick={() => addSection(tpl)}
                    className="group flex w-full cursor-grab items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-xs hover:border-violet-300 hover:bg-violet-50 active:cursor-grabbing"
                    title={tpl.description}
                  >
                    <GripVertical size={12} className="text-gray-300" />
                    <span className="flex-1 font-medium text-gray-800 group-hover:text-violet-700">
                      {tpl.name}
                    </span>
                    <Plus size={12} className="text-violet-500 opacity-0 group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-1">
              {TOOLBOX_FIELD_TYPES.map((type) => (
                <li key={type}>
                  <button
                    draggable
                    onDragStart={(e) => {
                      setDragPayload(e, { kind: "component", fieldType: type });
                      setDragKind("component");
                    }}
                    onDragEnd={() => setDragKind(null)}
                    onClick={() =>
                      addFieldToSection(lastFocusedRef.current, type)
                    }
                    className="group flex w-full cursor-grab items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-xs hover:border-violet-300 hover:bg-violet-50 active:cursor-grabbing"
                    title={`Add a ${FIELD_TYPE_LABEL[type]} field`}
                  >
                    <GripVertical size={12} className="text-gray-300" />
                    <FieldTypeIcon type={type} />
                    <span className="flex-1 font-medium text-gray-800 group-hover:text-violet-700">
                      {FIELD_TYPE_LABEL[type]}
                    </span>
                    <Plus size={12} className="text-violet-500 opacity-0 group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400">
          Drag onto a section, or click to append.
        </p>
      </aside>
    </div>
  );
}

/* ============================================================
 * Section card
 * ============================================================ */

type RowTarget =
  | { kind: "newRow"; rowIdx: number }
  | { kind: "joinRow"; rowIdx: number };

interface SectionCardProps {
  section: ProfileSection;
  index: number;
  totalSections: number;
  open: boolean;
  onToggleOpen: () => void;
  onPatch: (patch: Partial<ProfileSection>) => void;
  onDelete: () => void;
  onMove: (d: -1 | 1) => void;
  onAddFieldHere: (type: ProfileFieldType, target: RowTarget) => void;
  onMoveFieldHere: (
    payload: Extract<DragPayload, { kind: "field" }>,
    target: RowTarget
  ) => void;
  setDragKind: (k: DragPayload["kind"] | null) => void;
  dragKind: DragPayload["kind"] | null;
}

function SectionCard({
  section,
  index,
  totalSections,
  open,
  onToggleOpen,
  onPatch,
  onDelete,
  onMove,
  onAddFieldHere,
  onMoveFieldHere,
  setDragKind,
  dragKind,
}: SectionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  /** Index of the between-row drop line currently hovered (drop = new row). */
  const [newRowDropIdx, setNewRowDropIdx] = useState<number | null>(null);
  /** Index of the existing row currently hovered (drop = join that row). */
  const [joinRowIdx, setJoinRowIdx] = useState<number | null>(null);
  /** Hover state on the empty-body fallback. */
  const [emptyHover, setEmptyHover] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickAway(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming) nameInputRef.current?.focus();
  }, [renaming]);

  const isSystem = section.kind !== "custom";
  const isSkills = section.kind === "skills";

  const rows = getSectionRows(section);
  const fieldById = new Map(section.fields.map((f) => [f.id, f]));

  function patchField(id: string, patch: Partial<ProfileField>) {
    onPatch({
      fields: section.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }

  /** Remove a field — and any row entry referencing it. Empty rows are pruned. */
  function deleteField(id: string) {
    const newLayout = rows
      .map((row) => row.filter((fid) => fid !== id))
      .filter((row) => row.length > 0);
    onPatch({
      fields: section.fields.filter((f) => f.id !== id),
      layout: newLayout,
    });
  }

  /** Duplicate a field — copy lands in a new row right after the source's row. */
  function duplicateField(id: string) {
    const src = section.fields.find((f) => f.id === id);
    if (!src) return;
    const copy: ProfileField = {
      ...src,
      id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: `${src.label} (copy)`,
      system: false,
    };
    const srcRowIdx = rows.findIndex((row) => row.includes(id));
    const newLayout = [...rows];
    newLayout.splice(srcRowIdx + 1, 0, [copy.id]);
    onPatch({ fields: [...section.fields, copy], layout: newLayout });
  }

  /* -------- Section card drag handle (whole card is draggable) -------- */

  function onSectionDragStart(e: React.DragEvent) {
    setDragPayload(e, { kind: "section", sectionId: section.id });
    setDragKind("section");
  }

  function onSectionDragEnd() {
    setDragKind(null);
  }

  /** Drop zones surface only when a field/component drag is in flight. */
  const rowDropActive = dragKind === "field" || dragKind === "component";

  function applyDrop(payload: DragPayload, target: RowTarget) {
    if (payload.kind === "component") onAddFieldHere(payload.fieldType, target);
    else if (payload.kind === "field") onMoveFieldHere(payload, target);
  }

  /* -------- Between-row drop lines (drop = create new row) -------- */

  function onNewRowDragOver(e: React.DragEvent, rowIdx: number) {
    if (!isOurDrag(e) || isSkills) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setNewRowDropIdx(rowIdx);
    setJoinRowIdx(null);
  }

  function onNewRowDrop(e: React.DragEvent, rowIdx: number) {
    e.preventDefault();
    setNewRowDropIdx(null);
    setEmptyHover(false);
    if (isSkills) return;
    const payload = readDragPayload(e);
    if (payload) applyDrop(payload, { kind: "newRow", rowIdx });
  }

  /* -------- Row container (drop = join this row) -------- */

  function onRowContainerDragOver(e: React.DragEvent, rowIdx: number) {
    if (!isOurDrag(e) || isSkills) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setJoinRowIdx(rowIdx);
    setNewRowDropIdx(null);
  }

  function onRowContainerDragLeave() {
    setJoinRowIdx(null);
  }

  function onRowContainerDrop(e: React.DragEvent, rowIdx: number) {
    e.preventDefault();
    setJoinRowIdx(null);
    if (isSkills) return;
    const payload = readDragPayload(e);
    if (payload) applyDrop(payload, { kind: "joinRow", rowIdx });
  }

  /* -------- Empty-state drop (when section has zero rows) -------- */

  function onEmptyDragOver(e: React.DragEvent) {
    if (!isOurDrag(e) || isSkills) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setEmptyHover(true);
  }

  function onEmptyDragLeave() {
    setEmptyHover(false);
  }

  function onEmptyDrop(e: React.DragEvent) {
    e.preventDefault();
    setEmptyHover(false);
    if (isSkills) return;
    const payload = readDragPayload(e);
    if (payload) applyDrop(payload, { kind: "newRow", rowIdx: 0 });
  }

  return (
    <section
      className={cn(
        "rounded-xl border bg-white transition-all",
        open ? "border-violet-200 shadow-sm" : "border-gray-200",
        joinRowIdx !== null && !isSkills && "ring-2 ring-violet-300"
      )}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <span
          draggable
          onDragStart={onSectionDragStart}
          onDragEnd={onSectionDragEnd}
          className="-my-1 -ml-1 cursor-grab rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
          title="Drag to reorder section"
          aria-label="Drag handle"
        >
          <GripVertical size={14} />
        </span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-600">
          {index + 1}
        </span>
        {renaming && !isSystem ? (
          <input
            ref={nameInputRef}
            value={section.name}
            onChange={(e) => onPatch({ name: e.target.value })}
            onBlur={() => setRenaming(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") setRenaming(false);
            }}
            className="flex-1 rounded-md border border-violet-300 bg-white px-2 py-1 font-semibold text-gray-900 focus:border-violet-500 focus:outline-none"
          />
        ) : (
          <button
            onClick={onToggleOpen}
            className="flex flex-1 items-center gap-2 text-left font-semibold text-gray-900"
          >
            {section.name}
          </button>
        )}
        {isSystem && (
          // Wireframe: bright red rounded rectangle with white
          // uppercase "System" — matches the General Information /
          // Skills section heads.
          <span className="rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            System
          </span>
        )}
        <span className="text-xs text-gray-400">
          {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
        </span>

        {/* "Repeatable" only applies to custom sections — system
         *  sections (General Information / Skills) are exactly-one
         *  per program by design (Doc 08 §8.1). */}
        {!isSystem && (
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
            <input
              type="checkbox"
              checked={Boolean(section.repeatable)}
              onChange={(e) => onPatch({ repeatable: e.target.checked })}
              className="accent-violet-600"
            />
            Repeatable
          </label>
        )}

        <div className="ml-1 flex items-center gap-0.5">
          <IconButton onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move section up">
            <ChevronUp size={14} />
          </IconButton>
          <IconButton
            onClick={() => onMove(1)}
            disabled={index === totalSections - 1}
            aria-label="Move section down"
          >
            <ChevronDown size={14} />
          </IconButton>
          <div ref={menuRef} className="relative">
            <IconButton onClick={() => setMenuOpen((v) => !v)} aria-label="Section menu">
              <MoreVertical size={14} />
            </IconButton>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-10 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <MenuItem
                  disabled={isSystem}
                  onClick={() => {
                    setMenuOpen(false);
                    setRenaming(true);
                  }}
                  icon={<Pen size={12} />}
                >
                  Rename
                </MenuItem>
                <MenuItem
                  disabled={isSystem}
                  tone="danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  icon={<Trash2 size={12} />}
                >
                  Delete
                </MenuItem>
              </div>
            )}
          </div>
          <button
            onClick={onToggleOpen}
            className="ml-1 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label={open ? "Collapse section" : "Expand section"}
          >
            {open ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="border-t border-gray-100 p-4">
          {isSkills ? (
            <div className="flex items-center gap-3 rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
              <Sparkles size={16} className="text-violet-500" />
              <span>
                Skills are auto-extracted from the uploaded CV — no manual
                fields are configured here.
              </span>
            </div>
          ) : rows.length === 0 ? (
            <div
              onDragOver={onEmptyDragOver}
              onDragLeave={onEmptyDragLeave}
              onDrop={onEmptyDrop}
              className={cn(
                "rounded-lg border-2 border-dashed border-gray-200 px-4 py-10 text-center text-xs text-gray-400 transition-colors",
                emptyHover && "border-violet-400 bg-violet-50 text-violet-700"
              )}
            >
              <p className="mb-1 font-medium">
                {emptyHover ? "Drop here to add" : "No fields yet."}
              </p>
              <p>
                Drag a Component from the toolbox, or click one to append.
              </p>
            </div>
          ) : (
            // Render row-by-row. Each row is a flex container so fields in
            // the same row auto-split width equally. Between-row drop lines
            // ALWAYS render (so the DOM stays stable mid-drag) but stay
            // visually invisible + non-hit-testable until a drag is active.
            <div className="space-y-2">
              <RowDropLine
                active={newRowDropIdx === 0}
                visible={rowDropActive}
                onDragOver={(e) => onNewRowDragOver(e, 0)}
                onDrop={(e) => onNewRowDrop(e, 0)}
              />
              {rows.map((rowFieldIds, rowIdx) => {
                const isJoinTarget = joinRowIdx === rowIdx;
                return (
                <Fragment key={`row-${rowIdx}`}>
                  <div
                    onDragOver={(e) => onRowContainerDragOver(e, rowIdx)}
                    onDragLeave={onRowContainerDragLeave}
                    onDrop={(e) => onRowContainerDrop(e, rowIdx)}
                    className={cn(
                      "relative flex items-stretch gap-2 rounded-md p-1 transition-all",
                      // When the user hovers an existing row to share width,
                      // surface a strong tinted background + violet ring +
                      // dashed outline so the affordance is unmistakable.
                      isJoinTarget &&
                        "bg-violet-100 ring-2 ring-violet-500 outline outline-2 outline-offset-2 outline-violet-300/70"
                    )}
                  >
                    {rowFieldIds.map((fId, i) => {
                      const field = fieldById.get(fId);
                      if (!field) return null;
                      return (
                        <Fragment key={field.id}>
                          <div className="min-w-0 flex-1">
                            <FieldRow
                              field={field}
                              fromSectionId={section.id}
                              onChange={(patch) => patchField(field.id, patch)}
                              onDelete={() => deleteField(field.id)}
                              onDuplicate={() => duplicateField(field.id)}
                              onDragStart={() => setDragKind("field")}
                              onDragEnd={() => setDragKind(null)}
                            />
                          </div>
                          {/* Vertical insertion bar between fields when this
                           *  row is the active join target — communicates
                           *  "the new field will land here, sharing width". */}
                          {isJoinTarget && i < rowFieldIds.length - 1 && (
                            <span className="self-stretch w-1 rounded-full bg-violet-500" aria-hidden />
                          )}
                        </Fragment>
                      );
                    })}
                    {/* Trailing vertical bar + caption when joining the row. */}
                    {isJoinTarget && (
                      <>
                        <span className="self-stretch w-1 rounded-full bg-violet-500" aria-hidden />
                        <span className="pointer-events-none absolute -top-3 right-2 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                          Drop here to share row
                        </span>
                      </>
                    )}
                  </div>
                  <RowDropLine
                    active={newRowDropIdx === rowIdx + 1}
                    visible={rowDropActive}
                    onDragOver={(e) => onNewRowDragOver(e, rowIdx + 1)}
                    onDrop={(e) => onNewRowDrop(e, rowIdx + 1)}
                  />
                </Fragment>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ============================================================
 * Field row
 * ============================================================ */

function FieldRow({
  field,
  fromSectionId,
  onChange,
  onDelete,
  onDuplicate,
  onDragStart,
  onDragEnd,
}: {
  field: ProfileField;
  fromSectionId: string;
  onChange: (patch: Partial<ProfileField>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  // Every field is draggable for reorder. The cross-section move is blocked
  // for system fields downstream in `moveField` — i.e. you can rearrange Full
  // Name within General Information, but you can't move it to another section.
  const hasOptions =
    field.type === "radio" || field.type === "checkbox" || field.type === "select";
  const hasFileConfig = field.type === "file";
  const isSystem = Boolean(field.system);
  return (
    <div
      className={cn(
        "rounded-md border",
        // System fields get a darker, locked look so users can tell at a
        // glance they can only be reordered, not edited.
        isSystem
          ? "border-gray-300 bg-gray-100"
          : "border-gray-200 bg-white"
      )}
    >
    <div className="group flex flex-wrap items-center gap-2 px-2 py-1.5">
      {/* Grip handle is the ONLY draggable element on the row — putting
       *  `draggable` on the outer <div> doesn't work reliably because inputs
       *  and selects inside capture mousedown and never propagate the drag
       *  intent. Padded to ~28×28 so it's a comfortable click target. */}
      <span
        draggable
        onDragStart={(e) => {
          setDragPayload(e, { kind: "field", fromSectionId, fieldId: field.id });
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        className={cn(
          "-my-1 -ml-1 shrink-0 cursor-grab rounded p-1.5 active:cursor-grabbing",
          isSystem
            ? "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        )}
        title={
          isSystem
            ? "System field — drag to reorder within this section. Other edits are locked."
            : "Drag to reorder or move to another section"
        }
        aria-label="Drag handle"
      >
        <GripVertical size={14} />
      </span>
      <FieldTypeIcon type={field.type} />
      {isSystem ? (
        // Locked system field: render the label as a plain (darker) string
        // and a "System" pill so the lock state is obvious at a glance.
        <>
          <span className="min-w-[80px] flex-1 truncate px-1 py-0.5 text-sm font-medium text-gray-700">
            {field.label}
            {field.required && (
              <span className="ml-1 text-red-500" title="Required">
                *
              </span>
            )}
          </span>
          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
            System
          </span>
          <span
            className="ml-1 inline-flex items-center justify-center rounded p-1 text-gray-400"
            title="System field — type, label, required and deletion are all locked. Drag the handle to reorder."
          >
            <Lock size={12} />
          </span>
        </>
      ) : (
        <>
          <input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder={defaultLabelForType(field.type)}
            className="min-w-[80px] flex-1 rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-sm hover:border-gray-200 focus:border-violet-500 focus:outline-none"
          />

          <div className="relative">
            <select
              value={field.type}
              onChange={(e) =>
                onChange({ type: e.target.value as ProfileFieldType })
              }
              className="appearance-none rounded-md border border-gray-200 bg-white py-1 pl-2 pr-7 text-xs text-gray-700 focus:border-violet-500 focus:outline-none"
            >
              {Object.entries(FIELD_TYPE_LABEL).map(([type, label]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          <label
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
              field.required
                ? "bg-violet-50 text-violet-700"
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="accent-violet-600"
            />
            Required
          </label>

          <div className="flex items-center gap-0.5">
            <IconButton onClick={onDuplicate} aria-label="Duplicate field">
              <Copy size={12} />
            </IconButton>
            <IconButton onClick={onDelete} danger aria-label="Delete field">
              <Trash2 size={12} />
            </IconButton>
          </div>
        </>
      )}
    </div>

    {/* Per-type config — shown inline when the field type calls for it.
     *  System fields keep their config visible but locked (the editors are
     *  disabled below via per-row checks; they'll fall through here as
     *  read-only displays). */}
    {hasOptions && !isSystem && (
      <OptionsEditor
        options={field.options ?? []}
        onChange={(options) => onChange({ options })}
      />
    )}
    {hasFileConfig && !isSystem && (
      <FileConfigEditor
        allowedTypes={field.allowedFileTypes ?? []}
        maxFiles={field.maxFiles}
        maxSizeMB={field.maxFileSizeMB}
        onChange={(patch) => onChange(patch)}
      />
    )}
    </div>
  );
}

/* ============================================================
 * Per-type configuration sub-panels
 * ============================================================ */

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="border-t border-gray-100 px-2 py-2">
      <ul className="space-y-1">
        {options.length === 0 && (
          <li className="text-[11px] text-gray-400">No options yet — add one below.</li>
        )}
        {options.map((opt, i) => (
          <li key={i} className="flex items-center gap-2">
            <Circle size={11} className="text-gray-300" />
            <input
              value={opt}
              onChange={(e) => {
                const next = [...options];
                next[i] = e.target.value;
                onChange(next);
              }}
              placeholder="Option text"
              className="flex-1 rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-xs hover:border-gray-200 focus:border-violet-500 focus:outline-none"
            />
            <IconButton
              onClick={() => onChange(options.filter((_, j) => j !== i))}
              aria-label="Remove option"
            >
              <X size={11} />
            </IconButton>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...options, ""])}
        className="mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-violet-600 hover:bg-violet-50"
      >
        <Plus size={10} /> Add Option
      </button>
    </div>
  );
}

function FileConfigEditor({
  allowedTypes,
  maxFiles,
  maxSizeMB,
  onChange,
}: {
  allowedTypes: string[];
  maxFiles: number | undefined;
  maxSizeMB: number | undefined;
  onChange: (patch: Partial<ProfileField>) => void;
}) {
  const restrictTypes = allowedTypes.length > 0;
  return (
    <div className="space-y-2 border-t border-gray-100 bg-gray-50/60 px-3 py-2 text-xs text-gray-700">
      <div className="flex items-center justify-between">
        <span>Only allow specific file types</span>
        <button
          role="switch"
          aria-checked={restrictTypes}
          onClick={() =>
            onChange({
              allowedFileTypes: restrictTypes ? [] : ["pdf", "docx"],
            })
          }
          className={cn(
            "relative inline-flex h-4 w-7 items-center rounded-full transition",
            restrictTypes ? "bg-violet-600" : "bg-gray-300"
          )}
        >
          <span
            className={cn(
              "inline-block h-3 w-3 transform rounded-full bg-white shadow transition",
              restrictTypes ? "translate-x-3.5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>
      {restrictTypes && (
        <div>
          <input
            value={allowedTypes.join(", ")}
            onChange={(e) =>
              onChange({
                allowedFileTypes: e.target.value
                  .split(",")
                  .map((s) => s.trim().toLowerCase())
                  .filter(Boolean),
              })
            }
            placeholder="pdf, docx, png …"
            className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-[11px]"
          />
          <p className="mt-0.5 text-[10px] text-gray-400">
            Comma-separated extensions (without dot).
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1">Maximum number of files</span>
        <input
          type="number"
          min={1}
          value={maxFiles ?? 1}
          onChange={(e) =>
            onChange({ maxFiles: Math.max(1, Number(e.target.value) || 1) })
          }
          className="w-16 rounded border border-gray-300 bg-white px-2 py-0.5 text-[11px]"
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1">Maximum file size</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            value={maxSizeMB ?? 10}
            onChange={(e) =>
              onChange({ maxFileSizeMB: Math.max(1, Number(e.target.value) || 1) })
            }
            className="w-16 rounded border border-gray-300 bg-white px-2 py-0.5 text-[11px]"
          />
          <span className="text-gray-500">MB</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Drop-line indicators (between sections / between fields)
 * ============================================================ */

function SectionDropLine({
  active,
  visible,
  onDragOver,
  onDrop,
}: {
  active: boolean;
  visible: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "rounded transition-all",
        // Hidden until a section drag starts; then it expands to a clear,
        // hittable target with hover feedback.
        visible
          ? active
            ? "my-1 h-12 border-2 border-dashed border-violet-500 bg-violet-100"
            : "my-1 h-8 border-2 border-dashed border-violet-200 bg-violet-50/50"
          : "h-2 -my-1"
      )}
    >
      {visible && active && (
        <p className="text-center text-[11px] font-medium leading-[3rem] text-violet-700">
          Drop section here
        </p>
      )}
    </div>
  );
}

/** Between-row drop target — drop here to create a NEW row at this index.
 *  Always rendered so the DOM doesn't restructure mid-drag (which can break
 *  the browser's drag-source tracking). Visibility + hit-testing are CSS-only
 *  toggles based on `visible`. */
function RowDropLine({
  active,
  visible,
  onDragOver,
  onDrop,
}: {
  active: boolean;
  visible: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "rounded transition-all",
        // Off-state: zero height, no border, pointer-events disabled — fully
        // out of the way in the idle UI but still in the DOM.
        !visible && "pointer-events-none h-0 border-0",
        // Visible-but-not-hovered.
        visible && !active && "h-4 border-2 border-dashed border-violet-200 bg-violet-50/50",
        // Hovered = prominent + label.
        visible && active && "h-8 border-2 border-dashed border-violet-500 bg-violet-100"
      )}
    >
      {visible && active && (
        <p className="text-center text-[11px] font-medium leading-8 text-violet-700">
          Drop as new row
        </p>
      )}
    </div>
  );
}

/* ============================================================
 * Bits
 * ============================================================ */

function FieldTypeIcon({ type }: { type: ProfileFieldType }) {
  const Icon = (() => {
    switch (type) {
      case "text":
      case "email":
      case "phone":
      case "number":
      case "url":
        return Type;
      case "textarea":
        return FileText;
      case "radio":
        return Circle;
      case "checkbox":
        return CheckSquare;
      case "select":
        return List;
      case "file":
        return Upload;
      case "date":
        return CalendarDays;
      case "time":
        return Clock;
    }
  })();
  return <Icon size={12} className="text-gray-400" />;
}

function IconButton({
  children,
  onClick,
  disabled,
  danger,
  ...rest
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
} & React.AriaAttributes) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30",
        danger && "hover:bg-red-50 hover:text-red-600"
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function MenuItem({
  children,
  onClick,
  disabled,
  tone,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "danger";
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        tone === "danger"
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ============================================================
 * Helpers
 * ============================================================ */

/** True if the in-flight drag carries our payload type. Browsers don't allow
 *  reading the actual data during `dragover` (security), so we can only check
 *  the types list. Drop handlers must use readDragPayload + filter. */
function isOurDrag(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types ?? []).includes(DND_MIME);
}
