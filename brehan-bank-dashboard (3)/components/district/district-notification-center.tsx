"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { notificationAPI } from "@/lib/district-functions" // Updated import path
import type { Notification } from "@/types/notification"
import { useRouter } from "next/navigation"
import { Bell, CheckCircle } from "lucide-react"

export function DistrictNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await notificationAPI.getNotifications()

      // Filter for recommendation update notifications
      const recommendationNotifications = response.data.filter(
        (notification: Notification) => notification.type === "recommendation_update",
      )

      setNotifications(recommendationNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleViewEmployee = async (notification: Notification) => {
    if (notification.employeeId) {
      // Mark as read
      await handleMarkAsRead(notification.id)

      // Navigate to employee page
      router.push(`/district/employees/${notification.employeeId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Recommendations</CardTitle>
          <CardDescription>Employees requiring district recommendation updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const unreadNotifications = notifications.filter((notification) => !notification.read)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Pending Recommendations
              {unreadNotifications.length > 0 && <Badge variant="destructive">{unreadNotifications.length}</Badge>}
            </CardTitle>
            <CardDescription>Employees requiring district recommendation updates</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>No pending recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  !notification.read ? "bg-muted/50 border-primary/50" : "bg-background"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{notification.employeeName}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleViewEmployee(notification)}>
                    Update
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
