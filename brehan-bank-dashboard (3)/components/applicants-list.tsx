"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Eye, Edit, FileText, CheckCircle, XCircle } from "lucide-react"

// Define the Applicant type
export interface Applicant {
  id: number
  full_name: string
  email: string
  phone: string
  position_applied: string
  department: string
  application_date: string
  status: "pending" | "shortlisted" | "interviewed" | "offered" | "rejected" | "hired"
  type: "internal" | "external"
  current_position?: string
  current_department?: string
  experience_years: number
  education_level: string
  field_of_study: string
  resume_url: string
  interview_score?: string
  interview_date?: string
  notes?: string
}

// Mock data for applicants
const mockApplicants: Applicant[] = [
  {
    id: 1,
    full_name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "123-456-7890",
    position_applied: "Senior Loan Officer",
    department: "Loans",
    application_date: "2023-04-15",
    status: "shortlisted",
    type: "external",
    experience_years: 7,
    education_level: "Master's Degree",
    field_of_study: "Finance",
    resume_url: "/resumes/david-wilson.pdf",
    interview_date: "2023-05-01",
  },
  {
    id: 2,
    full_name: "Emily Johnson",
    email: "emily.johnson@brehanbank.com",
    phone: "234-567-8901",
    position_applied: "Branch Manager",
    department: "Management",
    application_date: "2023-04-10",
    status: "interviewed",
    type: "internal",
    current_position: "Assistant Branch Manager",
    current_department: "Operations",
    experience_years: 5,
    education_level: "Bachelor's Degree",
    field_of_study: "Business Administration",
    resume_url: "/resumes/emily-johnson.pdf",
    interview_score: "85",
    interview_date: "2023-04-25",
    notes: "Strong leadership skills, good understanding of bank operations.",
  },
  {
    id: 3,
    full_name: "Michael Brown",
    email: "michael.brown@email.com",
    phone: "345-678-9012",
    position_applied: "IT Specialist",
    department: "IT",
    application_date: "2023-04-20",
    status: "pending",
    type: "external",
    experience_years: 3,
    education_level: "Bachelor's Degree",
    field_of_study: "Computer Science",
    resume_url: "/resumes/michael-brown.pdf",
  },
  {
    id: 4,
    full_name: "Sarah Davis",
    email: "sarah.davis@brehanbank.com",
    phone: "456-789-0123",
    position_applied: "Financial Analyst",
    department: "Finance",
    application_date: "2023-04-05",
    status: "offered",
    type: "internal",
    current_position: "Junior Financial Analyst",
    current_department: "Finance",
    experience_years: 2,
    education_level: "Master's Degree",
    field_of_study: "Finance",
    resume_url: "/resumes/sarah-davis.pdf",
    interview_score: "92",
    interview_date: "2023-04-20",
    notes: "Excellent analytical skills, ready for promotion.",
  },
  {
    id: 5,
    full_name: "James Miller",
    email: "james.miller@email.com",
    phone: "567-890-1234",
    position_applied: "Teller",
    department: "Customer Service",
    application_date: "2023-04-18",
    status: "rejected",
    type: "external",
    experience_years: 1,
    education_level: "Associate's Degree",
    field_of_study: "Business",
    resume_url: "/resumes/james-miller.pdf",
    interview_score: "65",
    interview_date: "2023-05-02",
    notes: "Lacks necessary experience with banking systems.",
  },
  {
    id: 6,
    full_name: "Jennifer Taylor",
    email: "jennifer.taylor@brehanbank.com",
    phone: "678-901-2345",
    position_applied: "Loan Officer",
    department: "Loans",
    application_date: "2023-04-12",
    status: "hired",
    type: "internal",
    current_position: "Customer Service Representative",
    current_department: "Customer Service",
    experience_years: 3,
    education_level: "Bachelor's Degree",
    field_of_study: "Finance",
    resume_url: "/resumes/jennifer-taylor.pdf",
    interview_score: "88",
    interview_date: "2023-04-28",
    notes: "Great customer service skills, good understanding of loan products.",
  },
]

interface ApplicantsListProps {
  type: string
  searchTerm: string
  filterPosition: string
  onEdit: (applicant: Applicant) => void
}

export function ApplicantsList({ type, searchTerm, filterPosition, onEdit }: ApplicantsListProps) {
  const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null)

  // Filter applicants based on type, search term, and position filter
  const filteredApplicants = mockApplicants.filter((applicant) => {
    const matchesType = type === "all" || applicant.type === type
    const matchesSearch =
      applicant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = !filterPosition || applicant.position_applied === filterPosition

    return matchesType && matchesSearch && matchesPosition
  })

  // Helper function to get status badge variant
  const getStatusBadge = (status: Applicant["status"]) => {
    switch (status) {
      case "pending":
        return { variant: "outline" as const, label: "Pending" }
      case "shortlisted":
        return { variant: "secondary" as const, label: "Shortlisted" }
      case "interviewed":
        return { variant: "default" as const, label: "Interviewed" }
      case "offered":
        return { variant: "default" as const, label: "Offered" }
      case "rejected":
        return { variant: "destructive" as const, label: "Rejected" }
      case "hired":
        return { variant: "success" as const, label: "Hired" }
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position Applied</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No applicants found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplicants.map((applicant) => {
                  const statusBadge = getStatusBadge(applicant.status)
                  return (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">{applicant.full_name}</TableCell>
                      <TableCell>{applicant.position_applied}</TableCell>
                      <TableCell>
                        <Badge variant={applicant.type === "internal" ? "outline" : "secondary"}>
                          {applicant.type === "internal" ? "Internal" : "External"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(applicant.application_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setViewingApplicant(applicant)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(applicant)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Applicant
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" /> View Resume
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Advance Status
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject Application
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                    <span className="text-muted-foreground">Full Name:</span>
                    <span>{viewingApplicant.full_name}</span>
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
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{viewingApplicant.type}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Application Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Position Applied:</span>
                    <span>{viewingApplicant.position_applied}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Department:</span>
                    <span>{viewingApplicant.department}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Application Date:</span>
                    <span>{new Date(viewingApplicant.application_date).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={getStatusBadge(viewingApplicant.status).variant}>
                      {getStatusBadge(viewingApplicant.status).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {viewingApplicant.type === "internal" && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Current Position</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Position:</span>
                      <span>{viewingApplicant.current_position}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Department:</span>
                      <span>{viewingApplicant.current_department}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Qualifications</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Experience:</span>
                    <span>{viewingApplicant.experience_years} years</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Education:</span>
                    <span>{viewingApplicant.education_level}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Field of Study:</span>
                    <span>{viewingApplicant.field_of_study}</span>
                  </div>
                </div>
              </div>

              {(viewingApplicant.status === "interviewed" ||
                viewingApplicant.status === "offered" ||
                viewingApplicant.status === "hired" ||
                viewingApplicant.status === "rejected") && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Interview Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Interview Date:</span>
                        <span>
                          {viewingApplicant.interview_date
                            ? new Date(viewingApplicant.interview_date).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Interview Score:</span>
                        <span>{viewingApplicant.interview_score || "N/A"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground block">Notes:</span>
                        <p className="mt-1 p-2 bg-muted rounded-md">
                          {viewingApplicant.notes || "No notes available."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
