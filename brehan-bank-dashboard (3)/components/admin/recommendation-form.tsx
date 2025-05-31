"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { employeeAPI } from "@/lib/api"

interface RecommendationFormProps {
  employeeId?: string
  onSuccess?: () => void
  isEdit?: boolean
  initialData?: any
}

export function RecommendationForm({ 
  employeeId, 
  onSuccess, 
  isEdit = false,
  initialData = {}
}: RecommendationFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData.title || "Performance Evaluation",
    category: initialData.category || "promotion",
    description: initialData.description || "",
    action_required: initialData.action_required || "",
    recommendation_score: initialData.tmdrec20 || 0, // Score out of 20
    justification: initialData.justification || "",
    notify_district_manager: true,
    ...initialData
  })
  const [employee, setEmployee] = useState<any>(null)

  // Fetch employee data if employeeId is provided
  useEffect(() => {
    if (employeeId) {
      const fetchEmployee = async () => {
        try {
          // For demo, we'll mock this with local data
          const mockEmployees = [
            {
              id: "1",
              name: "John Doe",
              district: "Central",
              position: "Senior Loan Officer",
              individual_pms: 85
            },
            {
              id: "2",
              name: "Jane Smith",
              district: "South",
              position: "Customer Service Manager",
              individual_pms: 92
            }
          ];
          
          const foundEmployee = mockEmployees.find(emp => emp.id === employeeId);
          if (foundEmployee) {
            setEmployee(foundEmployee);
          } else {
            toast({
              title: "Error",
              description: "Employee not found",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error fetching employee:", error)
          toast({
            title: "Error",
            description: "Failed to fetch employee information",
            variant: "destructive"
          })
        }
      }
      fetchEmployee()
    }
  }, [employeeId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const handleSliderChange = (value) => {
    setFormData({
      ...formData,
      recommendation_score: value[0]
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create the recommendation data payload
      const recommendationData = {
        ...formData,
        employee_id: employeeId,
        employee_district: employee?.district,
        tmdrec20: formData.recommendation_score, // Set the manager recommendation score (out of 20)
        // Include details for notification
        notification_details: {
          send_notification: formData.notify_district_manager,
          district: employee?.district
        }
      }

      // In a real app, you would use an API call
      console.log("Submitting recommendation:", recommendationData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Show success message
      toast({
        title: isEdit ? "Recommendation Updated" : "Recommendation Created",
        description: `The recommendation was successfully ${isEdit ? "updated" : "created"}${
          formData.notify_district_manager 
            ? " and notification sent to district manager" 
            : ""
        }.`,
      })

      // Execute success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error submitting recommendation:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} recommendation. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Update Recommendation" : "Create Recommendation"}
        </CardTitle>
        <CardDescription>
          {isEdit ? "Modify the recommendation details below" : "Create a new recommendation for this employee"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recommendation_score" className="font-medium">Manager Recommendation Score (out of 20)</Label>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">0</span>
                <span className={`text-xl font-bold ${formData.recommendation_score < 10 ? 'text-red-500' : formData.recommendation_score < 15 ? 'text-amber-500' : 'text-green-600'}`}>
                  {formData.recommendation_score}
                </span>
                <span className="text-sm text-muted-foreground">20</span>
              </div>
              <Slider 
                defaultValue={[formData.recommendation_score]} 
                max={20} 
                step={0.5}
                onValueChange={handleSliderChange}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Your recommendation score carries 20% weight in the final promotion evaluation.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Recommendation Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter recommendation title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="performance">Performance Improvement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification">Justification for Recommendation Score</Label>
            <Textarea
              id="justification"
              name="justification"
              value={formData.justification}
              onChange={handleChange}
              placeholder="Provide justification for your recommendation score"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Comments</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide any additional details about the recommendation"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action_required">Action Required</Label>
            <Textarea
              id="action_required"
              name="action_required"
              value={formData.action_required}
              onChange={handleChange}
              placeholder="Describe the action required for this recommendation"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notify_district_manager"
              name="notify_district_manager"
              checked={formData.notify_district_manager}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="notify_district_manager" className="text-sm">
              Notify District Manager
            </Label>
          </div>

          {employee && (
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p className="font-medium">Employee Information</p>
              <p>Name: {employee.name}</p>
              <p>District: {employee.district}</p>
              <p>Position: {employee.position || "N/A"}</p>
              <p>Individual PMS: {employee.individual_pms}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-gold-500 hover:bg-gold-600">
            {loading ? "Processing..." : isEdit ? "Update Recommendation" : "Submit Recommendation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 