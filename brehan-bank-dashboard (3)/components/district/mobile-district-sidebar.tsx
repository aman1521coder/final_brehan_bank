"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Building2, LayoutDashboard, Users, Award } from "lucide-react"

interface MobileDistrictSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileDistrictSidebar({ open, onOpenChange }: MobileDistrictSidebarProps) {
  const items = [
    {
      title: "Dashboard",
      href: "/district/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Employees",
      href: "/district/employees",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Recommendations",
      href: "/district/recommendations",
      icon: <Award className="h-5 w-5" />,
    },
    {
      title: "Branch Management",
      href: "/district/branches",
      icon: <Building2 className="h-5 w-5" />,
    }
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>District Management</SheetTitle>
        </SheetHeader>
        <div className="pt-8">
          <SidebarNav items={items} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
