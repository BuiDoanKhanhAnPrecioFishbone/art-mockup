import { Suspense } from "react";
import { Group3033Client } from "./_components/Group3033Client";

export default function Group3033Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      }
    >
      <Group3033Client />
    </Suspense>
  );
}
