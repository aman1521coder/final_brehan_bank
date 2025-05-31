"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/components/users-list"

interface UserFormProps {
  user?: User
  onSubmit: () => void
  onCancel: () => void
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<Partial<User>>(
    user || {
      id: 0,
      name: "",
      email: "",
      role: "employee",
      department: "",
      status: "active",
      last_login: null,
      created_at: new Date().toISOString(),
      permissions: [],
      avatar_url: "/placeholder.svg?height=40&width=40",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => {
      const currentPermissions = prev.permissions || []
      if (checked) {
        return { ...prev, permissions: [...currentPermissions, permission] }
      } else {
        return { ...prev, permissions: currentPermissions.filter((p) => p !== permission) }
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting user data:", formData)
    // Here you would typically send the data to your API
    onSubmit()
  }

  // Mock data for departments
  const departments = [
    "Customer Service",
    "Loans",
    "Management",
    "IT",
    "Finance",
    "Operations",
    "Risk Management",
    "Compliance",
    "Marketing",
    "Human Resources",
  ]

  // Permission groups
  const permissionGroups = [
    {
      name: "Employees",
      permissions: ["employees.view", "employees.create", "employees.edit", "employees.delete"],
    },
    {
      name: "Applicants",
      permissions: ["applicants.view", "applicants.create", "applicants.edit", "applicants.delete"],
    },
    {
      name: "Vacancies",
      permissions: ["vacancies.view", "vacancies.create", "vacancies.edit", "vacancies.delete"],
    },
    {
      name: "Accounts",
      permissions: ["accounts.view", "accounts.create", "accounts.edit", "accounts.delete"],
    },
    {
      name: "Loans",
      permissions: ["loans.view", "loans.create", "loans.edit", "loans.delete"],
    },
    {
      name: "Reports",
      permissions: ["reports.view", "reports.create", "reports.export"],
    },
    {
      name: "Users",
      permissions: ["users.view", "users.create", "users.edit", "users.delete"],
    },
    {
      name: "Settings",
      permissions: ["settings.view", "settings.edit"],
    },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.avatar_url || "/placeholder.svg"} alt={formData.name} />
              <AvatarFallback>{formData.name ? formData.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                Change Avatar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role || "employee"}
                onValueChange={(value) => handleSelectChange("role", value as "admin" | "manager" | "hr" | "employee")}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department || ""}
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "active"}
                onValueChange={(value) => handleSelectChange("status", value as "active" | "inactive" | "locked")}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" onChange={handleChange} required={!user} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  onChange={handleChange}
                  required={!user}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 mt-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="all-permissions"
              checked={formData.permissions?.includes("all")}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFormData((prev) => ({ ...prev, permissions: ["all"] }))
                } else {
                  setFormData((prev) => ({ ...prev, permissions: [] }))
                }
              }}
            />
            <Label htmlFor="all-permissions" className="font-semibold">
              Grant All Permissions (Administrator)
            </Label>
          </div>

          {!formData.permissions?.includes("all") && (
            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div key={group.name} className="border rounded-md p-4">
                  <h3 className="font-semibold mb-2">{group.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={formData.permissions?.includes(permission)}
                          onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                        />
                        <Label htmlFor={permission}>{permission.split(".")[1]}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{user ? "Update User" : "Create User"}</Button>
      </div>
    </form>
  )
}
