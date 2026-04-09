"use client";

import { useState } from "react";
import Link from "next/link";
import { emailTemplates } from "@/shared/fixtures/email-templates";
import type { RecruitmentStage } from "@/shared/types/recruitment-flow";
import { cn } from "@/shared/lib";
import {
  GripVertical,
  PencilLine,
  Trash2,
  Mail,
  StickyNote,
  ChevronRight,
  X,
  Plus,
  Check,
} from "lucide-react";

const FIXED_OUTCOME_STAGES: RecruitmentStage[] = [
  { id: "outcome-hired", name: "Hired", order: 98, isOutcome: true },
  { id: "outcome-rejected", name: "Rejected", order: 99, isOutcome: true },
];

interface FlowFormEditorProps {
  defaultName?: string;
  defaultDescription?: string;
  defaultStages?: RecruitmentStage[];
  breadcrumbSuffix: string;
  pageTitle: string;
  cancelHref: string;
  onSave: (data: {
    name: string;
    description: string;
    stages: RecruitmentStage[];
  }) => void;
}

export function FlowFormEditor({
  defaultName = "",
  defaultDescription = "",
  defaultStages = [],
  breadcrumbSuffix,
  pageTitle,
  cancelHref,
  onSave,
}: FlowFormEditorProps) {
  const [flowName, setFlowName] = useState(defaultName);
  const [flowDescription, setFlowDescription] = useState(defaultDescription);
  const [stages, setStages] = useState<RecruitmentStage[]>(defaultStages);

  // Panel state
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [panelName, setPanelName] = useState("");
  const [panelDescription, setPanelDescription] = useState("");
  const [panelEmailTemplateId, setPanelEmailTemplateId] = useState("");

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const allStages: RecruitmentStage[] = [
    ...stages,
    ...FIXED_OUTCOME_STAGES,
  ];

  const activeStage =
    activeStageId != null
      ? allStages.find((s) => s.id === activeStageId) ?? null
      : null;

  function openPanel(stage: RecruitmentStage) {
    setActiveStageId(stage.id);
    setPanelName(stage.name);
    setPanelDescription(stage.description ?? "");
    setPanelEmailTemplateId(stage.emailTemplateId ?? "");
  }

  function closePanel() {
    setActiveStageId(null);
  }

  function savePanel() {
    if (activeStageId == null) return;
    const tpl = emailTemplates.find((t) => t.id === panelEmailTemplateId);
    setStages((prev) =>
      prev.map((s) =>
        s.id === activeStageId
          ? {
              ...s,
              name: panelName,
              description: panelDescription || undefined,
              emailTemplateId: panelEmailTemplateId || undefined,
              emailTemplateName: tpl?.name,
              emailSubject: tpl?.subject,
              emailBody: tpl?.body,
            }
          : s
      )
    );
    closePanel();
  }

  function addStage() {
    const newStage: RecruitmentStage = {
      id: `stage-${Date.now()}`,
      name: "New Stage",
      order: stages.length,
    };
    setStages((prev) => [...prev, newStage]);
  }

  function removeStage(id: string) {
    setStages((prev) =>
      prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i }))
    );
    if (activeStageId === id) closePanel();
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newStages = [...stages];
    const [dragged] = newStages.splice(dragIndex, 1);
    newStages.splice(dropIndex, 0, dragged);
    setStages(newStages.map((s, i) => ({ ...s, order: i })));
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function goToNextStageInPanel() {
    if (activeStageId == null) return;
    const idx = allStages.findIndex((s) => s.id === activeStageId);
    if (idx >= 0 && idx < allStages.length - 1) {
      openPanel(allStages[idx + 1]);
    }
  }

  const selectedTemplate = emailTemplates.find(
    (t) => t.id === panelEmailTemplateId
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-xs text-gray-500 mb-1">
            Settings / Recruitment Flow / {breadcrumbSuffix}
          </p>
          <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={cancelHref}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={() =>
              onSave({ name: flowName, description: flowDescription, stages })
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Check size={14} />
            Save
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Main area */}
        <div
          className={cn(
            "flex-1 overflow-y-auto p-6 transition-all duration-200",
            activeStage != null ? "mr-96" : ""
          )}
        >
          {/* Flow Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Flow Name
              </label>
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                placeholder="Enter the recruitment flow name (e.g., Standard Tech Flow)..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Flow Description
              </label>
              <textarea
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                placeholder="Please Enter..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Stages Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Stages
            </h2>

            {/* Regular draggable stages */}
            {stages.map((stage, index) => (
              <div key={stage.id}>
                {index > 0 && (
                  <div className="flex justify-center py-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                )}
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4 transition-all",
                    dragOverIndex === index &&
                      dragIndex !== index &&
                      "border-blue-400 bg-blue-50",
                    dragIndex === index && "opacity-50"
                  )}
                >
                  <GripVertical
                    size={16}
                    className="text-gray-400 cursor-grab flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StickyNote size={15} className="text-gray-400" />
                    {stage.emailTemplateId != null && (
                      <Mail size={15} className="text-gray-400" />
                    )}
                    <button
                      onClick={() => openPanel(stage)}
                      className={cn(
                        "p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors",
                        activeStageId === stage.id &&
                          "text-blue-600 bg-blue-50"
                      )}
                      title="Edit stage details"
                    >
                      <PencilLine size={15} />
                    </button>
                    <button
                      onClick={() => removeStage(stage.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove stage"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Stage */}
            <div className="flex justify-center py-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
            <div className="flex justify-center mb-1.5">
              <button
                onClick={addStage}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-1.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <Plus size={13} />
                Add Stage
              </button>
            </div>

            {/* Connector to outcome stages */}
            <div className="flex justify-center py-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>

            {/* Pinned outcome stages */}
            {FIXED_OUTCOME_STAGES.map((stage, index) => (
              <div key={stage.id}>
                {index > 0 && (
                  <div className="flex justify-center py-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                )}
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  {/* Spacer where GripVertical would be */}
                  <div className="w-4 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    {stage.name}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      stage.name === "Hired"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StickyNote size={15} className="text-gray-400" />
                    <button
                      onClick={() => openPanel(stage)}
                      className={cn(
                        "p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors",
                        activeStageId === stage.id &&
                          "text-blue-600 bg-blue-50"
                      )}
                      title="Edit stage details"
                    >
                      <PencilLine size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage detail side panel */}
        {activeStage != null && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col z-40">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                {activeStage.name}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={goToNextStageInPanel}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Next stage"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={closePanel}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Step Name
                </label>
                <input
                  type="text"
                  value={panelName}
                  onChange={(e) => setPanelName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Template
                </label>
                <select
                  value={panelEmailTemplateId}
                  onChange={(e) => setPanelEmailTemplateId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- None --</option>
                  {emailTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTemplate != null && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-0.5">
                      Email Subject
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedTemplate.subject}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-0.5">
                      Email Body
                    </p>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                      {selectedTemplate.body}
                    </pre>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Step Description
                </label>
                <textarea
                  value={panelDescription}
                  onChange={(e) => setPanelDescription(e.target.value)}
                  placeholder="Please Enter..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Panel footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={savePanel}
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
