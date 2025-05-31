"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { jobAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { FileText, Eye } from "lucide-react"

interface ManagerInternalApplicantsListProps {
  status: string
  searchTerm: string
  filterJob: string
}

export function ManagerInternalApplicantsList({ status, searchTerm, filterJob }: ManagerInternalApplicantsListProps) {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        let response

        if (filterJob && filterJob !== "all") {
          response = await jobAPI.getInternalApplicationsByJob(filterJob)
        } else {
          response = await jobAPI.getAllInternalApplications()
        }

        let filteredApps = response.data

        // Filter by status if not "all"
        if (status !== "all") {
          filteredApps = filteredApps.filter((app) => app.status === status)
        }

        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filteredApps = filteredApps.filter(
            (app) =>
              app.full_name?.toLowerCase().includes(term) ||
              app.email?.toLowerCase().includes(term) ||
              app.current_position?.toLowerCase().includes(term),
          )
        }

        setApplications(filteredApps)
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error",
          description: "Failed to load applications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [status, searchTerm, filterJob])

  const handleViewApplicant = (applicant) => {
    setSelectedApplicant(applicant)
    setDialogOpen(true)
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending":
        return "outline"
      case "shortlisted":
        return "secondary"
      case "interviewed":
        return "default"
      case "hired":
        return "success"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading applications...</p>
        </CardContent>
      </Card>
    )
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No applications found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell className="font-medium">{applicant.full_name}</TableCell>
                    <TableCell>{applicant.current_position}</TableCell>
                    <TableCell>{applicant.current_department}</TableCell>
                    <TableCell>{applicant.experience_years} years</TableCell>
                    <TableCell>{applicant.education_level}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(applicant.status)}>{applicant.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewApplicant(applicant)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {applicant.resume_url && (
                          <Button variant="outline" size="icon" asChild className="text-blue-600" title="View Resume">
                            <a href={applicant.resume_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Applicant Details</DialogTitle>
          </DialogHeader>

          {selectedApplicant && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                  <p className="text-base">{selectedApplicant.full_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-base">{selectedApplicant.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p className="text-base">{selectedApplicant.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Position</h3>
                  <p className="text-base">{selectedApplicant.current_position}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Department</h3>
                  <p className="text-base">{selectedApplicant.current_department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Years of Experience</h3>
                  <p className="text-base">{selectedApplicant.experience_years} years</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Education Level</h3>
                  <p className="text-base">{selectedApplicant.education_level}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Field of Study</h3>
                  <p className="text-base">{selectedApplicant.field_of_study}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Application Status</h3>
                  <Badge className="mt-1" variant={getStatusBadgeVariant(selectedApplicant.status)}>
                    {selectedApplicant.status}
                  </Badge>
                </div>
                {selectedApplicant.interview_date && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Interview Date</h3>
                    <p className="text-base">{new Date(selectedApplicant.interview_date).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedApplicant.interview_score && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Interview Score</h3>
                    <p className="text-base">{selectedApplicant.interview_score}</p>
                  </div>
                )}
              </div>

              {selectedApplicant.resume_url && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Resume</h3>
                  <a
                    href={selectedApplicant.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Resume
                  </a>
                </div>
              )}

              {selectedApplicant.cover_letter && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cover Letter</h3>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-line">{selectedApplicant.cover_letter}</p>
                  </div>
                </div>
              )}

              {selectedApplicant.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-line">{selectedApplicant.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
