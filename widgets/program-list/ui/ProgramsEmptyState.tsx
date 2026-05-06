import { Plus, Sparkles } from "lucide-react";

export function ProgramsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-violet-50 text-violet-400">
        <Sparkles size={40} strokeWidth={1.5} />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        No recruitment programs have been set up yet.
      </h2>
      <p className="mb-6 max-w-md text-sm text-gray-500">
        Programs help you set up recruitment campaigns for a specific position.
        Establish the interview process and automate emails once, applying it
        universally.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        <Plus size={16} />
        Add New Program
      </button>
    </div>
  );
}
