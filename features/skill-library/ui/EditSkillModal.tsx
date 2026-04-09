"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Textarea, Select, Button } from "@/shared/ui";
import { SKILL_CATEGORIES } from "@/shared/types/skill";
import type { Skill, SkillCategory } from "@/shared/types/skill";

interface EditSkillModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; category: SkillCategory; description: string }) => void;
  skill?: Skill | null;
  saving?: boolean;
}

export function EditSkillModal({ open, onClose, onSave, skill, saving }: EditSkillModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setName(skill?.name ?? "");
      setCategory(skill?.category ?? "");
      setDescription(skill?.description ?? "");
      setErrors({});
    }
  }, [open, skill]);

  function handleSave() {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!category) newErrors.category = "Category is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({ name: name.trim(), category: category as SkillCategory, description: description.trim() });
  }

  const isEdit = !!skill;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Skill" : "Add New Skill"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          id="skill-name"
          label="Name"
          placeholder="Enter skill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Select
          id="skill-category"
          label="Category"
          placeholder="Select a category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          error={errors.category}
          options={SKILL_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Textarea
          id="skill-description"
          label="Description"
          placeholder="Enter skill description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  );
}
