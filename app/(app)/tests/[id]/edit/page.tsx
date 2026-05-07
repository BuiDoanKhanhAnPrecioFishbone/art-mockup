import { TestEditor } from "@/widgets/test-bank";

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TestEditor id={id} />;
}
