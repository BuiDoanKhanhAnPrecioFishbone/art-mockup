import { SectionEditor } from "@/widgets/section-template-library";

export default async function EditSectionTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SectionEditor id={id} />;
}
