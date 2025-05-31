"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/context/notification-context"
import { useRouter } from "next/navigation"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, getNotificationsForRole } = useNotifications()
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserRole(user.role || "")
          console.log("Current user role:", user.role)
        } catch (e) {
          console.error("Error parsing user from localStorage:", e)
        }
      }
    }
  }, [])

  // Get notifications for the current user's role
  const userNotifications = userRole ? getNotificationsForRole(userRole) : []
  
  // Add special handling for district role variants
  const isDistrictRole = userRole === 'district_manager' || userRole === 'district';
  const isManagerRole = userRole === 'manager';
  
  // Filter notifications for managers that need attention
  const pendingRecommendationNotifications = userNotifications.filter(n => 
    !n.read && 
    ((n.title && n.title.includes("Manager Recommendation") && n.message && n.message.includes("TMD Rec")) ||
     (n.message && n.message.includes("disrec15") && isManagerRole))
  );
  
  // Debug logging
  useEffect(() => {
    if (userRole) {
      console.log(`${userRole} notifications:`, userNotifications);
      if (isManagerRole && pendingRecommendationNotifications.length > 0) {
        console.log("Has pending recommendation notifications:", pendingRecommendationNotifications.length);
      }
    }
  }, [userRole, userNotifications, isManagerRole, pendingRecommendationNotifications]);

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    markAsRead(notification.id)

    // Navigate based on notification type and user role
    if (notification.employeeId) {
      if (isDistrictRole) {
        console.log("Navigating to district employee page:", notification.employeeId);
        router.push(`/district/employees/${notification.employeeId}`);
      } else if (isManagerRole) {
        console.log("Navigating to manager employee recommendation:", notification.employeeId);
        router.push(`/manager/employees/${notification.employeeId}`);
      } else {
        router.push(`/employees/${notification.employeeId}`);
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          
          {/* Special indicator for manager's district recommendation notifications */}
          {isManagerRole && pendingRecommendationNotifications.length > 0 && (
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {userNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          userNotifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="cursor-pointer p-4 flex flex-col items-start gap-1"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between w-full">
                <span className="font-medium">{notification.title}</span>
                {!notification.read && (
                  <Badge variant={
                    notification.title && notification.title.includes("Recommendation") 
                      ? "destructive" 
                      : "default"
                  } className="ml-2">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
              <span className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</span>
            </DropdownMenuItem>
          ))
        )}

        {userNotifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-center text-primary"
              onClick={() => router.push("/notifications")}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
