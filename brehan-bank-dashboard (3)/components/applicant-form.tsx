"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Applicant } from "@/components/applicants-list"

interface ApplicantFormProps {
  applicant?: Applicant
  onSubmit: () => void
  onCancel: () => void
}

export function ApplicantForm({ applicant, onSubmit, onCancel }: ApplicantFormProps) {
  const [formData, setFormData] = useState<Partial<Applicant>>(
    applicant || {
      id: 0,
      full_name: "",
      email: "",
      phone: "",
      position_applied: "",
      department: "",
      application_date: new Date().toISOString().split("T")[0],
      status: "pending",
      type: "external",
      experience_years: 0,
      education_level: "",
      field_of_study: "",
      resume_url: "",
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
    console.log("Submitting applicant data:", formData)
    // Here you would typically send the data to your API
    onSubmit()
  }

  // Mock data for positions and departments
  const positions = [
    "Teller",
    "Loan Officer",
    "Branch Manager",
    "Customer Service Representative",
    "IT Specialist",
    "Financial Analyst",
    "Risk Manager",
    "Compliance Officer",
    "Marketing Specialist",
    "HR Specialist",
  ]

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
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={formData.phone || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Applicant Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value as "internal" | "external")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="internal" />
                  <Label htmlFor="internal">Internal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="external" id="external" />
                  <Label htmlFor="external">External</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                min="0"
                value={formData.experience_years || 0}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education_level">Educational Level</Label>
              <Select
                value={formData.education_level || ""}
                onValueChange={(value) => handleSelectChange("education_level", value)}
              >
                <SelectTrigger id="education_level">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
                  <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Input
                id="field_of_study"
                name="field_of_study"
                value={formData.field_of_study || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {formData.type === "internal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="current_position">Current Position</Label>
                <Input
                  id="current_position"
                  name="current_position"
                  value={formData.current_position || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_department">Current Department</Label>
                <Input
                  id="current_department"
                  name="current_department"
                  value={formData.current_department || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="application" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position_applied">Position Applied</Label>
              <Select
                value={formData.position_applied || ""}
                onValueChange={(value) => handleSelectChange("position_applied", value)}
              >
                <SelectTrigger id="position_applied">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="application_date">Application Date</Label>
              <Input
                id="application_date"
                name="application_date"
                type="date"
                value={formData.application_date || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Application Status</Label>
              <Select
                value={formData.status || "pending"}
                onValueChange={(value) => handleSelectChange("status", value as Applicant["status"])}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="resume_url">Resume URL</Label>
              <Input id="resume_url" name="resume_url" value={formData.resume_url || ""} onChange={handleChange} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview_date">Interview Date</Label>
              <Input
                id="interview_date"
                name="interview_date"
                type="date"
                value={formData.interview_date || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interview_score">Interview Score</Label>
              <Input
                id="interview_score"
                name="interview_score"
                type="number"
                min="0"
                max="100"
                value={formData.interview_score || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes || ""}
                onChange={handleChange}
                placeholder="Enter any notes about the applicant..."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{applicant ? "Update Applicant" : "Add Applicant"}</Button>
      </div>
    </form>
  )
}
