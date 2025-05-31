"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { PlusIcon, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { jobAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Job } from "@/types/job"

export function AdminVacanciesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [vacancies, setVacancies] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        console.log("Fetching jobs...")
        
        // Check if token exists
        const token = localStorage.getItem('token')
        console.log("Auth token exists:", !!token)
        
        const response = await jobAPI.getAllJobs()
        console.log("Jobs API response:", response)
        setVacancies(response.data || [])
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
        // Check for specific error types
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response data:", error.response.data)
          console.error("Error response status:", error.response.status)
          console.error("Error response headers:", error.response.headers)
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", error.message)
        }
        
        toast({
          title: "Error",
          description: "Failed to load vacancies. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Filter vacancies based on search term and filters
  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch =
      vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = filterDepartment === "all" || vacancy.department === filterDepartment
    const matchesStatus = filterStatus === "all" || vacancy.status === filterStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>
      case "closed":
        return <Badge variant="secondary">Closed</Badge>
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Get unique departments for filter
  const departments = Array.from(new Set(vacancies.map((vacancy) => vacancy.department)))

  // Function to manually test API connection
  const testApiConnection = async () => {
    try {
      // Get auth token
      const token = localStorage.getItem('token');
      console.log("Auth token:", token ? token.substring(0, 20) + "..." : "No token");
      
      // Make direct fetch request to bypass axios
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/admin/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Raw fetch response status:", response.status);
      console.log("Response headers:", response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        setVacancies(data);
        toast({
          title: "Success",
          description: `Loaded ${data.length} vacancies successfully`,
        });
      } else {
        const text = await response.text();
        console.error("Error response:", text);
        toast({
          title: "API Error",
          description: `Status: ${response.status}, ${text}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-4 p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gold-800">Vacancy Management</h1>
              <p className="text-muted-foreground">Create and manage job vacancies at Brehan Bank.</p>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gold-800">Vacancy Management</h1>
            <p className="text-muted-foreground">Create and manage job vacancies at Brehan Bank.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={testApiConnection}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              Debug Connection
            </Button>
            <Button asChild className="bg-gold-500 hover:bg-gold-600">
              <Link href="/admin/vacancies/create">
                <PlusIcon className="mr-2 h-4 w-4" /> Create Vacancy
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vacancies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8"
            />
          </div>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVacancies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No vacancies found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVacancies.map((vacancy) => (
                    <TableRow key={vacancy.id}>
                      <TableCell className="font-medium">{vacancy.title}</TableCell>
                      <TableCell>{vacancy.department}</TableCell>
                      <TableCell>{vacancy.location}</TableCell>
                      <TableCell>{vacancy.job_type}</TableCell>
                      <TableCell>{formatDate(vacancy.created_at)}</TableCell>
                      <TableCell>{formatDate(vacancy.deadline)}</TableCell>
                      <TableCell>{getStatusBadge(vacancy.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-blue-600 border-blue-300"
                            asChild
                          >
                            <Link href={`/admin/jobs/${vacancy.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-gold-600 border-gold-300"
                            asChild
                          >
                            <Link href={`/admin/jobs/${vacancy.id}/applications`}>
                              Applications
                            </Link>
                          </Button>
                          <div className="flex-col space-y-1 ml-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 border-green-300 text-xs h-7"
                              asChild
                            >
                              <Link href={`/apply/type/internal/${vacancy.id}`} target="_blank">
                                Internal Apply
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-amber-600 border-amber-300 text-xs h-7"
                              asChild
                            >
                              <Link href={`/apply/type/external/${vacancy.id}`} target="_blank">
                                External Apply
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
