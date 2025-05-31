"use client"

import { useState } from "react"
import { ManagerLayout } from "@/components/manager/manager-layout"
import { ManagerExternalApplicantsList } from "@/components/manager/external-applicants-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ManagerExternalApplicantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterJob, setFilterJob] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  return (
    <ManagerLayout>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold tracking-tight">External Applicants</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Applicants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job">Filter by Job</Label>
                <Select value={filterJob} onValueChange={setFilterJob}>
                  <SelectTrigger id="job">
                    <SelectValue placeholder="Select Job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="1">Branch Manager</SelectItem>
                    <SelectItem value="2">Loan Officer</SelectItem>
                    <SelectItem value="3">Customer Service Representative</SelectItem>
                    <SelectItem value="4">Financial Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="interviewed">Interviewed</TabsTrigger>
            <TabsTrigger value="hired">Hired</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <ManagerExternalApplicantsList status="all" searchTerm={searchTerm} filterJob={filterJob} />
          </TabsContent>
          <TabsContent value="pending">
            <ManagerExternalApplicantsList status="pending" searchTerm={searchTerm} filterJob={filterJob} />
          </TabsContent>
          <TabsContent value="shortlisted">
            <ManagerExternalApplicantsList status="shortlisted" searchTerm={searchTerm} filterJob={filterJob} />
          </TabsContent>
          <TabsContent value="interviewed">
            <ManagerExternalApplicantsList status="interviewed" searchTerm={searchTerm} filterJob={filterJob} />
          </TabsContent>
          <TabsContent value="hired">
            <ManagerExternalApplicantsList status="hired" searchTerm={searchTerm} filterJob={filterJob} />
          </TabsContent>
          <TabsContent value="rejected">
            <ManagerExternalApplicantsList status="rejected" searchTerm={searchTerm} filterJob={filterJob} />
          </TabsContent>
        </Tabs>
      </div>
    </ManagerLayout>
  )
}
