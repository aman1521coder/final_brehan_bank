"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DistrictSidebar } from "@/components/district/district-sidebar"
import { MobileDistrictSidebar } from "@/components/district/mobile-district-sidebar"
import { useSidebar } from "@/context/sidebar-context"
import { NotificationBell } from "@/components/notifications/notification-bell"
import Cookies from 'js-cookie'
import { Loader2 } from "lucide-react"
import axios from "axios"
import { makeDistrictApiCall } from "@/lib/district-functions"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function DistrictLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOpen, setIsOpen } = useSidebar()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication for district manager role
    const checkAuth = async () => {
      try {
        console.log("Checking auth for district manager...");
        
        // Check that we have a token and user data with district
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem("token");
          const userStr = localStorage.getItem("user");
          
          // First check if token exists
          if (!token) {
            console.error("No token found for district manager");
            router.push("/login");
            return false;
          }
          
          // Check for user data
          if (!userStr) {
            console.error("No user data found");
            router.push("/login");
            return false;
          }
          
          // Parse user data
          const user = JSON.parse(userStr);
          console.log("District manager user data:", user);
          
          // Essential district check - This is critical for district managers
          if ((user.role === 'district_manager' || user.role === 'district') && !user.district) {
            console.error("District manager missing district information - redirecting to login");
            
            // Store a message to show on login page
            localStorage.setItem("authError", "Please select your district when logging in as district manager");
            
            // Save current path to redirect back after login
            sessionStorage.setItem("redirectAfterLogin", "/district/dashboard");
            
            // Clear any previous login attempts
            localStorage.setItem("loginAttempts", "0");
            
            // Redirect to login page
            router.push("/login");
            return false;
          }
          
          // Log district information if available
          if (user.district) {
            console.log("District manager for district:", user.district);
          } else {
            console.warn("User has no district assigned"); 
          }
          
          // Check if user has district role
          const isDistrictRole = user.role === "district_manager" || user.role === "district" || user.role === "admin";
          
          if (!isDistrictRole) {
            console.error("User does not have district manager role:", user.role);
            router.push("/login");
            return false;
          }
          
          console.log("Authentication successful for district manager");
          
          // Get clean token for validation (without Bearer prefix if present)
          const cleanToken = token.startsWith('Bearer ') ? token.substring(7).trim() : token;
          
          // Verify token is in correct format (JWT tokens should have 3 parts separated by dots)
          if (!cleanToken.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
            console.error("Token format appears invalid");
            console.error("Raw token:", token);
            console.error("Clean token:", cleanToken);
            
            // Try fallback to bearer_token
            const bearerToken = localStorage.getItem("bearer_token");
            if (bearerToken && bearerToken.startsWith('Bearer ')) {
              const fallbackCleanToken = bearerToken.substring(7).trim();
              if (fallbackCleanToken.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
                console.log("Found valid token in bearer_token, using that instead");
                // Update the token to use the valid one
                localStorage.setItem("token", fallbackCleanToken);
                // Continue with authentication
              } else {
                router.push("/login");
                return false;
              }
            } else {
              router.push("/login");
              return false;
            }
          }
          
          // Make sure token is also in cookie for middleware
          const cookieToken = Cookies.get("token");
          if (!cookieToken) {
            console.log("Setting token in cookie");
            Cookies.set("token", token, { path: "/" });
          }
          
          // Test the token with the backend directly
          try {
            // Make a test request to see if the token is valid
            // Ensure token has bearer prefix for API calls
            const apiToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            console.log("Testing token with API - token format:", apiToken.substring(0, 15) + "...");
            
            // Use the special district API helper with validateStatus
            const response = await makeDistrictApiCall(`/api/district/employees`, {
              method: 'GET',
              headers: {
                'Authorization': apiToken
              },
              validateStatus: function (status: number) {
                return status < 500; // Only treat 500+ as errors to see what's happening
              }
            });
            
            console.log("Auth test response status:", response.status);
            
            if (response.status === 401) {
              console.error("Token validation failed - 401 Unauthorized");
              console.error("Response data:", response.data);
              
              // Check if we've been in a redirect loop
              const loginAttempts = parseInt(localStorage.getItem("loginAttempts") || "0");
              if (loginAttempts > 2) {
                console.error("Detected login loop - redirecting to auth test page");
                localStorage.setItem("loginAttempts", "0");
                router.push("/auth-test");
                return false;
              }
              
              // Increment login attempts
              localStorage.setItem("loginAttempts", (loginAttempts + 1).toString());
              console.log("Login attempts:", loginAttempts + 1);
              
              // Clear tokens and redirect to login
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              Cookies.remove("token");
              router.push("/login");
              return false;
            }
            
            // Reset login attempts on successful auth
            localStorage.setItem("loginAttempts", "0");
            
            // If we get here with 200, token is working
            return true;
          } catch (apiError: any) {
            // Only redirect to login if clearly an auth issue
            console.error("API test error:", apiError.message);
            
            // For server errors or network issues, still let the user see the page
            console.warn("API test failed with error, but we'll proceed anyway:", apiError.message);
            return true;
          }
        } else {
          console.error("Window not defined (server-side rendering)");
          return false;
        }
      } catch (error) {
        console.error("Error checking district authentication:", error);
        router.push("/login");
        return false;
      }
    };
    
    checkAuth().then(authStatus => {
      setIsAuthenticated(authStatus);
      setIsLoading(false);
    });
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2">Authenticating...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b bg-background">
        <div className="flex h-16 items-center px-4 justify-between bg-accent/10">
          <MobileDistrictSidebar open={isOpen} onOpenChange={setIsOpen} />
          <div className="flex items-center gap-2">
            <NotificationBell />
            {/* Add profile dropdown here if needed */}
          </div>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="hidden border-r bg-muted/40 lg:block">
          <DistrictSidebar />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
} 