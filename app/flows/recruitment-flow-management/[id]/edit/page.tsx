"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlowFormEditor } from "../../_components/FlowFormEditor";
import type { RecruitmentFlow, RecruitmentStage } from "@/shared/types/recruitment-flow";

export default function EditRecruitmentFlowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [flow, setFlow] = useState<RecruitmentFlow | null>(null);
  const [loading, setLoading] = useState(true);

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

  const editableStages: RecruitmentStage[] = flow.stages.filter(
    (s) => !s.isOutcome
  );

  return (
    <FlowFormEditor
      defaultName={flow.name}
      defaultDescription={flow.description ?? ""}
      defaultStages={editableStages}
      breadcrumbSuffix={flow.name}
      pageTitle={flow.name}
      cancelHref="/flows/recruitment-flow-management"
      onSave={() => {
        router.push("/flows/recruitment-flow-management");
      }}
    />
  );
}
