"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BanknoteIcon as BanknotesIcon } from "lucide-react"
import { DistrictSidebar } from "@/components/district/district-sidebar"
import { UserNav } from "@/components/user-nav"
import { MobileDistrictSidebar } from "@/components/district/mobile-district-sidebar"

export function DistrictLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in and is a district manager
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.role === "district_manager") {
          setUser(parsedUser)
        } else {
          // If not a district manager, redirect to appropriate dashboard
          router.push("/auth-redirect")
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        router.push("/login")
      }
    } else {
      router.push("/login")
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-800 mb-4">Access Denied</h1>
          <p className="text-amber-600 mb-4">You do not have permission to access this page.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-gold-500 px-4 text-white md:px-6">
        <MobileDistrictSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className="flex items-center gap-2 font-semibold">
          <BanknotesIcon className="h-6 w-6" />
          <span className="hidden md:inline">Brehan Bank - District Manager Portal</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <UserNav />
        </div>
      </header>
      <div className="flex flex-1">
        <DistrictSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
