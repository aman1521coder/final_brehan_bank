import { ArrowDownIcon, ArrowUpIcon, DollarSign, Users, CreditCard, BarChart } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const metrics = [
  {
    title: "Total Revenue",
    value: "$45,231,890",
    change: "+20.1%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Active Accounts",
    value: "12,234",
    change: "+10.3%",
    icon: Users,
    trend: "up",
  },
  {
    title: "Active Cards",
    value: "8,492",
    change: "+5.7%",
    icon: CreditCard,
    trend: "up",
  },
  {
    title: "Loan Applications",
    value: "621",
    change: "-3.2%",
    icon: BarChart,
    trend: "down",
  },
]

export function FinancialMetrics() {
  return (
    <>
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={cn("inline-flex items-center", metric.trend === "up" ? "text-emerald-600" : "text-rose-600")}
              >
                {metric.trend === "up" ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {metric.change}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
