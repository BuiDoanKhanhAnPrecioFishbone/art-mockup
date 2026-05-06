"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowLeft,
  ChevronDown,
  Copy,
  GripVertical,
  HelpCircle,
  Lock,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  SECTION_TEMPLATE_TAGS,
  type ProfileField,
  type ProfileFieldType,
  type SectionTemplateRecord,
  type SectionTemplateTag,
} from "@/entities/section-template";
import { fieldTypeIcon } from "./pieces";

/* ============================================================
 * Drag payload — same MIME convention as CandidateProfileTab so
 * the affordance feels identical across the app.
 * ============================================================ */

const DND_MIME = "application/x-art-mockup-section-editor";

type DragPayload =
  | { kind: "component"; fieldType: ProfileFieldType }
  | { kind: "field"; fieldId: string };

function setDragPayload(e: React.DragEvent, payload: DragPayload) {
  e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
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

function isOurDrag(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types ?? []).includes(DND_MIME);
}

const FIELD_TYPE_LABEL: Record<ProfileFieldType, string> = {
  text: "Short answer",
  textarea: "Paragraph",
  email: "Email",
  phone: "Phone",
  date: "Date",
  url: "URL",
  number: "Number",
  select: "Dropdown",
  file: "File upload",
  radio: "Radio button",
  checkbox: "Checkbox",
  time: "Time",
};

const TOOLBOX: ProfileFieldType[] = [
  "text",
  "textarea",
  "radio",
  "checkbox",
  "select",
  "file",
  "date",
  "time",
];

interface Props {
  /** When provided, loads the existing record for editing. */
  id?: string;
}

export function SectionEditor({ id }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [section, setSection] = useState<SectionTemplateRecord | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  /** Set while ANY drag is in progress — used to surface drop zones (which
   *  are otherwise tiny invisible slivers users couldn't hit). */
  const [dragKind, setDragKind] = useState<DragPayload["kind"] | null>(null);
  const isCreate = !id;

  useEffect(() => {
    if (!id) {
      setSection({
        id: "draft",
        name: "Untitled Section",
        description: "",
        type: "custom",
        tags: [],
        repeatable: false,
        fields: [],
        layout: [],
        dateModifiedISO: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }
    fetch(`/api/section-templates/${id}`).then(async (r) => {
      if (!r.ok) {
        showToast("error", "Section not found.");
        router.push("/templates/sections");
        return;
      }
      const d = await r.json();
      setSection(d.section);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !section) {
    return (
      <div className="px-8 py-12 text-center text-sm text-gray-400">
        Loading editor…
      </div>
    );
  }

  function update(patch: Partial<SectionTemplateRecord>) {
    setSection((s) => (s ? { ...s, ...patch } : s));
  }

  /** Resolve the section's row layout, defensively. Mirrors
   *  `getSectionRows` in entities/program/model/profile.ts. */
  function resolveRows(s: SectionTemplateRecord): string[][] {
    const valid = new Set(s.fields.map((f) => f.id));
    const layout = s.layout;
    if (!layout) return s.fields.map((f) => [f.id]);
    const rows: string[][] = [];
    const seen = new Set<string>();
    for (const row of layout) {
      const cleaned = row.filter((id) => valid.has(id));
      if (cleaned.length === 0) continue;
      cleaned.forEach((id) => seen.add(id));
      rows.push(cleaned);
    }
    for (const f of s.fields) {
      if (!seen.has(f.id)) rows.push([f.id]);
    }
    return rows;
  }

  type DropTarget =
    | { kind: "newRow"; rowIdx: number }
    | { kind: "joinRow"; rowIdx: number };

  function newField(type: ProfileFieldType): ProfileField {
    return {
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: defaultLabelForType(type),
      type,
      required: false,
      options:
        type === "radio" || type === "checkbox" || type === "select"
          ? ["Option 1", "Option 2"]
          : undefined,
      ...(type === "file"
        ? {
            allowedFileTypes: ["pdf", "docx"],
            maxFiles: 1,
            maxFileSizeMB: 10,
          }
        : {}),
    };
  }

  function addFieldAt(type: ProfileFieldType, target: DropTarget) {
    if (!section) return;
    const field = newField(type);
    const rows = resolveRows(section);
    let layout: string[][];
    if (target.kind === "newRow") {
      layout = [...rows];
      const at = Math.max(0, Math.min(target.rowIdx, layout.length));
      layout.splice(at, 0, [field.id]);
    } else {
      layout = rows.map((row, i) =>
        i === target.rowIdx ? [...row, field.id] : row
      );
    }
    update({ fields: [...section.fields, field], layout });
  }

  function moveFieldTo(fieldId: string, target: DropTarget) {
    if (!section) return;
    const rows = resolveRows(section);
    const stripped = rows
      .map((row) => row.filter((id) => id !== fieldId))
      .filter((row) => row.length > 0);
    let layout: string[][];
    if (target.kind === "newRow") {
      layout = [...stripped];
      const at = Math.max(0, Math.min(target.rowIdx, layout.length));
      layout.splice(at, 0, [fieldId]);
    } else {
      // Don't join the same row the field is already on (no-op).
      const sourceRowIdx = rows.findIndex((row) => row.includes(fieldId));
      // After stripping the field, row indices may have shifted. Resolve
      // target by matching the row's surviving members.
      const targetMembers = rows[target.rowIdx]?.filter(
        (id) => id !== fieldId
      );
      if (!targetMembers || targetMembers.length === 0) {
        // Target row only contained the field — fall back to no-op.
        if (sourceRowIdx === target.rowIdx) return;
        layout = [...stripped, [fieldId]];
      } else {
        layout = stripped.map((row) => {
          // Identify the same row by comparing member ids.
          if (
            row.length === targetMembers.length &&
            row.every((id, i) => id === targetMembers[i])
          ) {
            return [...row, fieldId];
          }
          return row;
        });
      }
    }
    update({ layout });
  }

  function patchField(id: string, patch: Partial<ProfileField>) {
    if (!section) return;
    update({
      fields: section.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }

  function copyField(id: string) {
    if (!section) return;
    const idx = section.fields.findIndex((f) => f.id === id);
    if (idx === -1) return;
    const orig = section.fields[idx];
    if (orig.system) {
      showToast("error", "System fields can't be duplicated.");
      return;
    }
    const copy: ProfileField = {
      ...orig,
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: `${orig.label} (copy)`,
      system: false,
    };
    // Place the copy on a new row directly below the source's row.
    const rows = resolveRows(section);
    const srcRowIdx = rows.findIndex((row) => row.includes(id));
    const layout = [...rows];
    layout.splice(srcRowIdx + 1, 0, [copy.id]);
    update({ fields: [...section.fields, copy], layout });
  }

  function deleteField(id: string) {
    if (!section) return;
    const f = section.fields.find((x) => x.id === id);
    if (!f) return;
    if (f.system) {
      showToast("error", "System fields can't be deleted.");
      return;
    }
    const layout = resolveRows(section)
      .map((row) => row.filter((fid) => fid !== id))
      .filter((row) => row.length > 0);
    update({
      fields: section.fields.filter((x) => x.id !== id),
      layout,
    });
  }

  async function handleSave() {
    if (!section) return;
    if (!section.name.trim()) {
      showToast("error", "Section name is required.");
      return;
    }
    setSaving(true);
    // Persist the resolved layout so reloading shows the same row groupings.
    const layout = resolveRows(section);
    try {
      if (isCreate) {
        const res = await fetch("/api/section-templates", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: section.name,
            description: section.description,
            type: "custom",
            tags: section.tags,
            repeatable: section.repeatable,
            fields: section.fields,
            layout,
          }),
        });
        if (!res.ok) {
          showToast("error", "Could not create section.");
          return;
        }
        const data = await res.json();
        showToast("success", `${data.section.name} created.`);
        router.push(`/templates/sections/${data.section.id}`);
      } else {
        const res = await fetch(`/api/section-templates/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: section.name,
            description: section.description,
            tags: section.tags,
            repeatable: section.repeatable,
            fields: section.fields,
            layout,
          }),
        });
        if (!res.ok) {
          showToast("error", "Could not save changes.");
          return;
        }
        showToast("success", "Section saved.");
        router.push(`/templates/sections/${id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  const rows = resolveRows(section);
  const fieldById = new Map(section.fields.map((f) => [f.id, f]));
  const dropActive = dragKind === "field" || dragKind === "component";

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <Link
            href={
              isCreate ? "/templates/sections" : `/templates/sections/${id}`
            }
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={13} />
            {isCreate ? "Back to library" : "Back to section"}
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-500">
            Section Template / {section.name || "New Section"}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            {isCreate ? "Create Section" : `Edit "${section.name}"`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={
              isCreate ? "/templates/sections" : `/templates/sections/${id}`
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !section.name.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Canvas */}
        <div className="space-y-4">
          {/* Section metadata */}
          <SectionMetadataCard
            section={section}
            onChange={update}
            isCreate={isCreate}
          />

          {/* Field layout */}
          <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Fields</h3>
              <p className="text-xs text-gray-500">
                {section.fields.length} field
                {section.fields.length === 1 ? "" : "s"}
              </p>
            </div>

            {section.fields.length === 0 ? (
              <EmptyDropZone
                onAddField={(type) =>
                  addFieldAt(type, { kind: "newRow", rowIdx: 0 })
                }
                onMoveField={(fieldId) =>
                  moveFieldTo(fieldId, { kind: "newRow", rowIdx: 0 })
                }
              />
            ) : (
              <FieldCanvas
                rows={rows}
                fieldById={fieldById}
                dropActive={dropActive}
                onAddField={addFieldAt}
                onMoveField={moveFieldTo}
                onDragStart={setDragKind}
                onDragEnd={() => setDragKind(null)}
                onPatchField={patchField}
                onCopyField={copyField}
                onDeleteField={deleteField}
              />
            )}
            <p className="text-center text-[11px] text-gray-400">
              Drop a tool between rows for a new row, or onto an existing row
              to share width. Drag a field's grip to relayout.
            </p>
          </div>
        </div>

        {/* Toolbox */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Toolbox
              </h3>
              <span
                title="Drag any tool onto the canvas, or click to append a new row at the end."
                className="cursor-help text-gray-400"
              >
                <HelpCircle size={12} />
              </span>
            </div>
            <ul className="space-y-1.5">
              {TOOLBOX.map((t) => (
                <li key={t}>
                  <button
                    draggable
                    onDragStart={(e) => {
                      setDragPayload(e, { kind: "component", fieldType: t });
                      setDragKind("component");
                    }}
                    onDragEnd={() => setDragKind(null)}
                    onClick={() =>
                      addFieldAt(t, {
                        kind: "newRow",
                        rowIdx: Number.MAX_SAFE_INTEGER,
                      })
                    }
                    className="group flex w-full cursor-grab items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-medium text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 active:cursor-grabbing"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600 group-hover:bg-violet-100 group-hover:text-violet-700">
                      {fieldTypeIcon(t)}
                    </span>
                    <span className="flex-1">{FIELD_TYPE_LABEL[t]}</span>
                    <Plus
                      size={12}
                      className="text-gray-400 group-hover:text-violet-700"
                    />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-gray-500">
              Drag onto the canvas, or click to append.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
 * Field canvas — between-row drop lines + per-row containers
 * ============================================================ */

function FieldCanvas({
  rows,
  fieldById,
  dropActive,
  onAddField,
  onMoveField,
  onDragStart,
  onDragEnd,
  onPatchField,
  onCopyField,
  onDeleteField,
}: {
  rows: string[][];
  fieldById: Map<string, ProfileField>;
  dropActive: boolean;
  onAddField: (
    type: ProfileFieldType,
    target:
      | { kind: "newRow"; rowIdx: number }
      | { kind: "joinRow"; rowIdx: number }
  ) => void;
  onMoveField: (
    fieldId: string,
    target:
      | { kind: "newRow"; rowIdx: number }
      | { kind: "joinRow"; rowIdx: number }
  ) => void;
  onDragStart: (k: DragPayload["kind"]) => void;
  onDragEnd: () => void;
  onPatchField: (id: string, p: Partial<ProfileField>) => void;
  onCopyField: (id: string) => void;
  onDeleteField: (id: string) => void;
}) {
  const [newRowDropIdx, setNewRowDropIdx] = useState<number | null>(null);
  const [joinRowIdx, setJoinRowIdx] = useState<number | null>(null);

  function applyDrop(
    payload: DragPayload,
    target:
      | { kind: "newRow"; rowIdx: number }
      | { kind: "joinRow"; rowIdx: number }
  ) {
    if (payload.kind === "component")
      onAddField(payload.fieldType, target);
    else if (payload.kind === "field") onMoveField(payload.fieldId, target);
  }

  function onNewRowDragOver(e: React.DragEvent, rowIdx: number) {
    if (!isOurDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setNewRowDropIdx(rowIdx);
    setJoinRowIdx(null);
  }

  function onNewRowDrop(e: React.DragEvent, rowIdx: number) {
    e.preventDefault();
    setNewRowDropIdx(null);
    const payload = readDragPayload(e);
    if (payload) applyDrop(payload, { kind: "newRow", rowIdx });
  }

  function onRowContainerDragOver(e: React.DragEvent, rowIdx: number) {
    if (!isOurDrag(e)) return;
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
    const payload = readDragPayload(e);
    if (payload) applyDrop(payload, { kind: "joinRow", rowIdx });
  }

  return (
    <div className="space-y-1">
      <RowDropLine
        active={newRowDropIdx === 0}
        visible={dropActive}
        onDragOver={(e) => onNewRowDragOver(e, 0)}
        onDrop={(e) => onNewRowDrop(e, 0)}
      />
      {rows.map((rowFieldIds, rowIdx) => (
        <Fragment key={`row-${rowIdx}`}>
          <div
            onDragOver={(e) => onRowContainerDragOver(e, rowIdx)}
            onDragLeave={onRowContainerDragLeave}
            onDrop={(e) => onRowContainerDrop(e, rowIdx)}
            className={cn(
              "flex items-stretch gap-2 rounded-md p-1 transition-colors",
              joinRowIdx === rowIdx && "bg-violet-50 ring-2 ring-violet-300"
            )}
          >
            {rowFieldIds.map((fid) => {
              const field = fieldById.get(fid);
              if (!field) return null;
              return (
                <div key={field.id} className="min-w-0 flex-1">
                  <FieldRow
                    field={field}
                    onChange={(p) => onPatchField(field.id, p)}
                    onCopy={() => onCopyField(field.id)}
                    onDelete={() => onDeleteField(field.id)}
                    onDragStart={() => onDragStart("field")}
                    onDragEnd={onDragEnd}
                  />
                </div>
              );
            })}
          </div>
          <RowDropLine
            active={newRowDropIdx === rowIdx + 1}
            visible={dropActive}
            onDragOver={(e) => onNewRowDragOver(e, rowIdx + 1)}
            onDrop={(e) => onNewRowDrop(e, rowIdx + 1)}
          />
        </Fragment>
      ))}
    </div>
  );
}

/* ============================================================
 * Empty-state drop zone (when section has zero fields)
 * ============================================================ */

function EmptyDropZone({
  onAddField,
  onMoveField,
}: {
  onAddField: (type: ProfileFieldType) => void;
  onMoveField: (fieldId: string) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        if (!isOurDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        const payload = readDragPayload(e);
        if (!payload) return;
        if (payload.kind === "component") onAddField(payload.fieldType);
        else if (payload.kind === "field") onMoveField(payload.fieldId);
      }}
      className={cn(
        "rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center transition-colors",
        hover && "border-violet-400 bg-violet-50 text-violet-700"
      )}
    >
      <p className="text-sm font-medium text-gray-600">
        {hover ? "Drop here to add" : "No fields yet."}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        Drag a Toolbox item onto the canvas, or click one to append.
      </p>
    </div>
  );
}

/* ============================================================
 * Between-row drop line
 * ============================================================ */

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
        !visible && "pointer-events-none h-0 border-0",
        visible &&
          !active &&
          "h-4 border-2 border-dashed border-violet-200 bg-violet-50/50",
        visible &&
          active &&
          "h-8 border-2 border-dashed border-violet-500 bg-violet-100"
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
 * Section metadata card — Name / Tag / Repeatable
 * ============================================================ */

function SectionMetadataCard({
  section,
  onChange,
  isCreate,
}: {
  section: SectionTemplateRecord;
  onChange: (patch: Partial<SectionTemplateRecord>) => void;
  isCreate: boolean;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div>
        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
          Section Name<span className="text-red-500">*</span>
        </label>
        <input
          value={section.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Education"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Type
          </label>
          <input
            value={isCreate || section.type === "custom" ? "Custom" : "System"}
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            {section.type === "system"
              ? "System sections allow only metadata edits — fields are protected."
              : "Custom sections support full editing and deletion."}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Tag
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SECTION_TEMPLATE_TAGS.map((t) => {
              const on = section.tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onChange({
                      tags: on
                        ? section.tags.filter((x) => x !== t)
                        : ([...section.tags, t] as SectionTemplateTag[]),
                    });
                  }}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                    on
                      ? "border-violet-300 bg-violet-50 text-violet-700"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
          <span
            role="switch"
            aria-checked={section.repeatable}
            onClick={() => onChange({ repeatable: !section.repeatable })}
            className={cn(
              "relative inline-flex h-4 w-7 cursor-pointer items-center rounded-full transition-colors",
              section.repeatable ? "bg-violet-600" : "bg-gray-300"
            )}
          >
            <span
              className={cn(
                "inline-block h-3 w-3 transform rounded-full bg-white shadow transition",
                section.repeatable ? "translate-x-3.5" : "translate-x-0.5"
              )}
            />
          </span>
          Repeatable Section
          <span title="Allow multiple entries for the same information category.">
            <HelpCircle size={11} className="text-gray-400" />
          </span>
        </label>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Description
        </label>
        <input
          value={section.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Optional — helps recruiters find this section."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ============================================================
 * Per-field row (with grip-handle drag, type picker, options, etc.)
 * ============================================================ */

function FieldRow({
  field,
  onChange,
  onCopy,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  field: ProfileField;
  onChange: (p: Partial<ProfileField>) => void;
  onCopy: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const isChoice =
    field.type === "radio" ||
    field.type === "checkbox" ||
    field.type === "select";
  const isFile = field.type === "file";

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 px-2 py-1.5">
        {/* Grip is the ONLY draggable element on the row — putting `draggable`
         *  on the outer wrapper doesn't work reliably because nested inputs
         *  capture mousedown and never propagate. */}
        <span
          draggable
          onDragStart={(e) => {
            setDragPayload(e, { kind: "field", fieldId: field.id });
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          className="-my-1 -ml-1 shrink-0 cursor-grab rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
          title={
            field.system
              ? "Drag to reorder (system field — type & deletion are locked)"
              : "Drag to relayout"
          }
        >
          <GripVertical size={14} />
        </span>
        <span className="shrink-0 text-gray-400">
          {fieldTypeIcon(field.type)}
        </span>
        <input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Field label"
          className="min-w-[80px] flex-1 rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-sm hover:border-gray-200 focus:border-violet-500 focus:outline-none"
        />

        {/* Type picker */}
        <div className="relative shrink-0">
          <select
            value={field.type}
            onChange={(e) =>
              onChange({
                type: e.target.value as ProfileFieldType,
                ...(e.target.value === "radio" ||
                e.target.value === "checkbox" ||
                e.target.value === "select"
                  ? { options: field.options ?? ["Option 1", "Option 2"] }
                  : { options: undefined }),
              })
            }
            disabled={field.system}
            title={
              field.system ? "Type is locked for system fields." : undefined
            }
            className={cn(
              "appearance-none rounded-md border border-gray-200 bg-white py-1 pl-2 pr-7 text-xs text-gray-700 focus:border-violet-500 focus:outline-none",
              field.system && "cursor-not-allowed bg-gray-50 text-gray-400"
            )}
          >
            {Object.entries(FIELD_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Required toggle */}
        <label
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
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

        <div className="flex shrink-0 items-center gap-0.5">
          {!field.system && (
            <button
              onClick={onCopy}
              className="rounded p-1 text-gray-400 hover:bg-violet-50 hover:text-violet-700"
              title="Duplicate"
              aria-label="Duplicate field"
            >
              <Copy size={12} />
            </button>
          )}
          {field.system ? (
            <span
              className="ml-1 inline-flex items-center justify-center rounded p-1 text-gray-300"
              title="System field — cannot be deleted"
            >
              <Lock size={12} />
            </span>
          ) : (
            <button
              onClick={onDelete}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Delete"
              aria-label="Delete field"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {isChoice && (
        <ChoiceOptionsEditor
          options={field.options ?? []}
          onChange={(options) => onChange({ options })}
        />
      )}
      {isFile && <FileFieldOptions field={field} onPatch={onChange} />}
      {field.type === "textarea" && (
        <p className="border-t border-gray-100 px-3 py-1 text-[11px] text-gray-500">
          <AlignLeft size={10} className="mr-1 inline align-text-bottom" />
          Renders as a multi-line text area on the candidate form.
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- */

function ChoiceOptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-1.5 border-t border-gray-100 px-3 py-2">
      {options.map((o, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400">{i + 1}.</span>
          <input
            value={o}
            onChange={(e) => {
              const next = [...options];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:border-violet-500 focus:outline-none"
          />
          <button
            onClick={() => onChange(options.filter((_, j) => j !== i))}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove option ${o}`}
          >
            <X size={11} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...options, `Option ${options.length + 1}`])}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 hover:text-violet-900"
      >
        <Plus size={11} />
        Add option
      </button>
    </div>
  );
}

function FileFieldOptions({
  field,
  onPatch,
}: {
  field: ProfileField;
  onPatch: (p: Partial<ProfileField>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border-t border-gray-100 px-3 py-2 sm:grid-cols-3">
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-600">
          Allowed types
        </label>
        <input
          value={field.allowedFileTypes?.join(", ") ?? ""}
          onChange={(e) =>
            onPatch({
              allowedFileTypes: e.target.value
                .split(",")
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean),
            })
          }
          placeholder="pdf, docx"
          className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-600">
          Max files
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={field.maxFiles ?? 1}
          onChange={(e) =>
            onPatch({ maxFiles: Math.max(1, Number(e.target.value) || 1) })
          }
          className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-600">
          Max size (MB)
        </label>
        <input
          type="number"
          min={1}
          max={500}
          value={field.maxFileSizeMB ?? 10}
          onChange={(e) =>
            onPatch({
              maxFileSizeMB: Math.max(1, Number(e.target.value) || 1),
            })
          }
          className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- */

function defaultLabelForType(t: ProfileFieldType): string {
  switch (t) {
    case "text":
      return "Short answer";
    case "textarea":
      return "Paragraph";
    case "radio":
      return "Pick one";
    case "checkbox":
      return "Pick many";
    case "select":
      return "Dropdown";
    case "file":
      return "Upload file";
    case "date":
      return "Date";
    case "time":
      return "Time";
    case "email":
      return "Email";
    case "phone":
      return "Phone";
    case "number":
      return "Number";
    case "url":
      return "URL";
  }
}
