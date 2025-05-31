"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { VacanciesList } from "@/components/vacancies-list"
import { VacancyForm } from "@/components/vacancy-form"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Vacancy } from "@/types/vacancy" // Declare the Vacancy variable

export function VacanciesPage() {
  const [isAddingVacancy, setIsAddingVacancy] = useState(false)
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Mock data for departments
  const departments = ["IT", "Finance", "Operations", "HR", "Marketing", "Legal", "Customer Service", "Loans"]

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vacancy Management</h1>
            <p className="text-muted-foreground">Manage job vacancies at Brehan Bank.</p>
          </div>
          <Button onClick={() => setIsAddingVacancy(true)} className="md:w-auto w-full">
            <PlusIcon className="mr-2 h-4 w-4" /> Add Vacancy
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <Input
              placeholder="Search vacancies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
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
          </div>
          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <VacanciesList
          searchTerm={searchTerm}
          filterDepartment={filterDepartment}
          filterStatus={filterStatus}
          onEdit={setEditingVacancy}
        />

        <Sheet open={isAddingVacancy} onOpenChange={setIsAddingVacancy}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Vacancy</SheetTitle>
              <SheetDescription>Create a new job vacancy at Brehan Bank.</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <VacancyForm onSubmit={() => setIsAddingVacancy(false)} onCancel={() => setIsAddingVacancy(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={!!editingVacancy} onOpenChange={(open) => !open && setEditingVacancy(null)}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Vacancy</SheetTitle>
              <SheetDescription>Update vacancy information.</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {editingVacancy && (
                <VacancyForm
                  vacancy={editingVacancy}
                  onSubmit={() => setEditingVacancy(null)}
                  onCancel={() => setEditingVacancy(null)}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  )
}
