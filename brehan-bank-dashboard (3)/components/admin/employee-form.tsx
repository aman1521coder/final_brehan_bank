"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EmployeeData } from "@/lib/api"
import { DialogFooter } from "@/components/ui/dialog"

interface EmployeeFormProps {
  employee?: EmployeeData
  onSubmit: (data: EmployeeData) => void
}

export function EmployeeForm({ employee, onSubmit }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeData>({
    file_number: "",
    full_name: "",
    sex: "Male",
    employment_date: "",
    doe: "",
    individual_pms: 0,
    last_dop: "",
    job_grade: "",
    new_salary: 0,
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
    indpms25: 0,
    totalexp20: 0,
    totalexp: 0,
    relatedexp: 0,
    expafterpromo: 0,
    tmdrec20: 0,
    disrec15: 0,
    total: 0,
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
      })
    }
  }, [employee])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let parsedValue: string | number = value

    // Convert numeric fields to numbers
    if (
      [
        "individual_pms",
        "new_salary",
        "indpms25",
        "totalexp20",
        "totalexp",
        "relatedexp",
        "expafterpromo",
        "tmdrec20",
        "disrec15",
        "total",
      ].includes(name)
    ) {
      parsedValue = value === "" ? 0 : Number.parseFloat(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const calculateTotal = () => {
    // Calculate total score based on the components
    const indpms25 = formData.indpms25 || 0
    const totalexp20 = formData.totalexp20 || 0
    const tmdrec20 = formData.tmdrec20 || 0
    const disrec15 = formData.disrec15 || 0

    const total = indpms25 + totalexp20 + tmdrec20 + disrec15

    setFormData((prev) => ({
      ...prev,
      total,
    }))
  }

  useEffect(() => {
    calculateTotal()
  }, [formData.indpms25, formData.totalexp20, formData.tmdrec20, formData.disrec15])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="personal">
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="job">Job Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file_number">File Number *</Label>
              <Input
                id="file_number"
                name="file_number"
                value={formData.file_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Gender *</Label>
              <Select value={formData.sex} onValueChange={(value) => handleSelectChange("sex", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_date">Employment Date *</Label>
              <Input
                id="employment_date"
                name="employment_date"
                type="date"
                value={formData.employment_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="educational_level">Educational Level</Label>
              <Input
                id="educational_level"
                name="educational_level"
                value={formData.educational_level || ""}
                onChange={handleChange}
              />
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

        <TabsContent value="job" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="job_grade">Job Grade</Label>
              <Input id="job_grade" name="job_grade" value={formData.job_grade || ""} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_position">Position</Label>
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
              <Label htmlFor="doe">Date of Exit</Label>
              <Input id="doe" name="doe" type="date" value={formData.doe || ""} onChange={handleChange} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

        <TabsContent value="evaluation" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="individual_pms">Individual PMS</Label>
              <Input
                id="individual_pms"
                name="individual_pms"
                type="number"
                value={formData.individual_pms || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indpms25">Individual PMS (25%)</Label>
              <Input
                id="indpms25"
                name="indpms25"
                type="number"
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
                value={formData.totalexp20 || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relatedexp">Related Experience</Label>
              <Input
                id="relatedexp"
                name="relatedexp"
                type="number"
                value={formData.relatedexp || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expafterpromo">Experience After Promotion</Label>
              <Input
                id="expafterpromo"
                name="expafterpromo"
                type="number"
                value={formData.expafterpromo || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmdrec20">TMD Recommendation (20%)</Label>
              <Input
                id="tmdrec20"
                name="tmdrec20"
                type="number"
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
                value={formData.disrec15 || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total Score</Label>
              <Input id="total" name="total" type="number" value={formData.total || ""} readOnly className="bg-muted" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button type="submit">{employee ? "Update Employee" : "Create Employee"}</Button>
      </DialogFooter>
    </form>
  )
}
