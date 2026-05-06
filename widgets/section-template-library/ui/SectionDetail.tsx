"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  formatRelative,
  type SectionTemplateRecord,
} from "@/entities/section-template";
import { FieldPreview, TagPill, TypePill } from "./pieces";

export function SectionDetail({ id }: { id: string }) {
  const router = useRouter();
  const [section, setSection] = useState<SectionTemplateRecord | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/section-templates/${id}`).then(async (r) => {
      if (!r.ok) {
        setNotFound(true);
        return;
      }
      const d = await r.json();
      setSection(d.section);
    });
  }, [id]);

  if (notFound) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="font-medium text-gray-700">Section not found.</p>
        <Link
          href="/templates/sections"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-700 hover:text-violet-900"
        >
          <ArrowLeft size={13} />
          Back to library
        </Link>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="px-8 py-12 text-center text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  // Resolve rows from layout (defaulting to one field per row).
  const validIds = new Set(section.fields.map((f) => f.id));
  const rows: string[][] = section.layout
    ? section.layout
        .map((row) => row.filter((id) => validIds.has(id)))
        .filter((row) => row.length > 0)
    : section.fields.map((f) => [f.id]);
  // Append any orphan field not in layout.
  const seen = new Set(rows.flat());
  for (const f of section.fields) {
    if (!seen.has(f.id)) rows.push([f.id]);
  }

  const fieldById = new Map(section.fields.map((f) => [f.id, f]));

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/templates/sections"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={13} />
            Back to library
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-500">
            Section Template / {section.name}
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
            {section.name}
            <TypePill type={section.type} />
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {section.tags.length > 0 && (
              <span className="flex items-center gap-1">
                {section.tags.map((t) => (
                  <TagPill key={t} label={t} />
                ))}
              </span>
            )}
            {section.repeatable && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                Repeatable
              </span>
            )}
            <span>·</span>
            <span>Last modified {formatRelative(section.dateModifiedISO)}</span>
          </div>
          {section.description && (
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              {section.description}
            </p>
          )}
        </div>
        <Link
          href={`/templates/sections/${section.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Pencil size={14} />
          Edit
        </Link>
      </div>

      {/* Field preview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        {section.fields.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
            This section has no fields yet. Click{" "}
            <button
              onClick={() =>
                router.push(`/templates/sections/${section.id}/edit`)
              }
              className="font-semibold text-violet-700 hover:underline"
            >
              Edit
            </button>{" "}
            to add some.
          </p>
        ) : (
          <div className="space-y-4">
            {rows.map((row, ri) => (
              <div key={ri} className="flex flex-wrap items-end gap-3">
                {row.map((fid) => {
                  const f = fieldById.get(fid);
                  if (!f) return null;
                  return (
                    <div key={fid} className="flex-1 min-w-[220px]">
                      <FieldPreview
                        label={f.label}
                        type={f.type}
                        required={f.required}
                        options={f.options}
                        locked={f.system}
                        fileTypes={f.allowedFileTypes}
                        maxFiles={f.maxFiles}
                        maxFileSizeMB={f.maxFileSizeMB}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <p className="mt-4 text-xs text-gray-500">
        This is a preview of how the section appears inside a candidate profile
        form. {section.type === "system" ? "System" : "Custom"} sections like
        this can be added to any program from{" "}
        <strong>Settings → Candidate Profile</strong> on the program detail
        page.
      </p>

    </div>
  );
}
