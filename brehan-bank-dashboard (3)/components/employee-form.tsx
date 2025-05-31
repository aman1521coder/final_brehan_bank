"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Employee } from "@/components/employees-list"

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: () => void
  onCancel: () => void
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState<Partial<Employee>>(
    employee || {
      id: 0,
      file_number: "",
      full_name: "",
      sex: "",
      employment_date: new Date().toISOString().split("T")[0],
      individual_pms: "",
      last_dop: "",
      job_grade: "",
      new_salary: "",
      job_category: "",
      new_position: "",
      branch: "",
      department: "",
      district: "",
      twin_branch: "",
      region: "",
      field_of_study: "",
      educational_level: "",
      cluster: "",
      indpms25: "",
      totalexp20: "",
      totalexp: "",
      relatedexp: "",
      expafterpromo: "",
      tmdrec20: "",
      disrec15: "",
      total: "",
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
    console.log("Submitting employee data:", formData)
    // Here you would typically send the data to your API
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="job">Job</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file_number">File Number</Label>
              <Input id="file_number" name="file_number" value={formData.file_number || ""} onChange={handleChange} />
            </div>
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
              <Label htmlFor="sex">Gender</Label>
              <Select value={formData.sex || ""} onValueChange={(value) => handleSelectChange("sex", value)}>
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employment_date">Employment Date</Label>
              <Input
                id="employment_date"
                name="employment_date"
                type="date"
                value={formData.employment_date || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_dop">Last Date of Promotion</Label>
              <Input
                id="last_dop"
                name="last_dop"
                type="date"
                value={formData.last_dop || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="educational_level">Educational Level</Label>
              <Select
                value={formData.educational_level || ""}
                onValueChange={(value) => handleSelectChange("educational_level", value)}
              >
                <SelectTrigger id="educational_level">
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
        </TabsContent>

        <TabsContent value="job" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_grade">Job Grade</Label>
              <Input id="job_grade" name="job_grade" value={formData.job_grade || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_category">Job Category</Label>
              <Input
                id="job_category"
                name="job_category"
                value={formData.job_category || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_position">Current Position</Label>
              <Input
                id="new_position"
                name="new_position"
                value={formData.new_position || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_salary">Salary</Label>
              <Input
                id="new_salary"
                name="new_salary"
                type="number"
                value={formData.new_salary || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" value={formData.department || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="individual_pms">Individual PMS</Label>
              <Input
                id="individual_pms"
                name="individual_pms"
                type="number"
                min="0"
                max="100"
                value={formData.individual_pms || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" name="branch" value={formData.branch || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input id="district" name="district" value={formData.district || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input id="region" name="region" value={formData.region || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twin_branch">Twin Branch</Label>
              <Input id="twin_branch" name="twin_branch" value={formData.twin_branch || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cluster">Cluster</Label>
              <Input id="cluster" name="cluster" value={formData.cluster || ""} onChange={handleChange} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="indpms25">Individual PMS (25%)</Label>
              <Input
                id="indpms25"
                name="indpms25"
                type="number"
                min="0"
                max="25"
                value={formData.indpms25 || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalexp">Total Experience (Years)</Label>
              <Input
                id="totalexp"
                name="totalexp"
                type="number"
                min="0"
                value={formData.totalexp || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalexp20">Total Experience (20%)</Label>
              <Input
                id="totalexp20"
                name="totalexp20"
                type="number"
                min="0"
                max="20"
                value={formData.totalexp20 || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relatedexp">Related Experience (Years)</Label>
              <Input
                id="relatedexp"
                name="relatedexp"
                type="number"
                min="0"
                value={formData.relatedexp || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expafterpromo">Experience After Promotion (Years)</Label>
              <Input
                id="expafterpromo"
                name="expafterpromo"
                type="number"
                min="0"
                value={formData.expafterpromo || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tmdrec20">Manager Recommendation (20%)</Label>
              <Input
                id="tmdrec20"
                name="tmdrec20"
                type="number"
                min="0"
                max="20"
                value={formData.tmdrec20 || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disrec15">District Recommendation (15%)</Label>
              <Input
                id="disrec15"
                name="disrec15"
                type="number"
                min="0"
                max="15"
                value={formData.disrec15 || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Total Score</Label>
              <Input
                id="total"
                name="total"
                type="number"
                min="0"
                max="100"
                value={formData.total || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{employee ? "Update Employee" : "Add Employee"}</Button>
      </div>
    </form>
  )
}
