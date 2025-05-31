"use client"

import { EmployeesPage } from "@/components/employees-page"
import { NotificationProvider } from "@/context/notification-context"

export default function Employees() {
  return (
    <NotificationProvider>
      <EmployeesPage />
    </NotificationProvider>
  )
}
