"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { PlusIcon, SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { UsersList } from "@/components/admin/users-list"
import { CreateUserForm } from "@/components/admin/create-user-form"
import { EditUserForm } from "@/components/admin/edit-user-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { userAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import type { User } from "@/types/user"

export function AdminUserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getAllUsers()
      setUsers(response.data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: Omit<User, "id">) => {
    try {
      await userAPI.createuser(userData)
      toast({
        title: "Success",
        description: "User created successfully",
      })
      setIsCreateUserOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Failed to create user:", error)
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      await userAPI.updateUser(id, userData)
      toast({
        title: "Success",
        description: "User updated successfully",
      })
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      await userAPI.deleteUser(id)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Create and manage system users with different roles.</p>
          </div>
          <Button onClick={() => setIsCreateUserOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create User
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="district_manager">District Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <UsersList users={filteredUsers} loading={loading} onEdit={setEditingUser} onDelete={handleDeleteUser} />
          </CardContent>
        </Card>

        {/* Create User Sheet */}
        <Sheet open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New User</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <CreateUserForm onSubmit={handleCreateUser} onCancel={() => setIsCreateUserOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Edit User Sheet */}
        <Sheet open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit User</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {editingUser && (
                <EditUserForm
                  user={editingUser}
                  onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
                  onCancel={() => setEditingUser(null)}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  )
}
