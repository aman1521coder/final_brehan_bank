"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCcw } from "lucide-react"
import { ExternalApplicantsList } from "@/components/admin/external-applicants-list"
import { jobAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExternalApplicant {
  id: string
  job_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  years_of_experience: number
  education_level: string
  field_of_study: string
  resume_url?: string
  cover_letter: string
  status: string
  created_at: string
}

interface Job {
  id: string
  title: string
  department: string
  location: string
  status: string
}

export function ExternalApplicantsPage() {
  const [applicants, setApplicants] = useState<ExternalApplicant[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<ExternalApplicant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJobId, setSelectedJobId] = useState<string>("all")
  const [jobs, setJobs] = useState<Job[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchJobs()
    fetchApplicants()
  }, [])

  useEffect(() => {
    filterApplicants()
  }, [searchQuery, selectedJobId, applicants])

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAllJobs()
      setJobs(response.data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchApplicants = async () => {
    setIsLoading(true)
    try {
      const response = await jobAPI.getAllExternalApplications()
      setApplicants(response.data)
      setFilteredApplicants(response.data)
    } catch (error) {
      console.error("Error fetching applicants:", error)
      toast({
        title: "Error",
        description: "Failed to fetch applicants. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplicants = () => {
    let filtered = [...applicants]

    // Filter by job ID
    if (selectedJobId !== "all") {
      filtered = filtered.filter((applicant) => applicant.job_id === selectedJobId)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (applicant) =>
          `${applicant.first_name} ${applicant.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.field_of_study.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredApplicants(filtered)
  }

  const handleMatchApplicant = async (applicantId: string, data: any) => {
    try {
      await jobAPI.matchApplicationDirectly(applicantId, data)
      toast({
        title: "Success",
        description: "Applicant matched successfully",
      })
      fetchApplicants() // Refresh the list
    } catch (error) {
      console.error("Error matching applicant:", error)
      toast({
        title: "Error",
        description: "Failed to match applicant. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">External Applicants</h1>
            <p className="text-muted-foreground">Manage external job applicants</p>
          </div>
          <Button onClick={fetchApplicants} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filter Applicants</CardTitle>
            <CardDescription>Search and filter external applicants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, field of study..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Applicants</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ExternalApplicantsList
              applicants={filteredApplicants}
              isLoading={isLoading}
              onMatchApplicant={handleMatchApplicant}
              jobs={jobs}
            />
          </TabsContent>

          <TabsContent value="pending">
            <ExternalApplicantsList
              applicants={filteredApplicants.filter((a) => a.status === "pending")}
              isLoading={isLoading}
              onMatchApplicant={handleMatchApplicant}
              jobs={jobs}
            />
          </TabsContent>

          <TabsContent value="shortlisted">
            <ExternalApplicantsList
              applicants={filteredApplicants.filter((a) => a.status === "shortlisted")}
              isLoading={isLoading}
              onMatchApplicant={handleMatchApplicant}
              jobs={jobs}
            />
          </TabsContent>

          <TabsContent value="rejected">
            <ExternalApplicantsList
              applicants={filteredApplicants.filter((a) => a.status === "rejected")}
              isLoading={isLoading}
              onMatchApplicant={handleMatchApplicant}
              jobs={jobs}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
