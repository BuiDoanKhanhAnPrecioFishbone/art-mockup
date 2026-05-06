import { Hammer } from "lucide-react";

export function TabPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
        <Hammer size={22} />
      </div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <p className="mt-4 text-xs font-medium text-violet-600">
        Not built yet — coming in a later session.
      </p>
    </div>
  );
}
