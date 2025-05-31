"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import type { EmployeeData } from "@/lib/api"

interface EmployeeRecPopupProps {
  employee: EmployeeData
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeRecPopup({ 
  employee,
  open,
  onOpenChange
}: EmployeeRecPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Provide TMD Recommendation</h2>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm mt-4">
            You are providing a TMD recommendation for{" "}
            {employee.full_name} (ID: {employee.id}, File #: {employee.file_number})
          </p>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 