import { TestEditor } from "@/widgets/test-bank";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TestEditor id={id} readOnly />;
}
