"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { jobAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export function ManagerApplicantsList({ jobId }) {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState({
    internal: [],
    external: [],
  })
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await jobAPI.getApplicationsForJob(jobId)

        // Separate internal and external applications
        const internal = response.data.filter((app) => app.type === "internal")
        const external = response.data.filter((app) => app.type === "external")

        setApplications({
          internal,
          external,
        })
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

    if (jobId) {
      fetchApplications()
    }
  }, [jobId])

  const handleViewApplicant = (applicant) => {
    setSelectedApplicant(applicant)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Applications...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we load the applications.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Applicants</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="internal">
          <TabsList className="mb-4">
            <TabsTrigger value="internal">Internal Applicants ({applications.internal.length})</TabsTrigger>
            <TabsTrigger value="external">External Applicants ({applications.external.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="internal">
            {applications.internal.length === 0 ? (
              <p className="text-muted-foreground py-4">No internal applications found.</p>
            ) : (
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
                    {applications.internal.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="font-medium">{applicant.full_name}</TableCell>
                        <TableCell>{applicant.current_position}</TableCell>
                        <TableCell>{applicant.current_department}</TableCell>
                        <TableCell>{applicant.experience_years} years</TableCell>
                        <TableCell>{applicant.education_level}</TableCell>
                        <TableCell>
                          <Badge variant={applicant.status === "pending" ? "outline" : "default"}>
                            {applicant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewApplicant(applicant)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="external">
            {applications.external.length === 0 ? (
              <p className="text-muted-foreground py-4">No external applications found.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.external.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="font-medium">{applicant.full_name}</TableCell>
                        <TableCell>{applicant.email}</TableCell>
                        <TableCell>{applicant.phone}</TableCell>
                        <TableCell>{applicant.experience_years} years</TableCell>
                        <TableCell>{applicant.education_level}</TableCell>
                        <TableCell>
                          <Badge variant={applicant.status === "pending" ? "outline" : "default"}>
                            {applicant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewApplicant(applicant)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

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
                    <h3 className="text-sm font-medium text-muted-foreground">Application Type</h3>
                    <p className="text-base capitalize">{selectedApplicant.type}</p>
                  </div>

                  {selectedApplicant.type === "internal" && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Current Position</h3>
                        <p className="text-base">{selectedApplicant.current_position}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Current Department</h3>
                        <p className="text-base">{selectedApplicant.current_department}</p>
                      </div>
                    </>
                  )}

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
                    <Badge className="mt-1" variant={selectedApplicant.status === "pending" ? "outline" : "default"}>
                      {selectedApplicant.status}
                    </Badge>
                  </div>
                </div>

                {selectedApplicant.resume_url && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Resume</h3>
                    <a
                      href={selectedApplicant.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-600 hover:underline"
                    >
                      View Resume
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cover Letter</h3>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-line">{selectedApplicant.cover_letter}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
