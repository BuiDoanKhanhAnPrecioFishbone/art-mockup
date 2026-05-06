import { QuestionEditor } from "@/widgets/question-bank";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuestionEditor id={id} readOnly />;
}
