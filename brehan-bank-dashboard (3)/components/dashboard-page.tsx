"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { AccountsOverview } from "@/components/accounts-overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { CustomerActivity } from "@/components/customer-activity"
import { FinancialMetrics } from "@/components/financial-metrics"

export function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <DashboardHeader date={date} setDate={setDate} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FinancialMetrics />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <AccountsOverview className="lg:col-span-3" />
          <CustomerActivity className="lg:col-span-4" />
        </div>
        <RecentTransactions />
      </div>
    </DashboardLayout>
  )
}
