export interface Applicant {
  id: number
  full_name: string
  email: string
  phone: string
  position_applied: string
  department: string
  application_date: string
  status: "pending" | "shortlisted" | "interviewed" | "offered" | "rejected" | "hired"
  type: "internal" | "external"
  current_position?: string
  current_department?: string
  experience_years: number
  education_level: string
  field_of_study: string
  resume_url: string
  interview_score?: string
  interview_date?: string
  notes?: string
}
