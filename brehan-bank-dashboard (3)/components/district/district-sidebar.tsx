"use client"

import type React from "react"
import { useEffect } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, LayoutDashboard, Settings, Users, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
  description?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/district/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    href: "/district/employees",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/district/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/district/settings",
    icon: Settings,
  },
  {
    title: "Emergency Bypass",
    href: "/district/employees/emergency",
    icon: AlertTriangle,
    className: "text-red-600 hover:text-red-700",
    description: "View employees without API"
  },
  {
    title: "Emergency Direct",
    href: "/district/employees/emergency-direct",
    icon: AlertTriangle,
    className: "text-red-700 hover:text-red-800 font-bold",
    description: "Simple employee list"
  },
  {
    title: "Simple Employees",
    href: "/district/employees/simple", 
    icon: AlertTriangle,
    className: "text-green-700 hover:text-green-800 font-bold",
    description: "Direct API access"
  },
]

export function DistrictSidebar() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("District sidebar mounting - checking auth state...");
      
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Token found in sidebar:", token.substring(0, 15) + "...");
        
        // Check for token in cookie
        const hasCookie = document.cookie.includes("token=");
        if (!hasCookie) {
          console.log("Token missing from cookie, setting it now");
          document.cookie = `token=${token};path=/;max-age=${60*60*24*7}`;
        }
        
        // Force making a simple fetch request to debug CORS
        console.log("Making direct fetch test for district employees");
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/district/employees`;
        
        fetch(apiUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "include"
        })
        .then(response => {
          console.log("Direct fetch response:", response.status);
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch");
          }
        })
        .then(data => {
          console.log("Fetch succeeded with data:", data);
        })
        .catch(error => {
          console.error("Direct fetch failed:", error.message);
        });
      } else {
        console.warn("No token found in district sidebar initialization");
      }
    }
  }, []);

  return (
    <div className="hidden border-r sidebar-bg lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "flex items-center gap-3 justify-start px-3 py-2 text-white/80 sidebar-item-hover",
                  pathname === item.href && "sidebar-item-active",
                )}
                asChild
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    "hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent" : "transparent",
                    item.className
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                  {item.description && (
                    <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
                  )}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
