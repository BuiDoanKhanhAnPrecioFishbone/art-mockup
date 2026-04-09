import Link from "next/link";
import { FLOWS } from "@/shared/config/flows";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

const statusVariant = {
  ready: "success",
  wip: "warning",
  planned: "default",
} as const;

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Wireframe Explorer
        </h1>
        <p className="text-gray-500">
          Click a flow below to walk through the interactive mockup and leave
          feedback.
        </p>
      </div>

      {FLOWS.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
          <p className="text-gray-400 font-medium mb-1">No flows yet</p>
          <p className="text-sm text-gray-400">
            Add entries to{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              shared/config/flows.ts
            </code>{" "}
            and create the corresponding pages under{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              app/flows/
            </code>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FLOWS.map((flow) => (
            <Card key={flow.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold leading-tight">{flow.title}</h2>
                  <Badge variant={statusVariant[flow.status]}>
                    {flow.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4">
                <p className="text-sm text-gray-500 flex-1">
                  {flow.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {flow.screens} screen{flow.screens !== 1 ? "s" : ""}
                  </span>
                  {flow.status !== "planned" ? (
                    <Link
                      href={flow.path}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      Open flow →
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">Coming soon</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
