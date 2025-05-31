"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ApplicantsList } from "@/components/applicants-list"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApplicantForm } from "@/components/applicant-form"
import type { Applicant } from "@/types/applicant" // Declare the Applicant variable

export function ApplicantsPage() {
  const [isAddingApplicant, setIsAddingApplicant] = useState(false)
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPosition, setFilterPosition] = useState("all") // Update default value to non-empty string
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
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Applicant Management</h1>
            <p className="text-muted-foreground">Manage job applicants for Brehan Bank positions.</p>
          </div>
          <Button onClick={() => setIsAddingApplicant(true)} className="md:w-auto w-full">
            <PlusIcon className="mr-2 h-4 w-4" /> Add Applicant
          </Button>
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

        <ApplicantsList
          type={applicantType}
          searchTerm={searchTerm}
          filterPosition={filterPosition}
          onEdit={setEditingApplicant}
        />

        <Sheet open={isAddingApplicant} onOpenChange={setIsAddingApplicant}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Applicant</SheetTitle>
              <SheetDescription>Add a new job applicant to the Brehan Bank system.</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <ApplicantForm
                onSubmit={() => setIsAddingApplicant(false)}
                onCancel={() => setIsAddingApplicant(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={!!editingApplicant} onOpenChange={(open) => !open && setEditingApplicant(null)}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Applicant</SheetTitle>
              <SheetDescription>Update applicant information in the Brehan Bank system.</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {editingApplicant && (
                <ApplicantForm
                  applicant={editingApplicant}
                  onSubmit={() => setEditingApplicant(null)}
                  onCancel={() => setEditingApplicant(null)}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  )
}
