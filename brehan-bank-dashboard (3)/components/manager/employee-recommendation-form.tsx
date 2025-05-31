"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updateManagerRecommendation } from "@/lib/managerAPI"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/context/notification-context"
import type { EmployeeData, RecommendationData } from "@/lib/api"

interface EmployeeRecommendationFormProps {
  employee: EmployeeData
  onSuccess?: () => void
  onCancel?: () => void
}

export function EmployeeRecommendationForm({ 
  employee,
  onSuccess,
  onCancel
}: EmployeeRecommendationFormProps) {
  const [score, setScore] = useState<number>(employee.tmdrec20 || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create the data object with both score (for type) and tmdrec20 (for API)
      const recommendationData = {
        employee_id: employee.id!,
        score: score,
        tmdrec20: score // This is required by the backend
      }

      console.log("Submitting recommendation:", recommendationData)
      const response = await updateManagerRecommendation(String(employee.id!), recommendationData)

      if (response.status === 200) {
        // Add notification for district manager
        addNotification({
          title: "Manager Recommendation Updated",
          message: `TMD Rec 20% has been submitted for ${employee.full_name}. District recommendation (Dis Rec 15%) is now needed.`,
          type: "info",
          recipientRole: "district_manager",
          employeeId: employee.id,
          employeeName: employee.full_name
        })
        
        // Also notify the user of success
        toast({
          title: "Success",
          description: "Manager recommendation updated successfully",
        })

        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error("Error updating manager recommendation:", error)
      // Log more details if available
      if ((error as any).response) {
        console.error("Error response status:", (error as any).response.status)
        console.error("Error response data:", (error as any).response.data)
      }
      toast({
        title: "Error",
        description: "Failed to update manager recommendation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Manager Recommendation</CardTitle>
        <CardDescription>Set the Manager Recommendation score (20%) for {employee.full_name}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="score">Manager Recommendation Score (20%)</Label>
              <span className={`text-lg font-medium ${
                score < 10 ? 'text-red-500' : 
                score < 15 ? 'text-amber-500' : 
                'text-green-600'
              }`}>
                {score}%
              </span>
            </div>
            <Slider
              id="score"
              min={0}
              max={20}
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
              <span>20%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeric-score">Enter Score Manually</Label>
            <Input
              id="numeric-score"
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Employee Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Name:</span> {employee.full_name}
              </div>
              <div>
                <span className="font-medium">File Number:</span> {employee.file_number}
              </div>
              <div>
                <span className="font-medium">Department:</span> {employee.department || "-"}
              </div>
              <div>
                <span className="font-medium">Branch:</span> {employee.branch || "-"}
              </div>

              <div>
                <span className="font-medium">Position:</span> {employee.new_position || "-"}
              </div>
              <div>
                <span className="font-medium">Current TMD Rec:</span> {employee.tmdrec20 || "0"}%
              </div>
              <div>
                <span className="font-medium">District Rec (15%):</span> {employee.disrec15 || "0"}%
              </div>
              <div>
                <span className="font-medium">Total Score:</span> {employee.total || "0"}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className={onCancel ? "" : "w-full"}>
            {isSubmitting ? "Updating..." : "Update Manager Recommendation"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

