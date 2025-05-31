"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AdminApplicantsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("internal")

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "internal") {
      router.push("/admin/applicants/internal")
    } else if (value === "external") {
      router.push("/admin/applicants/external")
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Applicants Management</h1>
            <p className="text-muted-foreground">View and manage job applicants</p>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="internal">Internal Applicants</TabsTrigger>
            <TabsTrigger value="external">External Applicants</TabsTrigger>
          </TabsList>

          <TabsContent value="internal" className="mt-6">
            <div className="flex justify-center items-center p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Internal Applicants</h3>
                <p className="text-muted-foreground mb-4">View and manage applications from current employees</p>
                <Button onClick={() => router.push("/admin/applicants/internal")}>View Internal Applicants</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="external" className="mt-6">
            <div className="flex justify-center items-center p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">External Applicants</h3>
                <p className="text-muted-foreground mb-4">View and manage applications from external candidates</p>
                <Button onClick={() => router.push("/admin/applicants/external")}>View External Applicants</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
