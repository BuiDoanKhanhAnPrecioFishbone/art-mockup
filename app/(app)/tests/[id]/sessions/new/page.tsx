import { SessionEditor } from "@/widgets/test-bank";

export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SessionEditor testId={id} />;
}
