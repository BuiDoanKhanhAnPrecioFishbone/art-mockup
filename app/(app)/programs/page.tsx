"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import {
  AppliedFilterChips,
  FilterButton,
  FilterModal,
  countActiveFilters,
  isFieldActive,
  type FilterField,
  type FilterValues,
} from "@/shared/ui/filter";
import { useToast } from "@/shared/ui/toast";
import type { Program } from "@/entities/program";
import { ProgramCard, ProgramsEmptyState } from "@/widgets/program-list";

const FILTER_FIELDS: FilterField[] = [
  {
    id: "status",
    label: "Status",
    kind: "multi-select",
    options: [
      { value: "active", label: "Active" },
      { value: "closed", label: "Closed" },
      { value: "draft", label: "Draft" },
    ],
  },
  {
    id: "position",
    label: "Position",
    kind: "multi-select",
    options: [
      { value: "Marketing", label: "Marketing" },
      { value: "Backend Developer", label: "Backend Developer" },
      { value: "Fullstack Developer", label: "Fullstack Developer" },
      { value: "Software Engineer", label: "Software Engineer" },
    ],
  },
  {
    id: "level",
    label: "Level",
    kind: "multi-select",
    options: [
      { value: "Intern", label: "Intern" },
      { value: "Fresher", label: "Fresher" },
      { value: "Junior", label: "Junior" },
      { value: "Mid", label: "Mid" },
      { value: "Senior", label: "Senior" },
    ],
  },
  {
    id: "dateRange",
    label: "Recruitment Period",
    kind: "date-range",
  },
  {
    id: "headcount",
    label: "Headcount",
    kind: "range",
    min: 0,
    max: 100,
  },
];

function matchesFilters(program: Program, values: FilterValues): boolean {
  for (const field of FILTER_FIELDS) {
    const v = values[field.id];
    if (!isFieldActive(v)) continue;
    if (v?.kind === "multi-select") {
      if (field.id === "status" && !v.values.includes(program.status)) return false;
      if (field.id === "position" && !v.values.includes(program.position)) return false;
      if (field.id === "level" && !v.values.includes(program.level)) return false;
    }
    if (v?.kind === "date-range") {
      if (v.from && program.endDate < v.from) return false;
      if (v.to && program.startDate > v.to) return false;
    }
    if (v?.kind === "range") {
      if (v.operator === "between" || v.operator === "gt") {
        if (v.min !== undefined && program.headcount < v.min) return false;
      }
      if (v.operator === "between" || v.operator === "lt") {
        if (v.max !== undefined && program.headcount > v.max) return false;
      }
    }
  }
  return true;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const { showToast } = useToast();
  const router = useRouter();

  async function refresh() {
    const res = await fetch("/api/programs");
    const data = await res.json();
    setPrograms(data.programs);
    setLoading(false);
    // First-run bootstrap of the reviewed-applicants set — anything
    // older than 48h is auto-marked reviewed so the demo opens with
    // a clean inbox; truly fresh applicants stay flagged. Idempotent.
    const allCandidates = (data.programs as Program[]).flatMap(
      (p) => p.candidates ?? []
    );
    if (allCandidates.length > 0) {
      const { bootstrapReviewedFromCandidates } = await import(
        "@/shared/lib/reviewed-applicants"
      );
      bootstrapReviewedFromCandidates(allCandidates);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !p.position.toLowerCase().includes(q))
        return false;
      return matchesFilters(p, filterValues);
    });
  }, [programs, search, filterValues]);

  const activeCount = countActiveFilters(filterValues);
  const isEmptyAccount = !loading && programs.length === 0;

  async function handleDelete(id: string) {
    const program = programs.find((p) => p.id === id);
    if (!program) return;
    const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast("error", data.error ?? "Could not delete program.");
      return;
    }
    showToast("success", `Program "${program.title}" deleted.`);
    refresh();
  }

  async function handleDuplicate(id: string) {
    const program = programs.find((p) => p.id === id);
    if (!program) return;
    const res = await fetch(`/api/programs/${id}/duplicate`, { method: "POST" });
    if (!res.ok) {
      showToast("error", "Could not duplicate program.");
      return;
    }
    const { program: copy } = await res.json();
    showToast(
      "success",
      `Cloned "${program.title}" — opening for edit.`
    );
    // Per spec: clone-from-existing flow lands on the edit form so the user
    // can adjust settings before publishing.
    router.push(`/programs/${copy.id}/edit`);
  }

  async function handleMarkClosed(id: string) {
    const program = programs.find((p) => p.id === id);
    if (!program) return;
    const res = await fetch(`/api/programs/${id}/close`, { method: "POST" });
    if (!res.ok) {
      showToast("error", "Could not close program.");
      return;
    }
    showToast("success", `"${program.title}" marked as closed.`);
    refresh();
  }

  function handleOpen(id: string) {
    // Whole-card click → land on the Settings tab (default).
    router.push(`/programs/${id}/edit`);
  }

  function handleEdit(id: string) {
    router.push(`/programs/${id}/edit`);
  }

  function handleViewApplicants(id: string) {
    // Deep-link to the Pipelines tab so the recruiter goes straight to the
    // candidate kanban / grid for this program.
    router.push(`/programs/${id}/edit?tab=pipelines`);
  }

  function handleCreate() {
    router.push("/programs/new");
  }

  function removeFilter(id: string) {
    setFilterValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            Recruitment & Program
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Programs
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const { resetReviewedDemoState } = await import(
                "@/shared/lib/reviewed-applicants"
              );
              resetReviewedDemoState();
              // Re-seed the server programs store too so fixture changes
              // (criterion categories etc.) propagate without a dev-server
              // restart.
              try {
                await fetch("/api/demo-reset", { method: "POST" });
              } catch {
                // demo-only — ignore failures silently
              }
              showToast(
                "success",
                "Demo state cleared — NEW badges, pipeline, and seeded programs reset."
              );
              void refresh();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            title="Wipe localStorage and re-seed the programs store from fixtures"
          >
            ↺ Reset demo data
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Plus size={16} />
            Add New Program
          </button>
        </div>
      </div>

      {/* Search + Filter row */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-2xl">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword, position, …"
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
        <FilterButton
          activeCount={activeCount}
          onClick={() => setFilterOpen(true)}
        />
      </div>

      {/* Applied filter chips */}
      {activeCount > 0 && (
        <div className="mb-4">
          <AppliedFilterChips
            fields={FILTER_FIELDS}
            values={filterValues}
            onRemove={removeFilter}
            onClearAll={() => setFilterValues({})}
          />
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          Loading programs…
        </div>
      ) : isEmptyAccount ? (
        <ProgramsEmptyState onCreate={handleCreate} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="font-medium text-gray-500">No programs match these filters</p>
          <p className="mt-1 text-sm text-gray-400">
            Try adjusting the search or clearing some filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onOpen={handleOpen}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onMarkClosed={handleMarkClosed}
              onDelete={handleDelete}
              onViewApplicants={handleViewApplicants}
            />
          ))}
        </div>
      )}

      {/* Filter modal */}
      <FilterModal
        open={filterOpen}
        fields={FILTER_FIELDS}
        initialValues={filterValues}
        onApply={(v) => {
          setFilterValues(v);
          setFilterOpen(false);
        }}
        onCancel={() => setFilterOpen(false)}
      />
    </div>
  );
}
