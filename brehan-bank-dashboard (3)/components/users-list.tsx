"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Eye, Edit, Key, Lock, Unlock, UserX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Define the User type
export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "manager" | "hr" | "employee"
  department: string
  status: "active" | "inactive" | "locked"
  last_login: string | null
  created_at: string
  permissions: string[]
  avatar_url?: string
}

// Mock data for users
const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@brehanbank.com",
    role: "admin",
    department: "IT",
    status: "active",
    last_login: "2023-05-15T10:30:00",
    created_at: "2022-01-10T09:00:00",
    permissions: ["all"],
    avatar_url: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@brehanbank.com",
    role: "hr",
    department: "Human Resources",
    status: "active",
    last_login: "2023-05-14T14:45:00",
    created_at: "2022-02-15T11:30:00",
    permissions: [
      "employees.view",
      "employees.edit",
      "applicants.view",
      "applicants.edit",
      "vacancies.view",
      "vacancies.edit",
    ],
    avatar_url: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.johnson@brehanbank.com",
    role: "manager",
    department: "Loans",
    status: "active",
    last_login: "2023-05-15T08:15:00",
    created_at: "2022-03-20T10:15:00",
    permissions: [
      "employees.view",
      "applicants.view",
      "vacancies.view",
      "accounts.view",
      "accounts.edit",
      "loans.view",
      "loans.edit",
    ],
    avatar_url: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@brehanbank.com",
    role: "employee",
    department: "Customer Service",
    status: "locked",
    last_login: "2023-05-01T09:30:00",
    created_at: "2022-04-05T13:45:00",
    permissions: ["accounts.view"],
    avatar_url: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Michael Wilson",
    email: "michael.wilson@brehanbank.com",
    role: "employee",
    department: "Finance",
    status: "inactive",
    last_login: null,
    created_at: "2022-05-12T15:20:00",
    permissions: ["accounts.view", "reports.view"],
    avatar_url: "/placeholder.svg?height=40&width=40",
  },
]

interface UsersListProps {
  searchTerm: string
  filterRole: string
  filterStatus: string
  onEdit: (user: User) => void
}

export function UsersList({ searchTerm, filterRole, filterStatus, onEdit }: UsersListProps) {
  const [viewingUser, setViewingUser] = useState<User | null>(null)

  // Filter users based on search term and filters
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  // Helper function to get status badge variant
  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return { variant: "default" as const, label: "Active" }
      case "inactive":
        return { variant: "secondary" as const, label: "Inactive" }
      case "locked":
        return { variant: "destructive" as const, label: "Locked" }
    }
  }

  // Helper function to get role badge variant
  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return { variant: "default" as const, label: "Admin" }
      case "manager":
        return { variant: "outline" as const, label: "Manager" }
      case "hr":
        return { variant: "secondary" as const, label: "HR" }
      case "employee":
        return { variant: "outline" as const, label: "Employee" }
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const statusBadge = getStatusBadge(user.status)
                  const roleBadge = getRoleBadge(user.role)
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.last_login)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setViewingUser(user)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="mr-2 h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "locked" ? (
                              <DropdownMenuItem>
                                <Unlock className="mr-2 h-4 w-4 text-green-500" /> Unlock Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <Lock className="mr-2 h-4 w-4 text-amber-500" /> Lock Account
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <UserX className="mr-2 h-4 w-4 text-red-500" /> Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Comprehensive information about the user.</DialogDescription>
          </DialogHeader>

          {viewingUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={viewingUser.avatar_url || "/placeholder.svg"} alt={viewingUser.name} />
                    <AvatarFallback>{viewingUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{viewingUser.name}</h3>
                    <p className="text-muted-foreground">{viewingUser.email}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">User Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant={getRoleBadge(viewingUser.role).variant}>
                      {getRoleBadge(viewingUser.role).label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Department:</span>
                    <span>{viewingUser.department}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={getStatusBadge(viewingUser.status).variant}>
                      {getStatusBadge(viewingUser.status).label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(viewingUser.created_at)}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Last Login:</span>
                    <span>{formatDate(viewingUser.last_login)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Permissions</h3>
                {viewingUser.permissions.includes("all") ? (
                  <p className="text-muted-foreground">This user has full administrative access to all features.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {viewingUser.permissions.map((permission) => (
                      <div key={permission} className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {permission}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
