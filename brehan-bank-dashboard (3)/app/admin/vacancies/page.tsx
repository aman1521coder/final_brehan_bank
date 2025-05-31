"use client"

import { useEffect } from "react"
import { AdminVacanciesPage } from "@/components/admin/vacancies-page"
import { useRouter } from "next/navigation"

export default function VacanciesPage() {
  const router = useRouter()
  
  // Check authentication on component mount
  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    
    // If no token or user is not admin, redirect to login
    if (!token) {
      console.error("No authentication token found")
      router.push("/login")
      return
    }
    
    try {
      // Parse user data to check role
      const userData = user ? JSON.parse(user) : null
      if (!userData || userData.role !== "admin") {
        console.error("User is not an admin")
        router.push("/login")
        return
      }
      
      console.log("User authenticated as admin, rendering vacancies page")
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    }
  }, [router])
  
  return <AdminVacanciesPage />
}
