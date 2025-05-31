"use client"

import { CardContent } from "@/components/ui/card"
import { DistrictEmployeesSimple } from "@/components/district/district-employees-simple"

export default function EmployeesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">District Employees</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <DistrictEmployeesSimple />
      </div>
    </div>
  )
} 