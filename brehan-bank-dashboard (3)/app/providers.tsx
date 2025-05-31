"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { NotificationProvider } from "@/context/notification-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <NotificationProvider>
        <SidebarProvider>
          {children}
          <Toaster />
        </SidebarProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}
