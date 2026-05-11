import { emailTemplates } from "@/shared/fixtures/email-templates";
import { notFound } from "next/navigation";
import TemplateEditor from "../_components/TemplateEditor";

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = emailTemplates.find((t) => t.id === id);
  if (!template) notFound();
  return <TemplateEditor template={template} />;
}
