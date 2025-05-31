"use client"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Eye, FileCheck, Download } from "lucide-react"
import type { EmployeeData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { EmployeeRecPopup } from "./employee-rec-popup"
import { EmployeeRecommendationForm } from "./employee-recommendation-form"

interface ManagerEmployeesListProps {
  employees: EmployeeData[]
  isLoading: boolean
  onView: (employee: EmployeeData) => void
  onRecommend: (employee: EmployeeData) => void
  onRefresh: () => void
}

export function ManagerEmployeesList({
  employees,
  isLoading,
  onView,
  onRecommend,
  onRefresh,
}: ManagerEmployeesListProps) {
  const { toast } = useToast()
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null)
  const [recPopupOpen, setRecPopupOpen] = useState(false)
  const [showRecommendationForm, setShowRecommendationForm] = useState(false)
  const [filterMode, setFilterMode] = useState<'all' | 'needs-review' | 'high-score'>('all')

  // Filtered employees based on current filter
  const filteredEmployees = employees.filter(employee => {
    if (filterMode === 'needs-review') {
      return !employee.tmdrec20 || Number(employee.tmdrec20) === 0;
    } else if (filterMode === 'high-score') {
      return employee.tmdrec20 && Number(employee.tmdrec20) > 15;
    }
    return true; // 'all' mode returns all employees
  });

  // Function to handle recommendation click
  const handleRecommendClick = (employee: EmployeeData) => {
    setSelectedEmployee(employee)
    setRecPopupOpen(true)
  }

  // Function to open the full form
  const openFullForm = () => {
    setRecPopupOpen(false)
    setShowRecommendationForm(true)
  }

  // Function to handle cancel
  const handleCancel = () => {
    setShowRecommendationForm(false)
  }

  // Function to handle success
  const handleSuccess = () => {
    setShowRecommendationForm(false)
    if (selectedEmployee) {
      onRecommend(selectedEmployee)
    }
    onRefresh()
  }

  // Function to export employees to CSV
  const exportToCSV = () => {
    if (employees.length === 0) {
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
      "TMD Rec (20%)",
      "District Rec (15%)",
      "Total Score",
    ]

    // Convert employee data to CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...employees.map((employee) => {
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
    link.setAttribute("download", `manager_employees_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: `${employees.length} employees exported to CSV.`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No employees found matching your criteria</p>
      </div>
    )
  }

  if (showRecommendationForm && selectedEmployee) {
    return (
      <div className="space-y-6">
        <Button onClick={handleCancel} variant="outline" className="mb-4">
          ← Back to Employee List
        </Button>
        <EmployeeRecommendationForm 
          employee={selectedEmployee}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4">
          <div className="text-sm text-muted-foreground">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""} found
          </div>
          <div className="flex gap-2">
            <div className="flex mr-4 bg-slate-100 rounded-md p-0.5">
              <Button 
                variant={filterMode === 'all' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setFilterMode('all')}
                className="text-xs px-2"
              >
                All Employees
              </Button>
              <Button 
                variant={filterMode === 'needs-review' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setFilterMode('needs-review')}
                className="text-xs px-2"
              >
                Needs TMD Rec
              </Button>
              <Button 
                variant={filterMode === 'high-score' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setFilterMode('high-score')}
                className="text-xs px-2"
              >
                High TMD Score ({'>'}15)
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <Eye className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
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
              <TableHead>TMD Rec (20%)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow 
                key={employee.id}
                className={!employee.tmdrec20 ? "bg-amber-50" : ""}
              >
                <TableCell className="font-medium">{employee.id}</TableCell>
                <TableCell>{employee.file_number}</TableCell>
                <TableCell className="font-medium">{employee.full_name}</TableCell>
                <TableCell>{employee.new_position}</TableCell>
                <TableCell>{employee.department || "-"}</TableCell>
                <TableCell>{employee.branch || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{employee.job_grade}</Badge>
                </TableCell>
                <TableCell>
                  {employee.tmdrec20 !== undefined && employee.tmdrec20 > 0 ? (
                    <Badge variant={Number(employee.tmdrec20) > 15 ? "default" : "secondary"} className={Number(employee.tmdrec20) > 15 ? "bg-green-600" : ""}>
                      {employee.tmdrec20}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-500 border-red-300">Not Set</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {employee.tmdrec20 && Number(employee.tmdrec20) > 0 ? (
                    <Badge className={Number(employee.tmdrec20) > 15 ? "bg-green-600" : "bg-blue-600"}>
                      {Number(employee.tmdrec20) > 15 ? "TMD Highly Recommended" : "TMD Recommended"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                      Needs TMD Recommendation
                    </Badge>
                  )}
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
                      <DropdownMenuItem onClick={() => onView(employee)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRecommendClick(employee)}>
                        <FileCheck className="mr-2 h-4 w-4" />{" "}
                        {employee.tmdrec20 && Number(employee.tmdrec20) > 0 ? "Update Recommendation" : "Provide Recommendation"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Initial Popup */}
      {selectedEmployee && (
        <EmployeeRecPopup
          employee={selectedEmployee}
          open={recPopupOpen}
          onOpenChange={(open) => {
            setRecPopupOpen(open)
            if (!open) {
              openFullForm()
            }
          }}
        />
      )}
    </Card>
  )
}
