"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ManagerSidebar } from "@/components/manager/manager-sidebar"
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar"

export function MobileManagerSidebar({ open, onOpenChange }) {
  return (
    <SidebarProvider>
      <MobileManagerSidebarContent open={open} onOpenChange={onOpenChange} />
    </SidebarProvider>
  )
}

function MobileManagerSidebarContent({ open, onOpenChange }) {
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
          <ManagerSidebar />
        </SheetContent>
      </Sheet>
    </>
  )
}
