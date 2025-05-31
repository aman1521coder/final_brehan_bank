import { NextRequest, NextResponse } from 'next/server';

// Sample data - for demonstration purposes
const mockEmployees = [
  {
    id: 1,
    full_name: "John Doe",
    file_number: "EMP-001",
    job_grade: "8",
    branch: "Head Office",
    district: "Head Office",
    department: "IT",
    current_position: "Software Engineer",
    indpms25: 22.5,
    totalexp20: 18.0,
    tmdrec20: 15.0,
    disrec15: 0,
    total: 55.5
  },
  {
    id: 2,
    full_name: "Jane Smith",
    file_number: "EMP-002",
    job_grade: "9",
    branch: "East Branch",
    district: "East Addis District",
    department: "Finance",
    current_position: "Finance Officer",
    indpms25: 23.5,
    totalexp20: 16.0,
    tmdrec20: 18.0,
    disrec15: 12.0,
    total: 69.5
  }
];

export async function GET(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization') || '';
  
  // Check if authorization header exists
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }

  // For testing/demo purposes, we'll return mock data
  // In production, this would verify the token and fetch real data
  return NextResponse.json(mockEmployees);
} 