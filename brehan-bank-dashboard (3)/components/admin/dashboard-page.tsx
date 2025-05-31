"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Users, FileCheck, Briefcase, FileText } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function AdminDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gold-800">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome to the admin portal at Brehan Bank.</p>
          </div>
          <div className="mt-4 flex items-center gap-2 md:mt-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gold-200">
            <CardHeader className="card-header-gold">
              <CardTitle className="text-sm font-medium">Active Vacancies</CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Open job positions</p>
            </CardContent>
          </Card>
          <Card className="border-gold-200">
            <CardHeader className="card-header-gold">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">Across all branches</p>
            </CardContent>
          </Card>
          <Card className="border-gold-200">
            <CardHeader className="card-header-gold">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileCheck className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">Awaiting manager recommendations</p>
            </CardContent>
          </Card>
          <Card className="border-gold-200">
            <CardHeader className="card-header-gold">
              <CardTitle className="text-sm font-medium">New Applicants</CardTitle>
              <Briefcase className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">In the last 7 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-gold-200">
            <CardHeader className="card-header-gold">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Button asChild className="bg-gold-500 hover:bg-gold-600">
                  <Link href="/admin/vacancies/create">Create New Vacancy</Link>
                </Button>
                <Button asChild className="bg-gold-500 hover:bg-gold-600">
                  <Link href="/admin/employees">Manage Employees</Link>
                </Button>
                <Button asChild className="bg-gold-500 hover:bg-gold-600">
                  <Link href="/admin/applicants">View Applicants</Link>
                </Button>
                <Button asChild className="bg-gold-500 hover:bg-gold-600">
                  <Link href="/admin/reports">Generate Reports</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-200">
            <CardHeader className="card-header-gold">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">New Vacancy Created</p>
                    <p className="text-sm text-muted-foreground">Senior Loan Officer</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Employee Recommendation Updated</p>
                    <p className="text-sm text-muted-foreground">By Manager: John Smith</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">New Applicant</p>
                    <p className="text-sm text-muted-foreground">For: IT Specialist</p>
                  </div>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">District Review Completed</p>
                    <p className="text-sm text-muted-foreground">For: 5 employees</p>
                  </div>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
