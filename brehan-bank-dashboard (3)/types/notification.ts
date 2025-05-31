export interface Notification {
  id: string
  recipientRole: string
  recipientId?: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  employeeId?: string
  employeeName?: string
}
