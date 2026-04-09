"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs } from "@/shared/ui";
import { ToastProvider } from "@/shared/ui/toast";
import { MasterLibraryTab } from "@/widgets/skill-library/ui/MasterLibraryTab";
import { PendingApprovalsTab } from "@/widgets/skill-library/ui/PendingApprovalsTab";
import { masterSkills, pendingApprovals as initialPending } from "@/shared/fixtures/skills";
import type { Skill, PendingApproval } from "@/shared/types/skill";
import { HelpCircle } from "lucide-react";

export function SkillLibraryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "master";

  const [skills, setSkills] = useState<Skill[]>(masterSkills);
  const [approvals, setApprovals] = useState<PendingApproval[]>(initialPending);

  function handleTabChange(key: string) {
    router.push(`/flows/skill-library${key === "pending" ? "?tab=pending" : ""}`, { scroll: false });
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <p className="text-xs text-gray-500 mb-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            {" / "}
            <span>Settings</span>
            {" / "}
            <span className="text-gray-700">Skill Library</span>
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">Skill Library</h1>
            <HelpCircle size={16} className="text-gray-400" />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white px-6">
          <Tabs
            items={[
              { key: "master", label: "Master Library", count: skills.length },
              { key: "pending", label: "Pending Approvals", count: approvals.length },
            ]}
            activeKey={activeTab}
            onChange={handleTabChange}
          />
        </div>

        {/* Content */}
        {activeTab === "master" ? (
          <MasterLibraryTab skills={skills} onSkillsChange={setSkills} />
        ) : (
          <PendingApprovalsTab approvals={approvals} onApprovalsChange={setApprovals} />
        )}
      </div>
    </ToastProvider>
  );
}
