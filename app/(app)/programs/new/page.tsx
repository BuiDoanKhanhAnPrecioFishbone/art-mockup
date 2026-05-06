import { redirect } from "next/navigation";
import { getProgram } from "@/entities/program/api/fixtures";
import { ProgramFormShell } from "@/widgets/program-form";

interface Props {
  searchParams: Promise<{ cloneFrom?: string }>;
}

/**
 * /programs/new                — empty new-program form
 * /programs/new?cloneFrom=:id  — pre-filled from an existing program (kept as
 *                                a draft until user saves; the source is not
 *                                modified).
 */
export default async function NewProgramPage({ searchParams }: Props) {
  const { cloneFrom } = await searchParams;

  if (cloneFrom) {
    const source = getProgram(cloneFrom);
    if (!source) redirect("/programs");
    return (
      <ProgramFormShell
        mode="new"
        initialProgram={source}
        cloneTitleSuffix=" (Copy)"
      />
    );
  }

  return <ProgramFormShell mode="new" />;
}
