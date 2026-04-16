"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent, Button, Input, Textarea, Select } from "@/shared/ui";
import { ToastProvider } from "@/shared/ui/toast";
import { SkillsLabelsSection } from "@/widgets/job-vacancy";
import { Save, ArrowLeft, ChevronRight } from "lucide-react";

export default function NewProgramPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/flows/create-manage-jobs" className="hover:text-gray-700 transition-colors">
              Jobs Management
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">New Program</span>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">New Recruitment Program</h1>
            <div className="flex gap-2">
              <Link href="/flows/create-manage-jobs">
                <Button variant="secondary" size="sm">
                  <ArrowLeft size={16} />
                  Back
                </Button>
              </Link>
              <Button size="sm">
                <Save size={16} />
                Save Draft
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">1. Basic Information</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="program-name"
                  label="Program Name"
                  placeholder="e.g. Q2 Backend Hiring Round"
                  defaultValue=""
                />
                <Input
                  id="job-title"
                  label="Job Title"
                  placeholder="e.g. Backend Developer"
                  defaultValue=""
                />
                <Select
                  id="job-level"
                  label="Job Level"
                  options={[
                    { value: "intern", label: "Intern" },
                    { value: "fresher", label: "Fresher" },
                    { value: "junior", label: "Junior" },
                    { value: "mid", label: "Mid" },
                    { value: "senior", label: "Senior" },
                  ]}
                  defaultValue="fresher"
                />
                <Input
                  id="headcount"
                  label="Headcount"
                  type="number"
                  placeholder="e.g. 5"
                  defaultValue=""
                />
                <Select
                  id="department"
                  label="Department"
                  options={[
                    { value: "engineering", label: "Engineering" },
                    { value: "design", label: "Design" },
                    { value: "product", label: "Product" },
                    { value: "marketing", label: "Marketing" },
                    { value: "finance", label: "Finance" },
                  ]}
                  defaultValue="engineering"
                />
                <Select
                  id="location"
                  label="Location"
                  options={[
                    { value: "remote", label: "Remote" },
                    { value: "onsite", label: "On-site" },
                    { value: "hybrid", label: "Hybrid" },
                  ]}
                  defaultValue="hybrid"
                />
                <Select
                  id="employment-type"
                  label="Employment Type"
                  options={[
                    { value: "full-time", label: "Full-time" },
                    { value: "part-time", label: "Part-time" },
                    { value: "contract", label: "Contract" },
                    { value: "internship", label: "Internship" },
                  ]}
                  defaultValue="full-time"
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Hiring Period</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-gray-400 text-sm">–</span>
                    <input
                      type="date"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">Job Description</h2>
            </CardHeader>
            <CardContent>
              <Textarea
                id="job-description"
                placeholder="Enter the job description, responsibilities, and what the role involves..."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Skills & Labels — full widget */}
          <SkillsLabelsSection />

          {/* Requirements */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">Requirements</h2>
            </CardHeader>
            <CardContent>
              <Textarea
                id="requirements"
                placeholder="List the candidate requirements..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Link href="/flows/create-manage-jobs">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button>
              <Save size={16} />
              Save Draft
            </Button>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
