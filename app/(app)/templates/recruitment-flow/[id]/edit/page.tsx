import { notFound } from "next/navigation";
import { getFlowTemplate } from "@/entities/flow-template/api/fixtures";
import { FlowTemplateEditor } from "@/widgets/flow-template-editor";

export default async function FlowTemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = getFlowTemplate(id);
  if (!template) notFound();
  return <FlowTemplateEditor template={template} mode="edit" />;
}
