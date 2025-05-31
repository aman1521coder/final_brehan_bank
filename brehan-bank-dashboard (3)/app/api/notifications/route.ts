import { NextResponse } from "next/server"

// Mock notifications data
let notifications = [
  {
    id: "1",
    type: "recommendation",
    title: "New Manager Recommendation",
    message: "Manager has updated TMD Rec 20% for John Doe. Please review and update District Rec 15%.",
    employeeId: "101",
    employeeName: "John Doe",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "recommendation",
    title: "New Manager Recommendation",
    message: "Manager has updated TMD Rec 20% for Jane Smith. Please review and update District Rec 15%.",
    employeeId: "102",
    employeeName: "Jane Smith",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
]

// GET /api/notifications
export async function GET() {
  // In a real app, you would filter notifications based on the authenticated user
  return NextResponse.json(notifications)
}

// POST /api/notifications
export async function POST(request: Request) {
  const data = await request.json()

  const newNotification = {
    id: Date.now().toString(),
    type: data.type,
    title: data.title,
    message: data.message,
    employeeId: data.employeeId,
    employeeName: data.employeeName,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  notifications.unshift(newNotification)

  return NextResponse.json(newNotification, { status: 201 })
}

// PATCH /api/notifications/:id/read
export async function PATCH(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname

  if (path.endsWith("/read-all")) {
    notifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }))
    return NextResponse.json({ success: true })
  }

  const id = path.split("/")[3]

  const notificationIndex = notifications.findIndex((n) => n.id === id)

  if (notificationIndex === -1) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  }

  notifications[notificationIndex].isRead = true

  return NextResponse.json(notifications[notificationIndex])
}
