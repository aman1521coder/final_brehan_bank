"use client"

import { useState } from "react"
import { ManagerLayout } from "@/components/manager/manager-layout"
import { PendingRecommendations } from "@/components/manager/pending-recommendations"
import { RecentEmployeeUpdates } from "@/components/manager/recent-employee-updates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Users, FileCheck, UserCheck, UserPlus } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function ManagerDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <ManagerLayout>
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gold-800">Manager Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your manager portal at Brehan Bank.</p>
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
              <CardTitle className="text-sm font-medium">Pending Recommendations</CardTitle>
              <FileCheck className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Employees awaiting your recommendation</p>
            </CardContent>
          </Card>
          <Card className="border-gold-200">
            <CardHeader className="card-header-gold">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">Employees under your management</p>
            </CardContent>
          </Card>
          <Card className="border-gold-200">
            <CardHeader className="card-header-gold">
              <CardTitle className="text-sm font-medium">Internal Applicants</CardTitle>
              <UserCheck className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Internal candidates for open positions</p>
            </CardContent>
          </Card>
          <Card className="border-gold-200">
            <CardHeader className="card-header-gold">
              <CardTitle className="text-sm font-medium">External Applicants</CardTitle>
              <UserPlus className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">External candidates for open positions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <PendingRecommendations className="lg:col-span-4" />
          <RecentEmployeeUpdates className="lg:col-span-3" />
        </div>
      </div>
    </ManagerLayout>
  )
}
