"use client";

import { useRouter } from "next/navigation";
import { FlowFormEditor } from "../_components/FlowFormEditor";

export default function NewRecruitmentFlowPage() {
  const router = useRouter();

  return (
    <FlowFormEditor
      breadcrumbSuffix="New Recruitment Flow"
      pageTitle="New Recruitment Flow"
      cancelHref="/flows/recruitment-flow-management"
      onSave={() => {
        router.push("/flows/recruitment-flow-management");
      }}
    />
  );
}
