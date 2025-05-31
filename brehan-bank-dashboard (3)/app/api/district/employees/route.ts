import { NextResponse } from "next/server"

// Mock employee data (shared with other APIs)
const employees = [
  {
    id: "101",
    full_name: "John Doe",
    new_position: "Senior Loan Officer",
    department: "Loans",
    branch: "Main Branch",
    district: "Central",
    individual_pms: "85",
    indpms25: "21.25",
    totalexp: "8",
    totalexp20: "16",
    tmdrec20: "18",
    disrec15: "",
    total_score: "",
    status: "active",
  },
  {
    id: "102",
    full_name: "Jane Smith",
    new_position: "Customer Service Manager",
    department: "Customer Service",
    branch: "Downtown Branch",
    district: "East",
    individual_pms: "90",
    indpms25: "22.5",
    totalexp: "6",
    totalexp20: "12",
    tmdrec20: "17",
    disrec15: "",
    total_score: "",
    status: "active",
  },
]

// GET /api/district/employees
export async function GET() {
  // In a real app, you would filter employees based on the district manager's district
  return NextResponse.json(employees)
}
