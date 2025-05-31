export interface User {
  id: string
  name: string
  email: string
  username: string
  password?: string
  role: string
  status: string
  created_at: string
  last_login: string | null
  district?: string
  branch?: string
  avatar_url?: string
}
