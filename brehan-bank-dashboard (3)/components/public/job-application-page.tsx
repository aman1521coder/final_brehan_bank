"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { publicAPI, jobAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export function JobApplicationPage({ jobId, token }) {
  const router = useRouter()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    type: "external",
    current_position: "",
    current_department: "",
    experience_years: "",
    education_level: "",
    field_of_study: "",
    resume_url: "",
    cover_letter: "",
  })

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        let response

        // If we have a token, use the secure application endpoint
        if (token) {
          response = await publicAPI.getSecureApplicationForm(token)
        } else {
          // Otherwise, get the job details directly
          response = await jobAPI.getJobById(jobId)
        }

        setJob(response.data)
      } catch (error) {
        console.error("Error fetching job details:", error)
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId, token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const applicationData = {
        job_id: job.id,
        ...formData,
      }

      if (token) {
        // Use secure application endpoints if we have a token
        if (formData.type === "internal") {
          await publicAPI.submitSecureInternalApplication(token, applicationData)
        } else {
          await publicAPI.submitSecureExternalApplication(token, applicationData)
        }
      } else {
        // Otherwise use the public endpoints
        if (formData.type === "internal") {
          await publicAPI.applyInternal(applicationData)
        } else {
          await publicAPI.applyExternal(applicationData)
        }
      }

      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="card-header-gold">
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Please wait while we load the job details.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="card-header-gold">
            <CardTitle>Job Not Found</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>The job you are looking for does not exist or has been removed.</p>
            <Button className="mt-4 w-full bg-gold-500 hover:bg-gold-600" onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="card-header-gold">
            <CardTitle>Application Submitted</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              Thank you for your application to Brehan Bank. We have received your application for the position of{" "}
              {job.title}.
            </p>
            <p className="mt-4">
              We will review your application and contact you if you are selected for the next stage of the recruitment
              process.
            </p>
            <Button className="mt-6 w-full bg-gold-500 hover:bg-gold-600" onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-amber-800">Brehan Bank</h1>
          <h2 className="text-xl text-center mt-2 text-amber-600">Job Application</h2>
        </div>

        <Card className="border-gold-200">
          <CardHeader className="card-header-gold">
            <CardTitle>{job.title}</CardTitle>
            <CardDescription className="text-white/80">
              {job.department} | {job.location} | {job.job_type}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <p className="text-muted-foreground">{job.description}</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Qualifications</h3>
              <p className="text-muted-foreground">{job.qualifications}</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Application Deadline</h3>
              <p className="text-muted-foreground">{new Date(job.deadline).toLocaleDateString()}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
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
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Applicant Type</Label>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={(value) => handleSelectChange("type", value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="internal" id="internal" />
                        <Label htmlFor="internal">Internal (Current Employee)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="external" id="external" />
                        <Label htmlFor="external">External</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {formData.type === "internal" && (
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_position">Current Position</Label>
                      <Input
                        id="current_position"
                        name="current_position"
                        value={formData.current_position}
                        onChange={handleChange}
                        required={formData.type === "internal"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_department">Current Department</Label>
                      <Input
                        id="current_department"
                        name="current_department"
                        value={formData.current_department}
                        onChange={handleChange}
                        required={formData.type === "internal"}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Qualifications</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education_level">Educational Level</Label>
                    <Select
                      value={formData.education_level}
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
                      value={formData.field_of_study}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resume_url">Resume URL (Optional)</Label>
                    <Input
                      id="resume_url"
                      name="resume_url"
                      value={formData.resume_url}
                      onChange={handleChange}
                      placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_letter">Cover Letter</Label>
                <Textarea
                  id="cover_letter"
                  name="cover_letter"
                  value={formData.cover_letter}
                  onChange={handleChange}
                  placeholder="Tell us why you're interested in this position and why you would be a good fit..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/")} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gold-500 hover:bg-gold-600" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
