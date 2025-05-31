"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { Vacancy } from "@/components/vacancies-list"

interface VacancyFormProps {
  vacancy?: Vacancy
  onSubmit: () => void
  onCancel: () => void
}

export function VacancyForm({ vacancy, onSubmit, onCancel }: VacancyFormProps) {
  const [formData, setFormData] = useState<Partial<Vacancy>>(
    vacancy || {
      id: 0,
      title: "",
      department: "",
      location: "",
      position_type: "full-time",
      experience_level: "",
      education_required: "",
      salary_range: "",
      posting_date: new Date().toISOString().split("T")[0],
      closing_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
      status: "draft",
      description: "",
      requirements: "",
      responsibilities: "",
      benefits: "",
      application_count: 0,
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting vacancy data:", formData)
    // Here you would typically send the data to your API
    onSubmit()
  }

  // Mock data for departments
  const departments = [
    "Customer Service",
    "Loans",
    "Management",
    "IT",
    "Finance",
    "Operations",
    "Risk Management",
    "Compliance",
    "Marketing",
    "Human Resources",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" value={formData.title || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department || ""}
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position_type">Position Type</Label>
              <Select
                value={formData.position_type || "full-time"}
                onValueChange={(value) =>
                  handleSelectChange("position_type", value as "full-time" | "part-time" | "contract" | "temporary")
                }
              >
                <SelectTrigger id="position_type">
                  <SelectValue placeholder="Select position type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="posting_date">Posting Date</Label>
              <Input
                id="posting_date"
                name="posting_date"
                type="date"
                value={formData.posting_date || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing_date">Closing Date</Label>
              <Input
                id="closing_date"
                name="closing_date"
                type="date"
                value={formData.closing_date || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "draft"}
                onValueChange={(value) => handleSelectChange("status", value as "open" | "closed" | "draft")}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Input
                id="experience_level"
                name="experience_level"
                value={formData.experience_level || ""}
                onChange={handleChange}
                placeholder="e.g., 3-5 years"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education_required">Education Required</Label>
              <Input
                id="education_required"
                name="education_required"
                value={formData.education_required || ""}
                onChange={handleChange}
                placeholder="e.g., Bachelor's Degree in Finance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                name="salary_range"
                value={formData.salary_range || ""}
                onChange={handleChange}
                placeholder="e.g., $50,000 - $65,000"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="description" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Provide a detailed description of the job..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements || ""}
                onChange={handleChange}
                rows={4}
                placeholder="List the requirements for this position..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities || ""}
                onChange={handleChange}
                rows={4}
                placeholder="List the responsibilities for this position..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                name="benefits"
                value={formData.benefits || ""}
                onChange={handleChange}
                rows={4}
                placeholder="List the benefits offered with this position..."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{vacancy ? "Update Vacancy" : "Create Vacancy"}</Button>
      </div>
    </form>
  )
}
