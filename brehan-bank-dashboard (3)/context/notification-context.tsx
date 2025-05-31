"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
  employeeId?: number
  employeeName?: string
  recipientRole?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  getNotificationsForRole: (role: string) => Notification[]
  generateTestNotifications: (role: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications")
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications))
      } catch (error) {
        console.error("Error parsing notifications from localStorage:", error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const addNotification = (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const getNotificationsForRole = (role: string) => {
    return notifications.filter((notification) => !notification.recipientRole || notification.recipientRole === role)
  }

  // Function to generate test notifications for debugging
  const generateTestNotifications = (role: string) => {
    // Clear existing notifications first
    clearNotifications();
    
    if (role === 'manager') {
      // Create TMD recommendations
      addNotification({
        title: "Manager Recommendation Required",
        message: "Employee #1234 (John Smith) requires TMD Rec score update",
        type: "warning",
        employeeId: 1234,
        employeeName: "John Smith",
        recipientRole: "manager"
      });
      
      // Create district recommendations that need manager attention
      addNotification({
        title: "District Recommendation Update",
        message: "Employee #5678 (Jane Doe) needs disrec15 score review",
        type: "warning",
        employeeId: 5678,
        employeeName: "Jane Doe",
        recipientRole: "manager"
      });
    } 
    else if (role === 'district' || role === 'district_manager') {
      addNotification({
        title: "Employee Update Required",
        message: "Employee #8901 (Bob Johnson) needs performance review",
        type: "info",
        employeeId: 8901,
        employeeName: "Bob Johnson",
        recipientRole: "district"
      });
    }
    else if (role === 'admin') {
      addNotification({
        title: "System Notification",
        message: "Monthly employee data import completed successfully",
        type: "success",
        recipientRole: "admin"
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        getNotificationsForRole,
        generateTestNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
