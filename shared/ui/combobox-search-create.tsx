"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface ComboboxItem<T> {
  /** Unique key. */
  id: string;
  /** Searchable label — what the user types to find the item. */
  label: string;
  /** Optional secondary line shown under the label. */
  sublabel?: string;
  /** Custom right-side content (e.g. type chip). */
  meta?: ReactNode;
  /** Original payload. */
  value: T;
}

/** Search-then-create inline combobox. Reusable wherever the project
 *  needs the *"type to filter a master library, then either pick an
 *  existing entry or create a brand-new one inline"* pattern.
 *
 *  Wireframes ref:
 *    - Workflow `+ Add Step` (recruitment-flow board)
 *    - Scorecard editor `+ Add Criteria`
 *    - Test step `+ Add Test`
 *
 *  Project rule (Doc 08.2): this is *never* a separate popup — the
 *  trigger button expands into the search field inline. */
export function ComboboxSearchCreate<T>({
  triggerLabel = "+ Add",
  placeholder = "Search library or type to create…",
  items,
  loading = false,
  onPickExisting,
  onCreateNew,
  emptyHint,
  /** When false, the inline editor never shows — used in read-only
   *  contexts. */
  enabled = true,
  /** Optional wrapper class for the collapsed trigger. */
  triggerClassName,
}: {
  triggerLabel?: string;
  placeholder?: string;
  items: ComboboxItem<T>[];
  loading?: boolean;
  /** Picked an existing library entry. */
  onPickExisting: (item: ComboboxItem<T>) => void;
  /** Typed a new name + clicked "Create new". Receives the typed
   *  string, expected to async-create + return the new id (so the
   *  combobox can collapse on success). Throw or return false to
   *  keep the editor open (e.g. on validation error). */
  onCreateNew: (typedName: string) => void | Promise<void | boolean>;
  emptyHint?: ReactNode;
  enabled?: boolean;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Defer focus until after the render so the input is mounted.
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
    }
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.sublabel?.toLowerCase().includes(q) ?? false)
    );
  }, [items, query]);

  const exactMatch = useMemo(
    () =>
      query.trim().length > 0 &&
      items.some((i) => i.label.toLowerCase() === query.trim().toLowerCase()),
    [items, query]
  );

  if (!enabled) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-violet-300 px-2 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50",
          triggerClassName
        )}
      >
        <Plus size={12} />
        {triggerLabel}
      </button>
    );
  }

  async function handleCreate() {
    const typed = query.trim();
    if (!typed) return;
    setCreating(true);
    try {
      const result = await onCreateNew(typed);
      if (result !== false) {
        setOpen(false);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-violet-300 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-50/40 px-2 py-1.5">
        <Search size={12} className="text-violet-500" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter") {
              e.preventDefault();
              if (matches.length === 1) onPickExisting(matches[0]);
              else if (!exactMatch) void handleCreate();
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          title="Close"
          className="rounded p-0.5 text-violet-400 hover:bg-violet-100 hover:text-violet-700"
        >
          <X size={12} />
        </button>
      </div>

      <ul className="max-h-64 overflow-y-auto">
        {loading ? (
          <li className="px-3 py-3 text-center text-xs text-gray-400">
            Loading library…
          </li>
        ) : matches.length === 0 ? (
          <li className="px-3 py-3 text-center text-xs text-gray-400">
            {emptyHint ?? "No matches in the library."}
          </li>
        ) : (
          matches.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onPickExisting(item);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-violet-50"
              >
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-medium text-gray-900">
                    {item.label}
                  </span>
                  {item.sublabel && (
                    <span className="block truncate text-[10px] text-gray-500">
                      {item.sublabel}
                    </span>
                  )}
                </span>
                {item.meta && <span className="shrink-0">{item.meta}</span>}
              </button>
            </li>
          ))
        )}

        {/* "Create new" row — appears whenever the user has typed
         *  something AND no exact match exists in the filtered list. */}
        {query.trim().length > 0 && !exactMatch && (
          <li className="border-t border-violet-100">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="flex w-full items-center gap-2 bg-emerald-50/40 px-3 py-2 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
            >
              <Plus size={12} />
              Create new: <strong>&ldquo;{query.trim()}&rdquo;</strong>
              {creating && <span className="ml-auto text-gray-400">…</span>}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
