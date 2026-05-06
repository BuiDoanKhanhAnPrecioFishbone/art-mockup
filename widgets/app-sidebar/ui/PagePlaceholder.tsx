import type { LucideIcon } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  section: string;
  icon: LucideIcon;
}

export function PagePlaceholder({ title, section, icon: Icon }: PagePlaceholderProps) {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            {section}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
        </div>
      </div>

      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="font-medium text-gray-500">Not built yet</p>
        <p className="mt-1 text-sm text-gray-400">
          This screen is part of the mockup roadmap. The team will design and
          wire it up next.
        </p>
      </div>
    </div>
  );
}
