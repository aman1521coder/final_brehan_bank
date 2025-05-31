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
import { MoreHorizontal, Eye, FileCheck, FileEdit } from "lucide-react"

// Define our own employee type to avoid TypeScript errors
interface EmployeeData {
  id: string
  file_number: string
  full_name: string
  sex: string
  employment_date: string
  individual_pms: number
  last_dop: string
  job_grade: string
  new_salary: string
  job_category: string
  new_position: string
  branch: string
  department: string
  district: string
  twin_branch: string
  region: string
  field_of_study: string
  educational_level: string
  cluster: string
  indpms25: number
  totalexp20: number
  totalexp: number
  relatedexp: number
  expafterpromo: number
  tmdrec20: number | string
  disrec15: number | string
  total: number | string
}

// Mock data for employees
const mockEmployees: EmployeeData[] = [
  {
    id: "1",
    file_number: "EMP001",
    full_name: "John Doe",
    sex: "Male",
    employment_date: "2018-05-15",
    individual_pms: 85,
    last_dop: "2022-01-10",
    job_grade: "G4",
    new_salary: "65000",
    job_category: "Banking",
    new_position: "Senior Loan Officer",
    branch: "Main Branch",
    department: "Loans",
    district: "Central",
    twin_branch: "North Branch",
    region: "East",
    field_of_study: "Finance",
    educational_level: "Bachelor's Degree",
    cluster: "A",
    indpms25: 21.25,
    totalexp20: 16,
    totalexp: 5,
    relatedexp: 5,
    expafterpromo: 1,
    tmdrec20: 18,
    disrec15: 13.5,
    total: 68.75,
  },
  {
    id: "2",
    file_number: "EMP002",
    full_name: "Jane Smith",
    sex: "Female",
    employment_date: "2019-03-22",
    individual_pms: 92,
    last_dop: "2021-11-05",
    job_grade: "G3",
    new_salary: "58000",
    job_category: "Banking",
    new_position: "Customer Service Manager",
    branch: "South Branch",
    department: "Customer Service",
    district: "South",
    twin_branch: "East Branch",
    region: "South",
    field_of_study: "Business Administration",
    educational_level: "Master's Degree",
    cluster: "B",
    indpms25: 23,
    totalexp20: 12,
    totalexp: 4,
    relatedexp: 4,
    expafterpromo: 1.5,
    tmdrec20: "",
    disrec15: "",
    total: "",
  },
  {
    id: "3",
    file_number: "EMP003",
    full_name: "Michael Johnson",
    sex: "Male",
    employment_date: "2017-08-10",
    individual_pms: 78,
    last_dop: "2020-06-15",
    job_grade: "G5",
    new_salary: "72000",
    job_category: "IT",
    new_position: "IT Manager",
    branch: "Main Branch",
    department: "IT",
    district: "Central",
    twin_branch: "West Branch",
    region: "Central",
    field_of_study: "Computer Science",
    educational_level: "Master's Degree",
    cluster: "A",
    indpms25: 19.5,
    totalexp20: 18,
    totalexp: 6,
    relatedexp: 6,
    expafterpromo: 3,
    tmdrec20: "",
    disrec15: "",
    total: "",
  },
  {
    id: "4",
    file_number: "EMP004",
    full_name: "Sarah Williams",
    sex: "Female",
    employment_date: "2020-01-20",
    individual_pms: 88,
    last_dop: "2022-03-01",
    job_grade: "G3",
    new_salary: "55000",
    job_category: "Banking",
    new_position: "Teller Supervisor",
    branch: "North Branch",
    department: "Operations",
    district: "North",
    twin_branch: "Main Branch",
    region: "North",
    field_of_study: "Finance",
    educational_level: "Bachelor's Degree",
    cluster: "C",
    indpms25: 22,
    totalexp20: 10,
    totalexp: 3,
    relatedexp: 3,
    expafterpromo: 1,
    tmdrec20: 18.5,
    disrec15: "",
    total: "",
  },
  {
    id: "5",
    file_number: "EMP005",
    full_name: "Robert Brown",
    sex: "Male",
    employment_date: "2016-11-05",
    individual_pms: 90,
    last_dop: "2021-05-10",
    job_grade: "G6",
    new_salary: "85000",
    job_category: "Management",
    new_position: "Branch Manager",
    branch: "East Branch",
    department: "Management",
    district: "East",
    twin_branch: "South Branch",
    region: "East",
    field_of_study: "Business Management",
    educational_level: "Master's Degree",
    cluster: "A",
    indpms25: 22.5,
    totalexp20: 20,
    totalexp: 7,
    relatedexp: 7,
    expafterpromo: 2,
    tmdrec20: "",
    disrec15: "",
    total: "",
  },
]

interface EmployeeRecommendationsListProps {
  searchTerm: string
  filterDepartment: string
  filterBranch: string
  onRecommend: (employee: EmployeeData) => void
}

export function EmployeeRecommendationsList({
  searchTerm,
  filterDepartment,
  filterBranch,
  onRecommend,
}: EmployeeRecommendationsListProps) {
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeData | null>(null)

  // Get user district from localStorage
  const getUserDistrict = () => {
    if (typeof window !== "undefined") {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || '{"district":""}')
        return userData.district || ""
      } catch (error) {
        return ""
      }
    }
    return ""
  }

  const userDistrict = getUserDistrict()

  // Filter employees based on search term, filters, and user's district
  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch =
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.file_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.new_position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment
    const matchesBranch = filterBranch === "all" || employee.branch === filterBranch

    // Only show employees in the manager's district
    const matchesDistrict = !userDistrict || 
      employee.district === userDistrict || 
      employee.district === userDistrict.split(" ")[0] || 
      employee.district.includes(userDistrict)

    return matchesSearch && matchesDepartment && matchesBranch && matchesDistrict
  })

  // Helper function to get recommendation status
  const getRecommendationStatus = (employee: EmployeeData) => {
    if (employee.tmdrec20) {
      return <Badge className="bg-green-600">Recommendation Provided</Badge>
    } else {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600">
          Recommendation Needed
        </Badge>
      )
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Individual PMS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No employees found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.file_number}</TableCell>
                    <TableCell className="font-medium">{employee.full_name}</TableCell>
                    <TableCell>{employee.new_position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.branch}</TableCell>
                    <TableCell>{employee.individual_pms}</TableCell>
                    <TableCell>{getRecommendationStatus(employee)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Button 
                          onClick={() => onRecommend(employee)}
                          className={employee.tmdrec20 ? "bg-amber-500 hover:bg-amber-600" : "bg-gold-500 hover:bg-gold-600"}
                          size="sm"
                        >
                          {employee.tmdrec20 ? (
                            <>
                              <FileEdit className="mr-2 h-4 w-4" /> Update Recommendation
                            </>
                          ) : (
                            <>
                              <FileCheck className="mr-2 h-4 w-4" /> Provide Recommendation
                            </>
                          )}
                        </Button>

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
                            <DropdownMenuItem onClick={() => setViewingEmployee(employee)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewingEmployee} onOpenChange={(open) => !open && setViewingEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>Comprehensive information about the employee.</DialogDescription>
          </DialogHeader>

          {viewingEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">ID:</span>
                    <span>{viewingEmployee.id}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">File Number:</span>
                    <span>{viewingEmployee.file_number}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span>{viewingEmployee.full_name}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Gender:</span>
                    <span>{viewingEmployee.sex}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Employment Date:</span>
                    <span>{new Date(viewingEmployee.employment_date).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Last Promotion:</span>
                    <span>
                      {viewingEmployee.last_dop ? new Date(viewingEmployee.last_dop).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Job Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Position:</span>
                    <span>{viewingEmployee.new_position}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Department:</span>
                    <span>{viewingEmployee.department}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Job Grade:</span>
                    <span>{viewingEmployee.job_grade}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Job Category:</span>
                    <span>{viewingEmployee.job_category}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Salary:</span>
                    <span>${parseInt(viewingEmployee.new_salary).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Branch:</span>
                    <span>{viewingEmployee.branch}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">District:</span>
                    <span>{viewingEmployee.district}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Region:</span>
                    <span>{viewingEmployee.region}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Twin Branch:</span>
                    <span>{viewingEmployee.twin_branch}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Cluster:</span>
                    <span>{viewingEmployee.cluster}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Education</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Level:</span>
                    <span>{viewingEmployee.educational_level}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Field of Study:</span>
                    <span>{viewingEmployee.field_of_study}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Individual PMS:</span>
                      <span>{viewingEmployee.individual_pms}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">PMS (25%):</span>
                      <span>{viewingEmployee.indpms25}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Total Exp:</span>
                      <span>{viewingEmployee.totalexp} years</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Exp (20%):</span>
                      <span>{viewingEmployee.totalexp20}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Related Exp:</span>
                      <span>{viewingEmployee.relatedexp} years</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Exp After Promo:</span>
                      <span>{viewingEmployee.expafterpromo} years</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Mgr Rec (20%):</span>
                      <span className="font-medium text-gold-700">{viewingEmployee.tmdrec20 || "Pending"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Dist Rec (15%):</span>
                      <span>{viewingEmployee.disrec15 || "Pending"}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-2 bg-muted rounded-md">
                  <div className="grid grid-cols-2">
                    <span className="font-semibold">Total Score:</span>
                    <span className="font-semibold">{viewingEmployee.total || "Pending"}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => onRecommend(viewingEmployee)} className="bg-gold-500 hover:bg-gold-600">
                    <FileCheck className="mr-2 h-4 w-4" />
                    {viewingEmployee.tmdrec20 ? "Update Recommendation" : "Provide Recommendation"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
