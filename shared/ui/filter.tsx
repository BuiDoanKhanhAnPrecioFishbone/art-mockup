"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Filter as FilterIcon, Info, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/* ------------------------------------------------------------------ */
/* Types — the public contract for any screen using the Filter modal. */
/* ------------------------------------------------------------------ */

export interface FilterOption {
  value: string;
  label: string;
}

export type FilterField =
  | { id: string; label: string; kind: "single-select"; options: FilterOption[] }
  | { id: string; label: string; kind: "multi-select"; options: FilterOption[] }
  | {
      id: string;
      label: string;
      kind: "range";
      min: number;
      max: number;
      step?: number;
      unit?: string;
    }
  | { id: string; label: string; kind: "date" }
  | { id: string; label: string; kind: "date-range" };

export type FilterValue =
  | { kind: "single-select"; value: string }
  | { kind: "multi-select"; values: string[] }
  | {
      kind: "range";
      operator: "between" | "gt" | "lt";
      min?: number;
      max?: number;
    }
  | { kind: "date"; date: string }
  | { kind: "date-range"; from?: string; to?: string };

export type FilterValues = Record<string, FilterValue | undefined>;

export function isFieldActive(value: FilterValue | undefined): boolean {
  if (!value) return false;
  switch (value.kind) {
    case "single-select":
      return value.value !== "";
    case "multi-select":
      return value.values.length > 0;
    case "range":
      return value.min !== undefined || value.max !== undefined;
    case "date":
      return Boolean(value.date);
    case "date-range":
      return Boolean(value.from || value.to);
  }
}

/* ------------------------------------------------------------------ */
/* Modal                                                              */
/* ------------------------------------------------------------------ */

interface FilterModalProps {
  open: boolean;
  fields: FilterField[];
  initialValues: FilterValues;
  onApply: (values: FilterValues) => void;
  onCancel: () => void;
}

export function FilterModal({
  open,
  fields,
  initialValues,
  onApply,
  onCancel,
}: FilterModalProps) {
  const [values, setValues] = useState<FilterValues>(initialValues);
  const [selectedId, setSelectedId] = useState<string>(fields[0]?.id ?? "");

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setSelectedId((current) => current || fields[0]?.id || "");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialValues, fields]);

  const selectedField = useMemo(
    () => fields.find((f) => f.id === selectedId) ?? fields[0],
    [fields, selectedId]
  );

  if (!open) return null;

  function setFieldValue(id: string, value: FilterValue | undefined) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function clearAll() {
    setValues({});
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header — white background, yellow icon tile + title + close. */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-300 text-amber-900">
              <FilterIcon size={18} />
            </span>
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <span
              title="Pick a field on the left, then choose a value on the right."
              className="cursor-help text-gray-300 hover:text-gray-500"
            >
              <Info size={14} />
            </span>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close filter"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body — two columns. The left rail is white, separator on the
         *  right; the active row gets a tinted bg + a vertical violet bar
         *  on the left edge. */}
        <div className="flex h-[420px]">
          {/* Left rail: field list */}
          <div className="w-60 shrink-0 overflow-y-auto border-r border-gray-200 bg-white py-2">
            {fields.map((field) => {
              const active = isFieldActive(values[field.id]);
              const selected = field.id === selectedField?.id;
              return (
                <button
                  key={field.id}
                  onClick={() => setSelectedId(field.id)}
                  className={cn(
                    "relative flex w-full items-center justify-between px-5 py-2.5 text-sm transition-colors",
                    selected
                      ? "bg-violet-50 font-semibold text-violet-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {/* Vertical violet bar on the active row's left edge. */}
                  {selected && (
                    <span className="absolute inset-y-1 left-0 w-0.5 rounded-r bg-violet-600" />
                  )}
                  <span className="truncate text-left">{field.label}</span>
                  {/* Filled-dot indicator when the field has a value but
                   *  isn't the currently-selected row. The selected row
                   *  doesn't show one because the row tint already says
                   *  "this is active". */}
                  {active && !selected && (
                    <span
                      className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-violet-600"
                      aria-label="Filter applied"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right pane: control for the selected field */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedField && (
              <FieldControl
                field={selectedField}
                value={values[selectedField.id]}
                onChange={(v) => setFieldValue(selectedField.id, v)}
              />
            )}
          </div>
        </div>

        {/* Footer — Clear All on the left, Cancel + Apply on the right. */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3">
          <button
            onClick={clearAll}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
          >
            Clear All
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="rounded-lg border border-gray-300 bg-white px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(values)}
              className="rounded-lg bg-violet-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Per-type field controls                                            */
/* ------------------------------------------------------------------ */

interface FieldControlProps {
  field: FilterField;
  value: FilterValue | undefined;
  onChange: (value: FilterValue | undefined) => void;
}

function FieldControl({ field, value, onChange }: FieldControlProps) {
  switch (field.kind) {
    case "single-select":
      return (
        <SingleSelectControl
          options={field.options}
          value={value?.kind === "single-select" ? value.value : ""}
          onChange={(v) =>
            onChange(v ? { kind: "single-select", value: v } : undefined)
          }
        />
      );
    case "multi-select":
      return (
        <MultiSelectControl
          options={field.options}
          values={value?.kind === "multi-select" ? value.values : []}
          onChange={(vs) =>
            onChange(vs.length ? { kind: "multi-select", values: vs } : undefined)
          }
        />
      );
    case "range":
      return (
        <RangeControl
          min={field.min}
          max={field.max}
          unit={field.unit}
          value={value?.kind === "range" ? value : undefined}
          onChange={(v) => onChange(v)}
        />
      );
    case "date":
      return (
        <DateControl
          value={value?.kind === "date" ? value.date : ""}
          onChange={(d) => onChange(d ? { kind: "date", date: d } : undefined)}
        />
      );
    case "date-range":
      return (
        <DateRangeControl
          value={value?.kind === "date-range" ? value : undefined}
          onChange={(v) => onChange(v)}
        />
      );
  }
}

function SingleSelectControl({
  options,
  value,
  onChange,
}: {
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  if (options.length > 10) {
    return (
      <select
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Please select</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  return (
    <ul className="space-y-1">
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <li key={o.value}>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                checked
                  ? "text-gray-900"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {/* Custom radio dot — bigger and crisper than the native
               *  control to match the figma. */}
              <span
                aria-hidden
                className={cn(
                  "relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  checked
                    ? "border-violet-600"
                    : "border-gray-300 group-hover:border-gray-400"
                )}
              >
                {checked && (
                  <span className="block h-2.5 w-2.5 rounded-full bg-violet-600" />
                )}
              </span>
              <span className="truncate">{o.label}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function MultiSelectControl({
  options,
  values,
  onChange,
}: {
  options: FilterOption[];
  values: string[];
  onChange: (vs: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  }
  const allSelected = options.length > 0 && options.every((o) => values.includes(o.value));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium">
        <button
          onClick={() => onChange(allSelected ? [] : options.map((o) => o.value))}
          className="text-violet-600 hover:underline"
        >
          {allSelected ? "Clear" : "Select All"}
        </button>
        {values.length > 0 && (
          <span className="text-gray-400">{values.length} selected</span>
        )}
      </div>
      <ul className="space-y-1">
        {options.map((o) => {
          const checked = values.includes(o.value);
          return (
            <li key={o.value}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                  checked
                    ? "text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o.value)}
                  className="sr-only"
                />
                {/* Custom checkbox tile — square with an inner check on
                 *  the active state. */}
                <span
                  aria-hidden
                  className={cn(
                    "relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                    checked
                      ? "border-violet-600 bg-violet-600"
                      : "border-gray-300"
                  )}
                >
                  {checked && (
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3 w-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        d="M2 6.5l2.5 2.5L10 3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="truncate">{o.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RangeControl({
  min,
  max,
  unit,
  value,
  onChange,
}: {
  min: number;
  max: number;
  unit?: string;
  value: { operator: "between" | "gt" | "lt"; min?: number; max?: number } | undefined;
  onChange: (v: FilterValue | undefined) => void;
}) {
  const op = value?.operator ?? "between";
  const lo = value?.min;
  const hi = value?.max;

  function emit(next: { operator: "between" | "gt" | "lt"; min?: number; max?: number }) {
    if (next.min === undefined && next.max === undefined) onChange(undefined);
    else onChange({ kind: "range", ...next });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 text-xs font-semibold uppercase text-gray-500">
          Operator
        </div>
        <div className="flex gap-4 text-sm">
          {(["between", "gt", "lt"] as const).map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-1.5">
              <input
                type="radio"
                checked={op === o}
                onChange={() => emit({ operator: o, min: lo, max: hi })}
                className="accent-violet-600"
              />
              {o === "between" ? "between" : o === "gt" ? "greater than" : "less than"}
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        {(op === "between" || op === "gt") && (
          <NumberInput
            value={lo}
            placeholder={String(min)}
            unit={unit}
            onChange={(n) => emit({ operator: op, min: n, max: hi })}
          />
        )}
        {op === "between" && <span className="text-gray-400">—</span>}
        {(op === "between" || op === "lt") && (
          <NumberInput
            value={hi}
            placeholder={String(max)}
            unit={unit}
            onChange={(n) => emit({ operator: op, min: lo, max: n })}
          />
        )}
      </div>
    </div>
  );
}

function NumberInput({
  value,
  placeholder,
  unit,
  onChange,
}: {
  value: number | undefined;
  placeholder: string;
  unit?: string;
  onChange: (n: number | undefined) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border border-gray-300 px-2 py-1 focus-within:border-violet-500">
      <input
        type="number"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        className="w-20 bg-transparent text-sm focus:outline-none"
      />
      {unit && <span className="text-xs text-gray-400">{unit}</span>}
    </div>
  );
}

function DateControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
    />
  );
}

function DateRangeControl({
  value,
  onChange,
}: {
  value: { from?: string; to?: string } | undefined;
  onChange: (v: FilterValue | undefined) => void;
}) {
  const from = value?.from ?? "";
  const to = value?.to ?? "";
  function emit(nextFrom: string, nextTo: string) {
    if (!nextFrom && !nextTo) onChange(undefined);
    else
      onChange({
        kind: "date-range",
        from: nextFrom || undefined,
        to: nextTo || undefined,
      });
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="date"
        value={from}
        onChange={(e) => emit(e.target.value, to)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-violet-500 focus:outline-none"
      />
      <span className="text-gray-400">—</span>
      <input
        type="date"
        value={to}
        onChange={(e) => emit(from, e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-violet-500 focus:outline-none"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FilterButton + AppliedFilterChips — companion components.          */
/* Use these together so every screen behaves identically.            */
/* ------------------------------------------------------------------ */

export function FilterButton({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50",
        activeCount > 0 && "border-violet-300 text-violet-600"
      )}
      aria-label="Open filters"
    >
      <FilterIcon size={18} />
      {activeCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-600 px-1 text-[11px] font-semibold text-white">
          {activeCount}
        </span>
      )}
    </button>
  );
}

export function AppliedFilterChips({
  fields,
  values,
  onRemove,
  onClearAll,
}: {
  fields: FilterField[];
  values: FilterValues;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}) {
  const items = fields
    .map((f) => ({ field: f, value: values[f.id] }))
    .filter(({ value }) => isFieldActive(value));

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(({ field, value }) => (
        <span
          key={field.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
        >
          <span>
            {field.label}: <span className="font-semibold">{summarize(field, value!)}</span>
          </span>
          <button
            onClick={() => onRemove(field.id)}
            className="text-violet-500 hover:text-violet-700"
            aria-label={`Remove ${field.label} filter`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      {items.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function summarize(field: FilterField, value: FilterValue): string {
  switch (value.kind) {
    case "single-select": {
      const opt = (field as Extract<FilterField, { kind: "single-select" }>).options.find(
        (o) => o.value === value.value
      );
      return opt?.label ?? value.value;
    }
    case "multi-select": {
      const opts = (field as Extract<FilterField, { kind: "multi-select" }>).options;
      const labels = value.values.map(
        (v) => opts.find((o) => o.value === v)?.label ?? v
      );
      return labels.length <= 2 ? labels.join(", ") : `${labels.length} selected`;
    }
    case "range": {
      const unit = (field as Extract<FilterField, { kind: "range" }>).unit ?? "";
      if (value.operator === "between") return `${value.min ?? "…"}–${value.max ?? "…"}${unit}`;
      if (value.operator === "gt") return `> ${value.min ?? 0}${unit}`;
      return `< ${value.max ?? 0}${unit}`;
    }
    case "date":
      return value.date;
    case "date-range":
      return `${value.from ?? "…"} → ${value.to ?? "…"}`;
  }
}

export { FilterIcon };

// Helper for consumers — count how many fields have active values.
export function countActiveFilters(values: FilterValues): number {
  return Object.values(values).filter((v) => isFieldActive(v)).length;
}
