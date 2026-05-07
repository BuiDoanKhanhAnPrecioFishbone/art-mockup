import { PublicFormPreview } from "@/widgets/public-form-preview";

export default async function PublicFormPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicFormPreview programId={id} />;
}
