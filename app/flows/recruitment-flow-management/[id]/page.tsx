"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib";
import { emailTemplates } from "@/shared/fixtures/email-templates";
import type { RecruitmentFlow, RecruitmentStage } from "@/shared/types/recruitment-flow";
import {
  PencilLine,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  StickyNote,
} from "lucide-react";

export default function ViewRecruitmentFlowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [flow, setFlow] = useState<RecruitmentFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<RecruitmentStage | null>(null);

  useEffect(() => {
    fetch(`/api/recruitment-flows/${id}`)
      .then((r) => r.json())
      .then((data: RecruitmentFlow) => {
        setFlow(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (flow == null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Flow not found.</div>
      </div>
    );
  }

  const nonOutcomeStages = flow.stages.filter((s) => !s.isOutcome);
  const outcomeStages = flow.stages.filter((s) => s.isOutcome);

  const allStages = [...nonOutcomeStages, ...outcomeStages];

  function openPanel(stage: RecruitmentStage) {
    setActiveStage(stage);
  }

  function closePanel() {
    setActiveStage(null);
  }

  function goToNextStage() {
    if (activeStage == null) return;
    const idx = allStages.findIndex((s) => s.id === activeStage.id);
    if (idx >= 0 && idx < allStages.length - 1) {
      setActiveStage(allStages[idx + 1]);
    }
  }

  const selectedTemplate = emailTemplates.find(
    (t) => t.id === activeStage?.emailTemplateId
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/flows/recruitment-flow-management"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Settings / Recruitment Flow / {flow.name}
            </p>
            <h1 className="text-xl font-semibold text-gray-900">{flow.name}</h1>
          </div>
        </div>
        <Link
          href={`/flows/recruitment-flow-management/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <PencilLine size={14} />
          Edit
        </Link>
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
          {/* Flow info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Flow Name
              </p>
              <p className="text-sm font-medium text-gray-900">{flow.name}</p>
            </div>
            {flow.description != null && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Flow Description
                </p>
                <p className="text-sm text-gray-700">{flow.description}</p>
              </div>
            )}
          </div>

          {/* Stages */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Stages
            </h2>

            {nonOutcomeStages.map((stage, index) => (
              <div key={stage.id}>
                {index > 0 && (
                  <div className="flex justify-center py-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                )}
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="w-4 flex-shrink-0" />
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
                        activeStage?.id === stage.id &&
                          "text-blue-600 bg-blue-50"
                      )}
                      title="View stage details"
                    >
                      <PencilLine size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Connector to outcomes */}
            <div className="flex justify-center py-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>

            {outcomeStages.map((stage, index) => (
              <div key={stage.id}>
                {index > 0 && (
                  <div className="flex justify-center py-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                )}
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
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
                    <button
                      onClick={() => openPanel(stage)}
                      className={cn(
                        "p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors",
                        activeStage?.id === stage.id &&
                          "text-blue-600 bg-blue-50"
                      )}
                      title="View stage details"
                    >
                      <PencilLine size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Read-only side panel */}
        {activeStage != null && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col z-40">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                {activeStage.name}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={goToNextStage}
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

            {/* Panel body — read-only */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Step Name
                </p>
                <p className="text-sm text-gray-900">{activeStage.name}</p>
              </div>

              {activeStage.emailTemplateName != null && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Email Template
                  </p>
                  <p className="text-sm text-gray-900">
                    {activeStage.emailTemplateName}
                  </p>
                </div>
              )}

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

              {activeStage.description != null && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Step Description
                  </p>
                  <p className="text-sm text-gray-600">
                    {activeStage.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
