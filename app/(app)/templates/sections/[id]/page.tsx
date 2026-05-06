import { SectionDetail } from "@/widgets/section-template-library";

export default async function SectionTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SectionDetail id={id} />;
}
