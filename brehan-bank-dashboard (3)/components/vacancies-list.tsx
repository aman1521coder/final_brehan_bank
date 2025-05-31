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
import { MoreHorizontal, Eye, Edit, Copy, Users, Archive } from "lucide-react"

// Define the Vacancy type
export interface Vacancy {
  id: number
  title: string
  department: string
  location: string
  position_type: "full-time" | "part-time" | "contract" | "temporary"
  experience_level: string
  education_required: string
  salary_range: string
  posting_date: string
  closing_date: string
  status: "open" | "closed" | "draft"
  description: string
  requirements: string
  responsibilities: string
  benefits: string
  application_count: number
}

// Mock data for vacancies
const mockVacancies: Vacancy[] = [
  {
    id: 1,
    title: "Senior Loan Officer",
    department: "Loans",
    location: "Main Branch, Addis Ababa",
    position_type: "full-time",
    experience_level: "5+ years",
    education_required: "Bachelor's Degree in Finance or related field",
    salary_range: "$60,000 - $75,000",
    posting_date: "2023-05-01",
    closing_date: "2023-05-30",
    status: "open",
    description:
      "We are seeking an experienced Senior Loan Officer to join our team at Brehan Bank. The ideal candidate will have a strong background in loan processing and customer service.",
    requirements:
      "- 5+ years of experience in loan processing\n- Bachelor's degree in Finance or related field\n- Strong communication skills\n- Knowledge of banking regulations",
    responsibilities:
      "- Process loan applications\n- Conduct client interviews\n- Analyze financial data\n- Make loan recommendations\n- Monitor loan portfolio",
    benefits:
      "- Competitive salary\n- Health insurance\n- Retirement plan\n- Paid time off\n- Professional development opportunities",
    application_count: 12,
  },
  {
    id: 2,
    title: "Branch Manager",
    department: "Management",
    location: "North Branch, Bahir Dar",
    position_type: "full-time",
    experience_level: "7+ years",
    education_required: "Master's Degree in Business Administration or related field",
    salary_range: "$80,000 - $95,000",
    posting_date: "2023-04-15",
    closing_date: "2023-05-15",
    status: "open",
    description:
      "Brehan Bank is looking for a Branch Manager to oversee operations at our North Branch location. The successful candidate will be responsible for managing staff, ensuring compliance with regulations, and meeting branch targets.",
    requirements:
      "- 7+ years of banking experience\n- 3+ years in a management role\n- Master's degree in Business Administration or related field\n- Strong leadership skills\n- Knowledge of banking operations and regulations",
    responsibilities:
      "- Oversee branch operations\n- Manage branch staff\n- Ensure compliance with regulations\n- Meet branch targets\n- Develop and implement strategies to improve branch performance",
    benefits:
      "- Competitive salary\n- Health insurance\n- Retirement plan\n- Paid time off\n- Performance bonuses\n- Professional development opportunities",
    application_count: 8,
  },
  {
    id: 3,
    title: "Customer Service Representative",
    department: "Customer Service",
    location: "South Branch, Hawassa",
    position_type: "full-time",
    experience_level: "1-3 years",
    education_required: "Associate's Degree or Bachelor's Degree",
    salary_range: "$35,000 - $45,000",
    posting_date: "2023-05-10",
    closing_date: "2023-06-10",
    status: "open",
    description:
      "Brehan Bank is seeking a Customer Service Representative to join our team at the South Branch. The ideal candidate will have excellent communication skills and a customer-focused attitude.",
    requirements:
      "- 1-3 years of customer service experience\n- Associate's or Bachelor's degree\n- Excellent communication skills\n- Proficiency in Microsoft Office\n- Ability to work in a fast-paced environment",
    responsibilities:
      "- Assist customers with account inquiries\n- Process transactions\n- Resolve customer complaints\n- Promote bank products and services\n- Maintain customer confidentiality",
    benefits:
      "- Competitive salary\n- Health insurance\n- Retirement plan\n- Paid time off\n- Professional development opportunities",
    application_count: 25,
  },
  {
    id: 4,
    title: "IT Specialist",
    department: "IT",
    location: "Head Office, Addis Ababa",
    position_type: "full-time",
    experience_level: "3-5 years",
    education_required: "Bachelor's Degree in Computer Science or related field",
    salary_range: "$50,000 - $65,000",
    posting_date: "2023-04-20",
    closing_date: "2023-05-20",
    status: "closed",
    description:
      "Brehan Bank is looking for an IT Specialist to join our team at the Head Office. The successful candidate will be responsible for maintaining our IT infrastructure and providing technical support to staff.",
    requirements:
      "- 3-5 years of IT experience\n- Bachelor's degree in Computer Science or related field\n- Knowledge of networking and security\n- Experience with Windows Server and Active Directory\n- Troubleshooting skills",
    responsibilities:
      "- Maintain IT infrastructure\n- Provide technical support to staff\n- Implement security measures\n- Manage user accounts\n- Document IT procedures",
    benefits:
      "- Competitive salary\n- Health insurance\n- Retirement plan\n- Paid time off\n- Professional development opportunities",
    application_count: 18,
  },
  {
    id: 5,
    title: "Financial Analyst",
    department: "Finance",
    location: "Head Office, Addis Ababa",
    position_type: "full-time",
    experience_level: "2-4 years",
    education_required: "Bachelor's Degree in Finance or related field",
    salary_range: "$45,000 - $60,000",
    posting_date: "2023-05-05",
    closing_date: "2023-06-05",
    status: "draft",
    description:
      "Brehan Bank is seeking a Financial Analyst to join our Finance department. The ideal candidate will have strong analytical skills and experience with financial modeling.",
    requirements:
      "- 2-4 years of financial analysis experience\n- Bachelor's degree in Finance or related field\n- Proficiency in Excel and financial modeling\n- Strong analytical skills\n- Attention to detail",
    responsibilities:
      "- Analyze financial data\n- Prepare financial reports\n- Develop financial models\n- Support budgeting and forecasting\n- Identify trends and opportunities",
    benefits:
      "- Competitive salary\n- Health insurance\n- Retirement plan\n- Paid time off\n- Professional development opportunities",
    application_count: 0,
  },
]

interface VacanciesListProps {
  searchTerm: string
  filterDepartment: string
  filterStatus: string
  onEdit: (vacancy: Vacancy) => void
}

export function VacanciesList({ searchTerm, filterDepartment, filterStatus, onEdit }: VacanciesListProps) {
  const [viewingVacancy, setViewingVacancy] = useState<Vacancy | null>(null)

  // Filter vacancies based on search term and filters
  const filteredVacancies = mockVacancies.filter((vacancy) => {
    const matchesSearch =
      vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = filterDepartment === "all" || vacancy.department === filterDepartment
    const matchesStatus = filterStatus === "all" || vacancy.status === filterStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

  // Helper function to get status badge variant
  const getStatusBadge = (status: Vacancy["status"]) => {
    switch (status) {
      case "open":
        return { variant: "default" as const, label: "Open" }
      case "closed":
        return { variant: "secondary" as const, label: "Closed" }
      case "draft":
        return { variant: "outline" as const, label: "Draft" }
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Posting Date</TableHead>
                <TableHead>Closing Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVacancies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No vacancies found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredVacancies.map((vacancy) => {
                  const statusBadge = getStatusBadge(vacancy.status)
                  return (
                    <TableRow key={vacancy.id}>
                      <TableCell className="font-medium">{vacancy.title}</TableCell>
                      <TableCell>{vacancy.department}</TableCell>
                      <TableCell>{vacancy.location}</TableCell>
                      <TableCell>{new Date(vacancy.posting_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(vacancy.closing_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </TableCell>
                      <TableCell>{vacancy.application_count}</TableCell>
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
                            <DropdownMenuItem onClick={() => setViewingVacancy(vacancy)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(vacancy)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Vacancy
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" /> View Applicants
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" /> Archive
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

      <Dialog open={!!viewingVacancy} onOpenChange={(open) => !open && setViewingVacancy(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vacancy Details</DialogTitle>
            <DialogDescription>Comprehensive information about the job vacancy.</DialogDescription>
          </DialogHeader>

          {viewingVacancy && (
            <div className="space-y-6 mt-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h2 className="text-xl font-bold">{viewingVacancy.title}</h2>
                <Badge variant={getStatusBadge(viewingVacancy.status).variant}>
                  {getStatusBadge(viewingVacancy.status).label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Job Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Department:</span>
                      <span>{viewingVacancy.department}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{viewingVacancy.location}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Position Type:</span>
                      <span className="capitalize">{viewingVacancy.position_type.replace("-", " ")}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Experience Level:</span>
                      <span>{viewingVacancy.experience_level}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Education Required:</span>
                      <span>{viewingVacancy.education_required}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Salary Range:</span>
                      <span>{viewingVacancy.salary_range}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Posting Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Posting Date:</span>
                      <span>{new Date(viewingVacancy.posting_date).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Closing Date:</span>
                      <span>{new Date(viewingVacancy.closing_date).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Applications:</span>
                      <span>{viewingVacancy.application_count}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                <p className="whitespace-pre-line">{viewingVacancy.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <p className="whitespace-pre-line">{viewingVacancy.requirements}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                  <p className="whitespace-pre-line">{viewingVacancy.responsibilities}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                <p className="whitespace-pre-line">{viewingVacancy.benefits}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
