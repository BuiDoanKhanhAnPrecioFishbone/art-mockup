import Link from "next/link";
import { NAV_SECTIONS } from "@/widgets/app-sidebar";

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          ART — Recruitment Platform
        </h1>
        <p className="mt-2 text-gray-500">
          Whole-site interactive mockup. Pick a section from the sidebar, or
          jump in below.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Looking for the legacy flow demos?{" "}
          <Link href="/explorer" className="underline hover:text-gray-600">
            Open the wireframe explorer →
          </Link>
        </p>
      </header>

      <div className="space-y-8">
        {NAV_SECTIONS.map((section) => (
          <section key={section.id}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-violet-600">
              {section.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-violet-300 hover:bg-violet-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-200">
                      <Icon size={20} />
                    </div>
                    <div className="font-medium text-gray-800">
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
