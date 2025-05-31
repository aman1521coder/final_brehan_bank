"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { employeeAPI } from "@/lib/api"
import type { EmployeeData } from "@/lib/api"
import { Search, SortDesc, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ManagerEmployeesList } from "./manager-employees-list"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function ManagerEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [fileNumber, setFileNumber] = useState("")
  const [sortBy, setSortBy] = useState<"none" | "total" | "name" | "id">("none")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRecommendDialogOpen, setIsRecommendDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterAndSortEmployees()
  }, [searchQuery, employeeId, fileNumber, sortBy, sortOrder, employees, activeTab])

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const response = await employeeAPI.getAllEmployees()
      setEmployees(response.data)
      setFilteredEmployees(response.data)
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortEmployees = () => {
    let filtered = [...employees]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (employee) =>
          (employee.full_name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
          (employee.department || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
          (employee.branch || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
          (employee.new_position || "").toLowerCase().includes((searchQuery || "").toLowerCase()),
      )
    }

    // Filter by employee ID
    if (employeeId) {
      filtered = filtered.filter((employee) => employee.id?.toString() === employeeId)
    }

    // Filter by file number
    if (fileNumber) {
      filtered = filtered.filter((employee) =>
        (employee.file_number || "").toLowerCase().includes((fileNumber || "").toLowerCase()),
      )
    }

    // Sort employees
    if (sortBy !== "none") {
      filtered.sort((a, b) => {
        let comparison = 0

        switch (sortBy) {
          case "total":
            comparison = (b.total || 0) - (a.total || 0)
            break
          case "name":
            comparison = (a.full_name || "").localeCompare(b.full_name || "")
            break
          case "id":
            comparison = (a.id || 0) - (b.id || 0)
            break
        }

        return sortOrder === "asc" ? comparison : -comparison
      })
    }

    setFilteredEmployees(filtered)
  }

  const openViewDialog = (employee: EmployeeData) => {
    setSelectedEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const openRecommendDialog = (employee: EmployeeData) => {
    setSelectedEmployee(employee)
    setIsRecommendDialogOpen(true)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setEmployeeId("")
    setFileNumber("")
    setSortBy("none")
    setSortOrder("desc")
    setIsFilterOpen(false)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, position, department, or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Advanced Filters</h4>
                      <p className="text-sm text-muted-foreground">Filter employees by specific criteria</p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="employee-id" className="text-right">
                          Employee ID
                        </Label>
                        <Input
                          id="employee-id"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          className="col-span-2"
                          placeholder="Enter ID"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="file-number" className="text-right">
                          File Number
                        </Label>
                        <Input
                          id="file-number"
                          value={fileNumber}
                          onChange={(e) => setFileNumber(e.target.value)}
                          className="col-span-2"
                          placeholder="Enter file number"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="sort-by" className="text-right">
                          Sort By
                        </Label>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                          <SelectTrigger id="sort-by" className="col-span-2">
                            <SelectValue placeholder="Select sort field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Sorting</SelectItem>
                            <SelectItem value="total">Total Score</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="id">ID</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="sort-order" className="text-right">
                          Sort Order
                        </Label>
                        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
                          <SelectTrigger id="sort-order" className="col-span-2">
                            <SelectValue placeholder="Select sort order" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">Highest First</SelectItem>
                            <SelectItem value="asc">Lowest First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Reset Filters
                      </Button>
                      <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Sorting</SelectItem>
                  <SelectItem value="total">Total Score</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="id">ID</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-9 w-9"
              >
                <SortDesc className={`h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>

          {(employeeId || fileNumber || sortBy !== "none") && (
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <span>Active filters:</span>
              {employeeId && (
                <span className="ml-2 bg-muted px-2 py-1 rounded-md flex items-center">ID: {employeeId}</span>
              )}
              {fileNumber && (
                <span className="ml-2 bg-muted px-2 py-1 rounded-md flex items-center">File #: {fileNumber}</span>
              )}
              {sortBy !== "none" && (
                <span className="ml-2 bg-muted px-2 py-1 rounded-md flex items-center">
                  Sorted by: {sortBy} ({sortOrder === "desc" ? "highest first" : "lowest first"})
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-2 h-7 px-2">
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Employees</TabsTrigger>
          <TabsTrigger value="needsRecommendation">Needs TMD Rec</TabsTrigger>
          <TabsTrigger value="recommended">Has TMD Recommendation</TabsTrigger>
          <TabsTrigger value="highScore">High Overall Score (70+)</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <ManagerEmployeesList
                employees={filteredEmployees}
                isLoading={isLoading}
                onView={openViewDialog}
                onRecommend={openRecommendDialog}
                onRefresh={fetchEmployees}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="needsRecommendation">
          <Card>
            <CardHeader>
              <CardTitle>Employees Needing TMD Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <ManagerEmployeesList
                employees={filteredEmployees.filter((e) => !e.tmdrec20 || Number(e.tmdrec20) === 0)}
                isLoading={isLoading}
                onView={openViewDialog}
                onRecommend={openRecommendDialog}
                onRefresh={fetchEmployees}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommended">
          <Card>
            <CardHeader>
              <CardTitle>Employees With TMD Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <ManagerEmployeesList
                employees={filteredEmployees.filter((e) => e.tmdrec20 && Number(e.tmdrec20) > 0)}
                isLoading={isLoading}
                onView={openViewDialog}
                onRecommend={openRecommendDialog}
                onRefresh={fetchEmployees}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="highScore">
          <Card>
            <CardHeader>
              <CardTitle>High Overall Score Employees (70+)</CardTitle>
            </CardHeader>
            <CardContent>
              <ManagerEmployeesList
                employees={filteredEmployees.filter((e) => (e.total || 0) >= 70)}
                isLoading={isLoading}
                onView={openViewDialog}
                onRecommend={openRecommendDialog}
                onRefresh={fetchEmployees}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Personal Information</h3>
                  <p>
                    <span className="font-medium">ID:</span> {selectedEmployee.id}
                  </p>
                  <p>
                    <span className="font-medium">Name:</span> {selectedEmployee.full_name}
                  </p>
                  <p>
                    <span className="font-medium">File Number:</span> {selectedEmployee.file_number}
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span> {selectedEmployee.sex}
                  </p>
                  <p>
                    <span className="font-medium">Employment Date:</span> {selectedEmployee.employment_date}
                  </p>
                  <p>
                    <span className="font-medium">Education:</span> {selectedEmployee.educational_level}
                  </p>
                  <p>
                    <span className="font-medium">Field of Study:</span> {selectedEmployee.field_of_study}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Job Information</h3>
                  <p>
                    <span className="font-medium">Department:</span> {selectedEmployee.department}
                  </p>
                  <p>
                    <span className="font-medium">Branch:</span> {selectedEmployee.branch}
                  </p>
                  <p>
                    <span className="font-medium">District:</span> {selectedEmployee.district}
                  </p>
                  <p>
                    <span className="font-medium">Region:</span> {selectedEmployee.region}
                  </p>
                  <p>
                    <span className="font-medium">Job Grade:</span> {selectedEmployee.job_grade}
                  </p>
                  <p>
                    <span className="font-medium">Job Category:</span> {selectedEmployee.job_category}
                  </p>
                  <p>
                    <span className="font-medium">Position:</span> {selectedEmployee.new_position}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Evaluation Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p>
                    <span className="font-medium">Individual PMS (25%):</span> {selectedEmployee.indpms25}
                  </p>
                  <p>
                    <span className="font-medium">Total Experience (20%):</span> {selectedEmployee.totalexp20}
                  </p>
                  <p>
                    <span className="font-medium">Total Experience:</span> {selectedEmployee.totalexp} years
                  </p>
                  <p>
                    <span className="font-medium">Related Experience:</span> {selectedEmployee.relatedexp} years
                  </p>
                  <p>
                    <span className="font-medium">Experience After Promotion:</span> {selectedEmployee.expafterpromo}{" "}
                    years
                  </p>
                  <p>
                    <span className="font-medium">TMD Rec (20%):</span>{" "}
                    {selectedEmployee.tmdrec20 || "Not yet provided"}
                  </p>
                  <p>
                    <span className="font-medium">District Rec (15%):</span>{" "}
                    {selectedEmployee.disrec15 || "Not yet provided"}
                  </p>
                  <p>
                    <span className="font-medium">Total Score:</span> {selectedEmployee.total || "Incomplete"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                openRecommendDialog(selectedEmployee!)
              }}
            >
              Provide Recommendation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recommend Dialog */}
      <Dialog open={isRecommendDialogOpen} onOpenChange={setIsRecommendDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Provide TMD Recommendation</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <p>
                You are providing a TMD recommendation for{" "}
                <span className="font-semibold">{selectedEmployee.full_name}</span> (ID: {selectedEmployee.id}, File #:{" "}
                {selectedEmployee.file_number})
              </p>
              {/* Recommendation form would go here */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
