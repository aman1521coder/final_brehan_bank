"use client"

import { useState, useEffect } from "react"
import { JobApplicationForm } from "@/components/public/job-application-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { jobAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import axios from "axios"

export default function ApplyForJobPage({ params }: { params: { type: string; id: string } }) {
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Validate application type
  const applicationType = params.type === "internal" || params.type === "external" 
    ? params.type 
    : null

  useEffect(() => {
    // Validate application type
    if (!applicationType) {
      setError("Invalid application type. Must be 'internal' or 'external'.")
      setLoading(false)
      return
    }
    
    const fetchJobDetails = async () => {
      try {
        setLoading(true)
        // Use the public job endpoint for retrieving job details
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/public/jobs/${params.id}`
        )
        setJob(response.data)
      } catch (error) {
        console.error("Failed to fetch job details:", error)
        if (error.response?.status === 400) {
          // Handle deadline passed or job not active
          setError(error.response.data.error || "This job is no longer available for applications.")
        } else {
          setError("Failed to load job details. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [params.id, applicationType])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="bg-gold-500 text-white">
            <Skeleton className="h-8 w-64 bg-white/20" />
          </CardHeader>
          <CardContent className="pt-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !applicationType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-gold-500 text-white">
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-6">{error || "Invalid application type. Must be 'internal' or 'external'."}</p>
            <Button asChild className="w-full bg-gold-500 hover:bg-gold-600">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-gold-500 text-white">
            <CardTitle>Job Not Found</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>The job you are looking for does not exist or has been removed.</p>
            <Button asChild className="mt-4 w-full bg-gold-500 hover:bg-gold-600">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 py-8">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="bg-gold-500 text-white">
            <CardTitle className="text-xl md:text-2xl">
              {applicationType === "internal" ? "Internal Application" : "External Application"}: {job.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <JobApplicationForm 
              job={job} 
              applicationType={applicationType}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 