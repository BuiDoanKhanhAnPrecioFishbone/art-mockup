"use client";

import { useState, useMemo } from "react";
import { Modal, Button, Checkbox, Badge, Select } from "@/shared/ui";
import { BookOpen } from "lucide-react";
import type { SkillPriority } from "@/shared/types/skill";
import { librarySuggestions, jobTitles, levels } from "@/shared/fixtures/skills";

interface LibrarySuggestion {
  name: string;
  group: SkillPriority;
  selected: boolean;
}

interface KeywordLibraryBrowserProps {
  open: boolean;
  onClose: () => void;
  onApply: (skills: Array<{ name: string; group: SkillPriority }>) => void;
  alreadyAdded: string[];
}

const priorityBadge: Record<SkillPriority, { label: string; className: string }> = {
  "must-have": { label: "Must-have", className: "bg-red-100 text-red-700" },
  "nice-to-have": { label: "Nice-to-have", className: "bg-amber-100 text-amber-700" },
  bonus: { label: "Bonus", className: "bg-green-100 text-green-700" },
};

export function KeywordLibraryBrowser({
  open,
  onClose,
  onApply,
  alreadyAdded,
}: KeywordLibraryBrowserProps) {
  const [jobTitle, setJobTitle] = useState(jobTitles[0]);
  const [level, setLevel] = useState("Fresher");
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  const suggestions = useMemo<LibrarySuggestion[]>(() => {
    const items = librarySuggestions[jobTitle] || [];
    return items.map((item) => ({
      ...item,
      selected: selectedNames.has(item.name),
    }));
  }, [jobTitle, selectedNames]);

  const selectableItems = suggestions.filter(
    (s) => !alreadyAdded.some((a) => a.toLowerCase() === s.name.toLowerCase())
  );

  function toggleSelect(name: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleAll() {
    if (selectedNames.size === selectableItems.length) {
      setSelectedNames(new Set());
    } else {
      setSelectedNames(new Set(selectableItems.map((s) => s.name)));
    }
  }

  function handleApply() {
    const selected = suggestions.filter((s) => selectedNames.has(s.name));
    onApply(selected.map((s) => ({ name: s.name, group: s.group })));
    setSelectedNames(new Set());
  }

  function handleClose() {
    onClose();
    setSelectedNames(new Set());
  }

  const jobTitleOptions = jobTitles.map((t) => ({ value: t, label: t }));
  const levelOptions = levels.map((l) => ({ value: l, label: l }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title=""
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="ghost" onClick={() => setSelectedNames(new Set())}>
            Clear
          </Button>
          <Button onClick={handleApply} disabled={selectedNames.size === 0}>
            Add to Skill Set ({selectedNames.size})
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Title area */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">Keyword Library</h3>
          </div>
          <p className="text-sm text-gray-500">
            The library suggests a set of standard skills based on the job title
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-end gap-3">
          <Select
            label="Job Title"
            options={jobTitleOptions}
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              setSelectedNames(new Set());
            }}
          />
          <Select
            label="Level"
            options={levelOptions}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="w-10 px-3 py-2 text-left">
                  <Checkbox
                    checked={
                      selectableItems.length > 0 &&
                      selectedNames.size === selectableItems.length
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Group
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Keyword
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suggestions.map((item) => {
                const isAdded = alreadyAdded.some(
                  (a) => a.toLowerCase() === item.name.toLowerCase()
                );
                const badge = priorityBadge[item.group];
                return (
                  <tr
                    key={item.name}
                    className={`hover:bg-gray-50 transition-colors ${isAdded ? "opacity-50" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selectedNames.has(item.name) || isAdded}
                        onChange={() => !isAdded && toggleSelect(item.name)}
                        disabled={isAdded}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {item.name}
                    </td>
                  </tr>
                );
              })}
              {suggestions.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-sm text-gray-500"
                  >
                    No suggestions available for this job title.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
