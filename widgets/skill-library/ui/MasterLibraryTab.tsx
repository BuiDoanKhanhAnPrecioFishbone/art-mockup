"use client";

import { useState, useMemo } from "react";
import { Button, SearchBar, Badge } from "@/shared/ui";
import { EditSkillModal, DeleteConfirmDialog } from "@/features/skill-library";
import { Plus, PencilLine, Trash2, SlidersHorizontal } from "lucide-react";
import type { Skill, SkillCategory } from "@/shared/types/skill";
import { SKILL_CATEGORIES } from "@/shared/types/skill";
import { useToast } from "@/shared/ui/toast";

interface MasterLibraryTabProps {
  skills: Skill[];
  onSkillsChange: (skills: Skill[]) => void;
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(4)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function MasterLibraryTab({ skills, onSkillsChange }: MasterLibraryTabProps) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading] = useState(false);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return skills.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.synonyms.some((syn) => syn.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !categoryFilter || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [skills, search, categoryFilter]);

  function handleAddNew() {
    setEditingSkill(null);
    setEditModalOpen(true);
  }

  function handleEdit(skill: Skill) {
    setEditingSkill(skill);
    setEditModalOpen(true);
  }

  function handleDelete(skill: Skill) {
    setDeletingSkill(skill);
    setDeleteDialogOpen(true);
  }

  async function handleSave(data: { name: string; category: SkillCategory; description: string }) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    if (editingSkill) {
      const updated = skills.map((s) =>
        s.id === editingSkill.id
          ? { ...s, name: data.name, category: data.category, description: data.description, updatedAt: new Date().toISOString() }
          : s
      );
      onSkillsChange(updated);
      showToast("success", `"${data.name}" updated successfully`);
    } else {
      const newSkill: Skill = {
        id: `sk-${Date.now()}`,
        name: data.name,
        category: data.category,
        synonyms: [],
        description: data.description,
        status: "active",
        createdBy: "Current User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      };
      onSkillsChange([newSkill, ...skills]);
      showToast("success", `"${data.name}" created successfully`);
    }

    setSaving(false);
    setEditModalOpen(false);
  }

  async function handleConfirmDelete() {
    if (!deletingSkill) return;
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 300));
    onSkillsChange(skills.filter((s) => s.id !== deletingSkill.id));
    showToast("success", `"${deletingSkill.name}" deleted successfully`);
    setDeleting(false);
    setDeleteDialogOpen(false);
  }

  const categoryBadgeVariant = (cat: string): "default" | "success" | "warning" | "info" => {
    switch (cat) {
      case "Frameworks": return "info";
      case "Techniques": return "warning";
      case "Tools": return "default";
      case "Soft Skills": return "success";
      default: return "default";
    }
  };

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <SearchBar
          placeholder="Search skills..."
          value={search}
          onSearch={setSearch}
          className="flex-1 max-w-sm"
        />
        <div className="relative">
          <Button variant="secondary" size="sm" onClick={() => setShowFilter(!showFilter)}>
            <SlidersHorizontal size={16} />
            Filter
          </Button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1 z-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <button
                onClick={() => { setCategoryFilter(""); setShowFilter(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!categoryFilter ? "font-medium text-blue-600" : "text-gray-700"}`}
              >
                All Categories
              </button>
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategoryFilter(cat); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${categoryFilter === cat ? "font-medium text-blue-600" : "text-gray-700"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button size="sm" onClick={handleAddNew}>
          <Plus size={16} />
          Add New
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Synonyms</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                  {search || categoryFilter
                    ? "No skills match your search."
                    : "No skills found. Click Add New to create your first skill."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((skill) => (
                <tr key={skill.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{skill.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={categoryBadgeVariant(skill.category)}>
                      {skill.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{skill.synonyms.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <PencilLine size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(skill)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <EditSkillModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSave}
        skill={editingSkill}
        saving={saving}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        skillName={deletingSkill?.name ?? ""}
        deleting={deleting}
      />
    </div>
  );
}
