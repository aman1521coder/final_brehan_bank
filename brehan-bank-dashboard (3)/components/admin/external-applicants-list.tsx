"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, FileText, Download } from "lucide-react"
import { format } from "date-fns"

interface ExternalApplicant {
  id: string
  job_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  years_of_experience: number
  education_level: string
  field_of_study: string
  resume_url?: string
  cover_letter: string
  status: string
  created_at: string
}

interface Job {
  id: string
  title: string
  department: string
  location: string
  status: string
}

interface ExternalApplicantsListProps {
  applicants: ExternalApplicant[]
  isLoading: boolean
  onMatchApplicant: (applicantId: string, data: any) => Promise<void>
  jobs: Job[]
}

export function ExternalApplicantsList({ applicants, isLoading, onMatchApplicant, jobs }: ExternalApplicantsListProps) {
  const [viewingApplicant, setViewingApplicant] = useState<ExternalApplicant | null>(null)

  const getJobTitle = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    return job ? job.title : "Unknown Job"
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (applicants.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No applicants found matching your criteria</p>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell className="font-medium">
                    {applicant.first_name} {applicant.last_name}
                  </TableCell>
                  <TableCell>{getJobTitle(applicant.job_id)}</TableCell>
                  <TableCell>{applicant.email}</TableCell>
                  <TableCell>{applicant.phone}</TableCell>
                  <TableCell>{applicant.years_of_experience} years</TableCell>
                  <TableCell>{applicant.education_level}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        applicant.status === "shortlisted"
                          ? "success"
                          : applicant.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {applicant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(applicant.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingApplicant(applicant)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {applicant.resume_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={applicant.resume_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Applicant Dialog */}
      <Dialog open={!!viewingApplicant} onOpenChange={(open) => !open && setViewingApplicant(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicant Details</DialogTitle>
            <DialogDescription>Comprehensive information about the applicant.</DialogDescription>
          </DialogHeader>

          {viewingApplicant && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span>
                      {viewingApplicant.first_name} {viewingApplicant.last_name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{viewingApplicant.email}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{viewingApplicant.phone}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Applied On:</span>
                    <span>{format(new Date(viewingApplicant.created_at), "PPP")}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Job Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Applied For:</span>
                    <span>{getJobTitle(viewingApplicant.job_id)}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Experience:</span>
                    <span>{viewingApplicant.years_of_experience} years</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Education</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Level:</span>
                    <span>{viewingApplicant.education_level}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Field of Study:</span>
                    <span>{viewingApplicant.field_of_study}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Status</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Application Status:</span>
                    <Badge
                      variant={
                        viewingApplicant.status === "shortlisted"
                          ? "success"
                          : viewingApplicant.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {viewingApplicant.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => onMatchApplicant(viewingApplicant.id, { status: "shortlisted" })}
                    disabled={viewingApplicant.status === "shortlisted"}
                  >
                    Shortlist
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onMatchApplicant(viewingApplicant.id, { status: "rejected" })}
                    disabled={viewingApplicant.status === "rejected"}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">{viewingApplicant.cover_letter}</div>
              </div>

              {viewingApplicant.resume_url && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Resume</h3>
                  <Button asChild>
                    <a href={viewingApplicant.resume_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Resume
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
