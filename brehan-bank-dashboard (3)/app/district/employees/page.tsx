import EmployeesPage from "@/components/district/employees-page-fixed"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "District Employees",
  description: "View and manage employees in your district.",
}

export default function DistrictEmployeesPage() {
  return <EmployeesPage />
}
