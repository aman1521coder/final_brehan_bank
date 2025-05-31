"use client"

import { JobApplicationsPage } from "@/components/admin/job-applications"

export default function ApplicationsPage({ params }: { params: { id: string } }) {
  return <JobApplicationsPage jobId={params.id} />
} 