"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Briefcase, MapPin, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterJobType, setFilterJobType] = useState("all")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        // Use the public jobs endpoint
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/public/jobs`
        )
        // Filter only active jobs
        const activeJobs = response.data.filter(job => job.status === "active")
        setJobs(activeJobs)
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No deadline"
    return new Date(dateString).toLocaleDateString()
  }

  // Get unique departments for filter
  const departments = Array.from(new Set(jobs.map((job) => job.department)))
  
  // Get unique job types for filter
  const jobTypes = Array.from(new Set(jobs.map((job) => job.job_type)))

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDepartment = filterDepartment === "all" || job.department === filterDepartment
    const matchesJobType = filterJobType === "all" || job.job_type === filterJobType

    return matchesSearch && matchesDepartment && matchesJobType
  })

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gold-800 mb-4">Careers at Brehan Bank</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our team and be part of a leading financial institution dedicated to excellence and innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
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
          <Select value={filterJobType} onValueChange={setFilterJobType}>
            <SelectTrigger>
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Types</SelectItem>
              {jobTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No Jobs Found</h2>
            <p className="text-muted-foreground">
              There are no jobs matching your search criteria. Please try a different search or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="bg-gold-50">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {job.department}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Deadline: {formatDate(job.deadline)}
                    </div>
                    <Badge className="self-start mt-1">{job.job_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2 border-t pt-4">
                  <Button 
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Link href={`/apply/type/internal/${job.id}`}>
                      Internal Application
                    </Link>
                  </Button>
                  <Button 
                    asChild
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    <Link href={`/apply/type/external/${job.id}`}>
                      External Application
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 