"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RecentEmployeeUpdatesProps {
  className?: string
}

export function RecentEmployeeUpdates({ className }: RecentEmployeeUpdatesProps) {
  // Mock data for recent updates
  const recentUpdates = [
    {
      id: 1,
      employee: "John Doe",
      action: "Recommendation Submitted",
      timestamp: "2023-06-10T14:30:00",
      score: "18.5/20",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      employee: "Emily Davis",
      action: "Recommendation Submitted",
      timestamp: "2023-06-09T11:15:00",
      score: "17.0/20",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      employee: "Michael Wilson",
      action: "Recommendation Submitted",
      timestamp: "2023-06-08T16:45:00",
      score: "19.0/20",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      employee: "Sarah Johnson",
      action: "Recommendation Submitted",
      timestamp: "2023-06-07T09:30:00",
      score: "16.5/20",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 5,
      employee: "Robert Brown",
      action: "Recommendation Submitted",
      timestamp: "2023-06-06T13:20:00",
      score: "18.0/20",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card className={className}>
      <CardHeader className="card-header-gold">
        <CardTitle>Recent Recommendations</CardTitle>
        <CardDescription className="text-white/80">Your recently submitted employee recommendations</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {recentUpdates.map((update) => (
            <div key={update.id} className="flex items-center">
              <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src={update.avatar || "/placeholder.svg"} alt={update.employee} />
                <AvatarFallback>{update.employee.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{update.employee}</p>
                  <span className="text-sm font-semibold text-gold-600">{update.score}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{update.action}</span>
                  <span>{formatDate(update.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
