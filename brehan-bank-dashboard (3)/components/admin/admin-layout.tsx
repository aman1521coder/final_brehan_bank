"use client"

import type React from "react"

import { useState } from "react"
import { BanknoteIcon as BanknotesIcon } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { UserNav } from "@/components/user-nav"
import { MobileAdminSidebar } from "@/components/admin/mobile-admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthCheck } from "@/components/auth-check"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthCheck requiredRole="admin">
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-gold-500 px-4 text-white md:px-6">
            <MobileAdminSidebar />
            <div className="flex items-center gap-2 font-semibold">
              <BanknotesIcon className="h-6 w-6" />
              <span className="hidden md:inline">Brehan Bank - Admin Portal</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <UserNav />
            </div>
          </header>
          <div className="flex flex-1">
            <AdminSidebar />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthCheck>
  )
}
