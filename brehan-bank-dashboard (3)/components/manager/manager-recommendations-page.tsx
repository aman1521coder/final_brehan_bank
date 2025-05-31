"use client"

import { useState } from "react"
import { ManagerLayout } from "@/components/manager/manager-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmployeeRecommendationsList } from "@/components/manager/employee-recommendations-list"
import { RecommendationForm } from "@/components/admin/recommendation-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Award } from "lucide-react"

export function ManagerRecommendationsPage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterBranch, setFilterBranch
    
  ] = useState("all")
  
  // State for recommendation modal
  const [showRecommendationModal, setShowRecommendationModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [tmdrec20Score, setTmdrec20Score] = useState(0)
  
  // Mock departments and branches for filter
  const departments = ["all", "Loans", "Customer Service", "Operations", "IT", "Management"]
  const branches = ["all", "Main Branch", "North Branch", "South Branch", "East Branch", "West Branch"]

  // Get user district from localStorage (if available)
  const getUserDistrict = () => {
    if (typeof window !== "undefined") {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}")
        return userData.district || "Unknown District"
      } catch (error) {
        return "Unknown District"
      }
    }
    return "Unknown District"
  }

  // Function to handle recommendation button click
  const handleRecommend = (employee) => {
    setSelectedEmployee(employee)
    setTmdrec20Score(employee.tmdrec20 ? parseFloat(employee.tmdrec20) : 0)
    setShowRecommendationModal(true)
  }

  // Handle recommendation form success
  const handleSubmitRecommendation = () => {
    // In a real application, this would save to the API
    toast({
      title: "Recommendation Submitted",
      description: `TMD Recommendation of ${tmdrec20Score} points has been submitted for ${selectedEmployee?.full_name}.`,
    })
    setShowRecommendationModal(false)
  }

  return (
    <ManagerLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Employee Recommendations</h1>
            <p className="text-muted-foreground">
              Manage employee recommendations for {getUserDistrict()}
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter employees by name, department, or branch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name, ID, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={filterBranch} onValueChange={setFilterBranch}>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch === "all" ? "All Branches" : branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <EmployeeRecommendationsList
          searchTerm={searchTerm}
          filterDepartment={filterDepartment}
          filterBranch={filterBranch}
          onRecommend={handleRecommend}
        />

        {/* Simple TMD Recommendation Modal */}
        <Dialog open={showRecommendationModal} onOpenChange={setShowRecommendationModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide TMD Recommendation</DialogTitle>
              <DialogDescription>
                You are providing a TMD recommendation for {selectedEmployee?.full_name} 
                (ID: {selectedEmployee?.id}, File #: {selectedEmployee?.file_number})
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">Employee Information:</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p><strong>Position:</strong> {selectedEmployee?.new_position}</p>
                    <p><strong>Department:</strong> {selectedEmployee?.department}</p>
                    <p><strong>Branch:</strong> {selectedEmployee?.branch}</p>
                    <p><strong>Individual PMS:</strong> {selectedEmployee?.individual_pms}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base font-semibold">TMD Recommendation (out of 20):</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">0</span>
                    <span className={`text-2xl font-bold ${
                      tmdrec20Score < 10 ? 'text-red-500' : 
                      tmdrec20Score < 15 ? 'text-amber-500' : 
                      'text-green-600'
                    }`}>
                      {tmdrec20Score}
                    </span>
                    <span className="text-sm">20</span>
                  </div>
                  <Slider 
                    value={[tmdrec20Score]}
                    max={20}
                    step={0.5}
                    onValueChange={(value) => setTmdrec20Score(value[0])}
                  />
                  <p className="text-xs text-muted-foreground pt-1">
                    Your recommendation score (TMD) carries 20% weight in the final evaluation.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="justification" className="text-base font-semibold">Justification:</Label>
                  <Textarea 
                    id="justification"
                    placeholder="Provide justification for your recommendation score"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRecommendationModal(false)}>Cancel</Button>
              <Button 
                className="bg-gold-500 hover:bg-gold-600" 
                onClick={handleSubmitRecommendation}
              >
                Submit Recommendation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ManagerLayout>
  )
} 