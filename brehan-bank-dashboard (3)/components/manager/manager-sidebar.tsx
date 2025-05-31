"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileSearch, LayoutDashboard, Settings, Users, UserPlus, Award } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  submenu?: {
    title: string
    href: string
  }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    href: "/manager/employees",
    icon: Users,
  },
  {
    title: "Recommendations",
    href: "/manager/recommendations",
    icon: Award,
  },
  {
    title: "Applicants",
    href: "/manager/applicants",
    icon: UserPlus,
    submenu: [
      {
        title: "Internal",
        href: "/manager/applicants/internal",
      },
      {
        title: "External",
        href: "/manager/applicants/external",
      },
    ],
  },
  {
    title: "Reports",
    href: "/manager/reports",
    icon: BarChart3,
  },
  {
    title: "Vacancies",
    href: "/manager/vacancies",
    icon: FileSearch,
  },
  {
    title: "Settings",
    href: "/manager/settings",
    icon: Settings,
  },
]

export function ManagerSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r sidebar-bg lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item) => (
              <div key={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-3 justify-start px-3 py-2 text-white/80 sidebar-item-hover w-full",
                    (pathname === item.href ||
                      (item.submenu && item.submenu.some((submenu) => pathname === submenu.href))) &&
                      "sidebar-item-active",
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>

                {item.submenu && item.submenu.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((submenu) => (
                      <Button
                        key={submenu.href}
                        variant="ghost"
                        className={cn(
                          "flex items-center justify-start px-3 py-1.5 text-sm text-white/70 sidebar-item-hover w-full",
                          pathname === submenu.href && "sidebar-item-active",
                        )}
                        asChild
                      >
                        <Link href={submenu.href}>{submenu.title}</Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
