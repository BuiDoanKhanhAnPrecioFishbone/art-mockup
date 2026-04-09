"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent, Button, Input, Textarea, Select } from "@/shared/ui";
import { ToastProvider } from "@/shared/ui/toast";
import { SkillsLabelsSection } from "@/widgets/job-vacancy";
import { Save, ArrowLeft } from "lucide-react";

export default function NewJobVacancyPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <p className="text-xs text-gray-500 mb-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            {" / "}
            <span>Jobs</span>
            {" / "}
            <span className="text-gray-700">New Job Vacancy</span>
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">New Job Vacancy</h1>
            <div className="flex gap-2">
              <Link href="/">
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
              <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="job-title"
                  label="Job Title"
                  placeholder="e.g. Senior Frontend Developer"
                  defaultValue="Senior Frontend Developer"
                />
                <Select
                  id="department"
                  label="Department"
                  options={[
                    { value: "engineering", label: "Engineering" },
                    { value: "design", label: "Design" },
                    { value: "product", label: "Product" },
                    { value: "marketing", label: "Marketing" },
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
                  ]}
                  defaultValue="full-time"
                />
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
                placeholder="Enter the job description..."
                defaultValue="We are looking for a Senior Frontend Developer to join our team. The ideal candidate has experience with React, TypeScript, and modern frontend tooling. You will be responsible for building responsive web applications, collaborating with design and backend teams, and mentoring junior developers."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Skills & Labels Section */}
          <SkillsLabelsSection />

          {/* Requirements placeholder */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">Requirements</h2>
            </CardHeader>
            <CardContent>
              <Textarea
                id="requirements"
                placeholder="Enter requirements..."
                defaultValue="- 5+ years of experience in frontend development&#10;- Strong proficiency in React and TypeScript&#10;- Experience with state management solutions&#10;- Familiarity with CI/CD pipelines&#10;- Excellent communication skills"
                rows={5}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ToastProvider>
  );
}
