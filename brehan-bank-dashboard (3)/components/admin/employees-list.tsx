"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Edit, RefreshCcw, Trash2, Download } from "lucide-react"
import { employeeAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import type { EmployeeData } from "@/lib/api"

interface EmployeesListProps {
  employees: EmployeeData[]
  searchTerm: string
  filterDepartment: string
  filterBranch: string
  onEdit: (employee: EmployeeData) => void
  isLoading: boolean
  onRefresh: () => void
  onDelete: (employee: EmployeeData) => void
  onView: (employee: EmployeeData) => void
}

export function EmployeesList({
  employees,
  searchTerm,
  filterDepartment,
  filterBranch,
  onEdit,
  isLoading,
  onRefresh,
  onDelete,
  onView,
}: EmployeesListProps) {
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeData | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      (employee.full_name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (employee.file_number || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (employee.new_position || "").toLowerCase().includes((searchTerm || "").toLowerCase())

    const matchesDepartment = !filterDepartment || employee.department === filterDepartment
    const matchesBranch = !filterBranch || employee.branch === filterBranch

    return matchesSearch && matchesDepartment && matchesBranch
  })

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return

    setIsDeleting(true)
    try {
      await employeeAPI.deleteEmployee(deletingEmployee.id?.toString() || "")
      toast({
        title: "Success",
        description: "Employee deleted successfully.",
      })
      onRefresh()
    } catch (error) {
      console.error("Failed to delete employee:", error)
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletingEmployee(null)
    }
  }

  // Function to export filtered employees to CSV
  const exportToCSV = () => {
    if (filteredEmployees.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no employees matching your current filters.",
        variant: "destructive",
      })
      return
    }

    // Define CSV headers
    const headers = [
      "ID",
      "File Number",
      "Name",
      "Position",
      "Department",
      "Branch",
      "Grade",
      "District",
      "TMD Rec",
      "District Rec",
      "Total Score",
    ]

    // Convert employee data to CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...filteredEmployees.map((employee) => {
        return [
          employee.id,
          employee.file_number,
          `"${employee.full_name || ""}"`, // Quotes to handle names with commas
          `"${employee.new_position || ""}"`,
          `"${employee.department || ""}"`,
          `"${employee.branch || ""}"`,
          employee.job_grade || "",
          `"${employee.district || ""}"`,
          employee.tmdrec20 || "0",
          employee.disrec15 || "0",
          employee.total || "0",
        ].join(",")
      }),
    ]

    // Create CSV content
    const csvContent = csvRows.join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `employees_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: `${filteredEmployees.length} employees exported to CSV.`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (filteredEmployees.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No employees found matching your criteria</p>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="flex justify-end p-4 gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>File Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>District</TableHead>
                <TableHead>TMD Rec</TableHead>
                <TableHead>District Rec</TableHead>
                <TableHead>Total Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.file_number}</TableCell>
                  <TableCell className="font-medium">{employee.full_name}</TableCell>
                  <TableCell>{employee.new_position}</TableCell>
                  <TableCell>{employee.department || "-"}</TableCell>
                  <TableCell>{employee.branch || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.job_grade}</Badge>
                  </TableCell>
                  <TableCell>{employee.district || "-"}</TableCell>
                  <TableCell>
                    {employee.tmdrec20 !== undefined ? (
                      <Badge variant={employee.tmdrec20 > 15 ? "secondary" : "default"}>{employee.tmdrec20}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.disrec15 !== undefined ? (
                      <Badge variant={employee.disrec15 > 10 ? "secondary" : "default"}>{employee.disrec15}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.total !== undefined ? (
                      <Badge variant={employee.total > 70 ? "secondary" : "default"}>{employee.total}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => onView(employee)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(employee)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
                    <span>${viewingEmployee.new_salary ? Number.parseInt(viewingEmployee.new_salary).toLocaleString() : '0'}</span>
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
                      <span>{viewingEmployee.tmdrec20}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Dist Rec (15%):</span>
                      <span>{viewingEmployee.disrec15}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-2 bg-muted rounded-md">
                  <div className="grid grid-cols-2">
                    <span className="font-semibold">Total Score:</span>
                    <span className="font-semibold">{viewingEmployee.total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingEmployee} onOpenChange={(open) => !open && setDeletingEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {deletingEmployee && (
              <p>
                You are about to delete <span className="font-semibold">{deletingEmployee.full_name}</span> (
                {deletingEmployee.file_number}).
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingEmployee(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
