export interface Application {
  id: string
  job_id: string
  full_name: string
  email: string
  phone: string
  type: "internal" | "external"
  current_position?: string
  current_department?: string
  experience_years: string
  education_level: string
  field_of_study: string
  resume_url?: string
  cover_letter: string
  status: string
  created_at: string
}
