import { notFound } from "next/navigation";
import { getProgram } from "@/entities/program/api/fixtures";
import { ProgramFormShell } from "@/widgets/program-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProgramPage({ params }: Props) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) notFound();
  return <ProgramFormShell mode="edit" initialProgram={program} />;
}
