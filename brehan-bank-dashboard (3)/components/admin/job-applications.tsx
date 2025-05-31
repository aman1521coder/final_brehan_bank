"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { jobAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ArrowLeft, Download, Eye, Mail, Phone } from "lucide-react"
import { format } from "date-fns"

interface Job {
  id: string
  title: string
  department: string
  location: string
  status: 'active' | 'pending' | 'closed'
}

interface Applicant {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  position?: string
  department?: string
  education?: string
  experience: number
  matched_employee?: boolean
  resume_url?: string
  created_at: string
}

interface Applications {
  internal_applications: Applicant[]
  external_applications: Applicant[]
}

export function JobApplicationsPage({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Applications>({
    internal_applications: [],
    external_applications: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("internal")

  // Fetch job and application data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get job details
        const jobResponse = await jobAPI.getJobById(jobId)
        setJob(jobResponse.data)
        
        // Get applications
        const applicationsResponse = await jobAPI.getApplicationsForJob(jobId)
        setApplications(applicationsResponse.data)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load job applications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [jobId])

  // Format date helper
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "MMM d, yyyy")
  }

  // Loading skeleton
  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  // If job is not found
  if (!job) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                <p className="text-muted-foreground mb-6">The job you're looking for does not exist or has been removed.</p>
                <Button asChild className="bg-gold-500 hover:bg-gold-600">
                  <Link href="/admin/vacancies">Return to Vacancies</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  // Get applicants based on active tab
  const applicants = activeTab === "internal" 
    ? applications.internal_applications || [] 
    : applications.external_applications || []

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/jobs/${jobId}`}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Job
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{job.title} - Applications</h1>
            <p className="text-muted-foreground">
              {job.department} • {job.location}
            </p>
          </div>
          <div>
            <Badge className={
              job.status === "active" 
                ? "bg-green-600" 
                : job.status === "closed" 
                  ? "bg-gray-600" 
                  : "bg-amber-600"
            }>
              {job.status}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <Tabs defaultValue="internal" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="internal">
                  Internal Applications ({applications.internal_applications?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="external">
                  External Applications ({applications.external_applications?.length || 0})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {applicants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No {activeTab} applications found for this job.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    {activeTab === "internal" && (
                      <>
                        <TableHead>Current Position</TableHead>
                        <TableHead>Department</TableHead>
                      </>
                    )}
                    <TableHead>Education</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Date Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">
                        {applicant.first_name} {applicant.last_name}
                        {activeTab === "internal" && applicant.matched_employee && (
                          <Badge className="ml-2 bg-blue-500">Employee Match</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" /> {applicant.email}
                          </span>
                          <span className="flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" /> {applicant.phone}
                          </span>
                        </div>
                      </TableCell>
                      {activeTab === "internal" && (
                        <>
                          <TableCell>{applicant.position || "N/A"}</TableCell>
                          <TableCell>{applicant.department || "N/A"}</TableCell>
                        </>
                      )}
                      <TableCell>{applicant.education || "N/A"}</TableCell>
                      <TableCell>{applicant.experience} years</TableCell>
                      <TableCell>{formatDate(applicant.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          {applicant.resume_url && (
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                              <a href={applicant.resume_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download Resume</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
} 