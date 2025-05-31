"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, UserCheck, FileText, Download } from "lucide-react"
import { format } from "date-fns"

interface InternalApplicant {
  id: string
  job_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  current_position: string
  department: string
  branch: string
  years_of_experience: number
  education_level: string
  field_of_study: string
  resume_url?: string
  cover_letter: string
  status: string
  created_at: string
  matched_employee_id?: string
}

interface Job {
  id: string
  title: string
  department: string
  location: string
  status: string
}

interface InternalApplicantsListProps {
  applicants: InternalApplicant[]
  isLoading: boolean
  onMatchApplicant: (applicantId: string, employeeId: string) => Promise<void>
  jobs: Job[]
}

export function InternalApplicantsList({ applicants, isLoading, onMatchApplicant, jobs }: InternalApplicantsListProps) {
  const [viewingApplicant, setViewingApplicant] = useState<InternalApplicant | null>(null)
  const [matchingApplicant, setMatchingApplicant] = useState<InternalApplicant | null>(null)
  const [employeeId, setEmployeeId] = useState("")
  const [isMatching, setIsMatching] = useState(false)

  const getJobTitle = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    return job ? job.title : "Unknown Job"
  }

  const handleMatch = async () => {
    if (!matchingApplicant || !employeeId) return

    setIsMatching(true)
    try {
      await onMatchApplicant(matchingApplicant.id, employeeId)
      setMatchingApplicant(null)
      setEmployeeId("")
    } finally {
      setIsMatching(false)
    }
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
                <TableHead>Current Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Experience</TableHead>
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
                  <TableCell>{applicant.current_position}</TableCell>
                  <TableCell>{applicant.department}</TableCell>
                  <TableCell>{applicant.branch}</TableCell>
                  <TableCell>{applicant.years_of_experience} years</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        applicant.status === "matched"
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMatchingApplicant(applicant)}
                        disabled={applicant.status === "matched"}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
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
                    <span className="text-muted-foreground">Current Position:</span>
                    <span>{viewingApplicant.current_position}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Department:</span>
                    <span>{viewingApplicant.department}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Branch:</span>
                    <span>{viewingApplicant.branch}</span>
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
                        viewingApplicant.status === "matched"
                          ? "success"
                          : viewingApplicant.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {viewingApplicant.status}
                    </Badge>
                  </div>
                  {viewingApplicant.matched_employee_id && (
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Matched Employee ID:</span>
                      <span>{viewingApplicant.matched_employee_id}</span>
                    </div>
                  )}
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

      {/* Match Applicant Dialog */}
      <Dialog open={!!matchingApplicant} onOpenChange={(open) => !open && setMatchingApplicant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match Internal Applicant with Employee</DialogTitle>
            <DialogDescription>
              Enter the employee ID to match with this internal applicant. This will link the application to the
              employee record.
            </DialogDescription>
          </DialogHeader>

          {matchingApplicant && (
            <div className="py-4">
              <div className="mb-4">
                <p>
                  <span className="font-semibold">Applicant:</span> {matchingApplicant.first_name}{" "}
                  {matchingApplicant.last_name}
                </p>
                <p>
                  <span className="font-semibold">Current Position:</span> {matchingApplicant.current_position}
                </p>
                <p>
                  <span className="font-semibold">Department:</span> {matchingApplicant.department}
                </p>
                <p>
                  <span className="font-semibold">Applied For:</span> {getJobTitle(matchingApplicant.job_id)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-id">Employee ID</Label>
                <Input
                  id="employee-id"
                  placeholder="Enter employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchingApplicant(null)} disabled={isMatching}>
              Cancel
            </Button>
            <Button onClick={handleMatch} disabled={!employeeId || isMatching}>
              {isMatching ? "Matching..." : "Match Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
