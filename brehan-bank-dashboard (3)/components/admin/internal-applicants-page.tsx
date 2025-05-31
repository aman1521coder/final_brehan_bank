"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCcw } from "lucide-react"
import { InternalApplicantsList } from "@/components/admin/internal-applicants-list"
import { jobAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InternalApplicant {
  id: string
  job_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  current_position: string
  department: string
  branch: string
  years_of_experience: number
  education_level: string
  field_of_study: string
  resume_url?: string
  cover_letter: string
  status: string
  created_at: string
  matched_employee_id?: string
}

interface Job {
  id: string
  title: string
  department: string
  location: string
  status: string
}

export function InternalApplicantsPage() {
  const [applicants, setApplicants] = useState<InternalApplicant[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<InternalApplicant[]>([])
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
      const response = await jobAPI.getAllInternalApplications()
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
          applicant.current_position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.department.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredApplicants(filtered)
  }

  const handleMatchApplicant = async (applicantId: string, employeeId: string) => {
    try {
      await jobAPI.matchInternalApplicantWithEmployee(applicantId, { employeeId })
      toast({
        title: "Success",
        description: "Applicant matched with employee successfully",
      })
      fetchApplicants() // Refresh the list
    } catch (error) {
      console.error("Error matching applicant:", error)
      toast({
        title: "Error",
        description: "Failed to match applicant with employee. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Internal Applicants</h1>
            <p className="text-muted-foreground">Manage and match internal job applicants with employees</p>
          </div>
          <Button onClick={fetchApplicants} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filter Applicants</CardTitle>
            <CardDescription>Search and filter internal applicants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, position..."
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
            <TabsTrigger value="matched">Matched</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <InternalApplicantsList
              applicants={filteredApplicants}
              isLoading={isLoading}
              onMatchApplicant={handleMatchApplicant}
              jobs={jobs}
            />
          </TabsContent>

          <TabsContent value="pending">
            <InternalApplicantsList
              applicants={filteredApplicants.filter((a) => a.status === "pending")}
              isLoading={isLoading}
              onMatchApplicant={handleMatchApplicant}
              jobs={jobs}
            />
          </TabsContent>

          <TabsContent value="matched">
            <InternalApplicantsList
              applicants={filteredApplicants.filter((a) => a.status === "matched")}
              isLoading={isLoading}
              onMatchApplicant={handleMatchApplicant}
              jobs={jobs}
            />
          </TabsContent>

          <TabsContent value="rejected">
            <InternalApplicantsList
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
