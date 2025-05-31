"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DistrictRecommendationForm } from "@/components/district/district-recommendation-form"
import { employeeAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export function PendingDistrictRecommendations() {
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeeAPI.getEmployeesForDistrictManager()

        // Filter employees that have TMD Rec 20% but no Dis Rec 15%
        const pendingEmployees = response.data.filter(
          (employee) => employee.tmdrec20 && (!employee.disrec15 || employee.disrec15 === "0"),
        )

        setEmployees(pendingEmployees)
      } catch (error) {
        console.error("Error fetching employees:", error)
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const handleUpdateRecommendation = (employee) => {
    setSelectedEmployee(employee)
    setDialogOpen(true)
  }

  const handleFormSubmit = () => {
    setDialogOpen(false)

    // Refresh the employee list
    setLoading(true)
    employeeAPI
      .getEmployeesForDistrictManager()
      .then((response) => {
        const pendingEmployees = response.data.filter(
          (employee) => employee.tmdrec20 && (!employee.disrec15 || employee.disrec15 === "0"),
        )
        setEmployees(pendingEmployees)
      })
      .catch((error) => {
        console.error("Error refreshing employees:", error)
        toast({
          title: "Error",
          description: "Failed to refresh employee list",
          variant: "destructive",
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending District Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading pending recommendations...</p>
        ) : employees.length === 0 ? (
          <p className="text-muted-foreground py-4">No pending district recommendations.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>TMD Rec 20%</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.full_name}</TableCell>
                    <TableCell>{employee.new_position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.branch}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gold-50">
                        {employee.tmdrec20}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleUpdateRecommendation(employee)}>
                        Update Recommendation
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* District Recommendation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Update District Recommendation</DialogTitle>
            </DialogHeader>
            <DistrictRecommendationForm
              employee={selectedEmployee}
              onSubmit={handleFormSubmit}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
