"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { EmployeeData } from "@/lib/api"
import { DistrictRecommendationForm } from "./district-recommendation-form"

interface DistrictRecommendationModalProps {
  employee: EmployeeData
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DistrictRecommendationModal({ 
  employee, 
  open, 
  onOpenChange,
  onSuccess 
}: DistrictRecommendationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>District Recommendation</DialogTitle>
        </DialogHeader>
        <DistrictRecommendationForm employee={employee} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
} 