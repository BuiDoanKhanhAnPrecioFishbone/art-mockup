import { Suspense } from "react";
import { SkillLibraryClient } from "./_components/SkillLibraryClient";

export default function SkillLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      }
    >
      <SkillLibraryClient />
    </Suspense>
  );
}
