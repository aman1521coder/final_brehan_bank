"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar"

export function MobileAdminSidebar() {
  return (
    <SidebarProvider>
      <MobileAdminSidebarContent />
    </SidebarProvider>
  )
}

function MobileAdminSidebarContent() {
  const { openMobile, setOpenMobile } = useSidebar()
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden" 
        onClick={() => setOpenMobile(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent 
          side="left" 
          className="p-0"
        >
          <AdminSidebar />
        </SheetContent>
      </Sheet>
    </>
  )
}
