import { NextResponse } from "next/server"

// Mock employee data (shared with the manager API)
const employees = [
  {
    id: "101",
    full_name: "John Doe",
    new_position: "Senior Loan Officcder",
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

// PATCH /api/district/employees/:id/recommendation
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const data = await request.json()

  // Find the employee
  const employeeIndex = employees.findIndex((emp) => emp.id === id)

  if (employeeIndex === -1) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  // Update the employee's Dis Rec 15%
  employees[employeeIndex].disrec15 = data.disrec15.toString()

  // Calculate total score
  const indpms25 = Number.parseFloat(employees[employeeIndex].indpms25)
  const totalexp20 = Number.parseFloat(employees[employeeIndex].totalexp20)
  const tmdrec20 = Number.parseFloat(employees[employeeIndex].tmdrec20)
  const disrec15 = Number.parseFloat(employees[employeeIndex].disrec15)

  const totalScore = indpms25 + totalexp20 + tmdrec20 + disrec15
  employees[employeeIndex].total_score = totalScore.toFixed(2)

  return NextResponse.json(employees[employeeIndex])
}
