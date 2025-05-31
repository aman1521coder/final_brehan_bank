"use client"

import { useState } from "react"
import { ManagerLayout } from "@/components/manager/manager-layout"
import { ManagerApplicantsList } from "@/components/manager/manager-applicants-list"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ManagerApplicantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPosition, setFilterPosition] = useState("all")
  const [applicantType, setApplicantType] = useState("all")

  // Mock data for positions
  const positions = [
    "Teller",
    "Loan Officer",
    "Branch Manager",
    "Customer Service",
    "IT Specialist",
    "Financial Analyst",
  ]

  return (
    <ManagerLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gold-800">Applicant Management</h1>
            <p className="text-muted-foreground">Review and manage job applicants for Brehan Bank positions.</p>
          </div>
        </div>

        <Tabs defaultValue="all" value={applicantType} onValueChange={setApplicantType} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Applicants</TabsTrigger>
            <TabsTrigger value="internal">Internal</TabsTrigger>
            <TabsTrigger value="external">External</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterPosition} onValueChange={setFilterPosition}>
            <SelectTrigger>
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ManagerApplicantsList type={applicantType} searchTerm={searchTerm} filterPosition={filterPosition} />
      </div>
    </ManagerLayout>
  )
}
