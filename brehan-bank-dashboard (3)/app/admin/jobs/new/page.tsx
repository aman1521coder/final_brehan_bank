"use client"

import { JobForm } from "@/components/admin/job-form"

export default function NewJobPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Vacancy</h1>
      <JobForm />
    </div>
  )
} 