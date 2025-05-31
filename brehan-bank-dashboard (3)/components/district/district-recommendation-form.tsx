"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { employeeAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { EmployeeData, RecommendationData } from "@/lib/api"

interface DistrictRecommendationFormProps {
  employee: EmployeeData
  onSuccess?: () => void
}

export function DistrictRecommendationForm({ employee, onSuccess }: DistrictRecommendationFormProps) {
  // Safely get the initial score handling potential SQL null object
  let initialScore = 0;
  if (typeof employee.disrec15 === 'object' && employee.disrec15 !== null) {
    // Handle SQL NullString/NullFloat object
    const nullObject = employee.disrec15 as unknown as { Valid: boolean, String: string };
    if (nullObject.Valid) {
      initialScore = parseFloat(nullObject.String);
    }
  } else if (employee.disrec15) {
    initialScore = typeof employee.disrec15 === 'string' 
      ? parseFloat(employee.disrec15) 
      : Number(employee.disrec15);
  }
    
  const [score, setScore] = useState<number>(initialScore)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatedEmployee, setUpdatedEmployee] = useState<EmployeeData | null>(null)
  const { toast } = useToast()
  
  // Use the employee from props or the updated one if available
  const displayEmployee = updatedEmployee || employee

  // Helper function to safely display numeric values
  const safeDisplayValue = (value: any) => {
    if (value === null || value === undefined) return "0";
    if (typeof value === 'object' && 'Valid' in value) {
      // Handle SQL Null objects
      return value.Valid ? value.String : "0";
    }
    return value.toString();
  }

  // Calculate the estimated total score
  const calculateEstimatedTotal = () => {
    const indpms25 = parseFloat(safeDisplayValue(displayEmployee.indpms25)) || 0;
    const totalexp20 = parseFloat(safeDisplayValue(displayEmployee.totalexp20)) || 0;
    const tmdrec20 = parseFloat(safeDisplayValue(displayEmployee.tmdrec20)) || 0;
    
    // Add current district score (the one being edited)
    const total = indpms25 + totalexp20 + tmdrec20 + score;
    return total.toFixed(2);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Ensure employee_id is a number
      const employeeId = typeof employee.id === 'string' ? parseInt(employee.id, 10) : employee.id;
      
      const recommendationData: RecommendationData = {
        employee_id: employeeId!,
        score: score,
      }

      console.log("Submitting district recommendation:", recommendationData);

      await employeeAPI.updateDistrictManagerRecommendation(employeeId!, recommendationData)
      
      // Fetch the updated employee data to refresh the UI
      try {
        const response = await employeeAPI.getEmployeeById(employeeId!)
        console.log("Updated employee data:", response.data);
        setUpdatedEmployee(response.data)
      } catch (fetchError) {
        console.error("Error fetching updated employee data:", fetchError)
      }

      toast({
        title: "Success",
        description: "District Recommendation updated successfully",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error updating district recommendation:", error)
      toast({
        title: "Error",
        description: "Failed to update district recommendation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update District Recommendation</CardTitle>
        <CardDescription>Set the District Recommendation score (15%) for {displayEmployee.full_name}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="score">District Recommendation Score (15%)</Label>
              <span className="text-lg font-medium">{score}%</span>
            </div>
            <Slider
              id="score"
              min={0}
              max={15}
              step={0.5}
              value={[score]}
              onValueChange={(values) => setScore(values[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>5%</span>
              <span>10%</span>
              <span>15%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeric-score">Enter Score Manually</Label>
            <Input
              id="numeric-score"
              type="number"
              min={0}
              max={15}
              step={0.5}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Employee Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">ID:</span> {displayEmployee.id}
              </div>
              <div>
                <span className="font-medium">Name:</span> {displayEmployee.full_name}
              </div>
              <div>
                <span className="font-medium">File Number:</span> {displayEmployee.file_number}
              </div>
              <div>
                <span className="font-medium">Gender:</span> {displayEmployee.sex}
              </div>
              <div>
                <span className="font-medium">Department:</span> {displayEmployee.department || "-"}
              </div>
              <div>
                <span className="font-medium">Branch:</span> {displayEmployee.branch || "-"}
              </div>
              <div>
                <span className="font-medium">Position:</span> {displayEmployee.new_position || "-"}
              </div>
              <div>
                <span className="font-medium">District:</span> {displayEmployee.district || "-"}
              </div>
              <div>
                <span className="font-medium">Education:</span> {displayEmployee.educational_level || "-"}
              </div>
              <div>
                <span className="font-medium">Field of Study:</span> {displayEmployee.field_of_study || "-"}
              </div>
            </div>
          </div>

          <div className="space-y-2 bg-amber-50 p-4 rounded-md">
            <h3 className="font-medium text-amber-800">Evaluation Metrics</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Individual PMS (25%):</span> {safeDisplayValue(displayEmployee.indpms25)}%
              </div>
              <div>
                <span className="font-medium">Experience (20%):</span> {safeDisplayValue(displayEmployee.totalexp20)}%
              </div>
              <div>
                <span className="font-medium">TMD Rec (20%):</span> {safeDisplayValue(displayEmployee.tmdrec20)}%
              </div>
              <div>
                <span className="font-medium">Current District Rec (15%):</span> {safeDisplayValue(displayEmployee.disrec15)}%
              </div>
              <div>
                <span className="font-medium">Your New Score (15%):</span> <span className="text-amber-700">{score}%</span>
              </div>
              <div>
                <span className="font-medium">Estimated Total:</span> <span className="text-amber-700">{calculateEstimatedTotal()}%</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-lg">Current Total Score:</span> 
                <span className="text-lg font-bold ml-2">{safeDisplayValue(displayEmployee.total)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Updating..." : "Update District Recommendation"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
