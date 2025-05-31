"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function AuthCheck({ 
  children, 
  requiredRole = null 
}: { 
  children: React.ReactNode, 
  requiredRole?: string | null 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true)
      
      // Check if token exists in localStorage
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")
      
      if (!token || !userStr) {
        console.error("No authentication token or user data found")
        router.push("/login")
        return
      }
      
      // Validate token format (basic check)
      try {
        const parts = token.split('.')
        if (parts.length !== 3) {
          console.error("Invalid token format")
          router.push("/login")
          return
        }
        
        // Check if role matches required role
        if (requiredRole) {
          const userData = JSON.parse(userStr)
          if (userData.role !== requiredRole) {
            console.error(`Required role: ${requiredRole}, User role: ${userData.role}`)
            router.push("/login")
            return
          }
        }
        
        // If we get here, user is authenticated
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error validating authentication:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router, requiredRole])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Verifying authentication...</p>
        </div>
      </div>
    )
  }
  
  return isAuthenticated ? <>{children}</> : null
} 