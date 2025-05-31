"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UsersList } from "@/components/users-list"
import { UserForm } from "@/components/user-form"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/types/user" // Declare the User variable

export function UsersPage() {
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage system users and their access permissions.</p>
          </div>
          <Button onClick={() => setIsAddingUser(true)} className="md:w-auto w-full">
            <PlusIcon className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <UsersList
          searchTerm={searchTerm}
          filterRole={filterRole}
          filterStatus={filterStatus}
          onEdit={setEditingUser}
        />

        <Sheet open={isAddingUser} onOpenChange={setIsAddingUser}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New User</SheetTitle>
              <SheetDescription>Create a new system user with appropriate permissions.</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <UserForm onSubmit={() => setIsAddingUser(false)} onCancel={() => setIsAddingUser(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit User</SheetTitle>
              <SheetDescription>Update user information and permissions.</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {editingUser && (
                <UserForm
                  user={editingUser}
                  onSubmit={() => setEditingUser(null)}
                  onCancel={() => setEditingUser(null)}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  )
}
