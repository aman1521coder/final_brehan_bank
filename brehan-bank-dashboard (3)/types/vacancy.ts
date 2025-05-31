export interface Vacancy {
  id: number
  title: string
  department: string
  location: string
  position_type: "full-time" | "part-time" | "contract" | "temporary"
  experience_level: string
  education_required: string
  salary_range: string
  posting_date: string
  closing_date: string
  status: "open" | "closed" | "draft"
  description: string
  requirements: string
  responsibilities: string
  benefits: string
  application_count: number
}
