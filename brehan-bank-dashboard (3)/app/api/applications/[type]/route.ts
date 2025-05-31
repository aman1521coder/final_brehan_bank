import { NextRequest, NextResponse } from "next/server";
import { createApplication } from "@/lib/server/applications";

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type;
    
    // Validate application type
    if (type !== "internal" && type !== "external") {
      return NextResponse.json(
        { message: "Invalid application type" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Required fields validation
    const requiredFields = [
      "job_id", 
      "full_name", 
      "email", 
      "phone", 
      "experience_years",
      "education_level",
      "field_of_study",
      "cover_letter"
    ];
    
    // Additional required fields for internal applications
    if (type === "internal") {
      requiredFields.push("current_position", "current_department");
    }
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create the application with the specified type
    const applicationData = {
      ...body,
      type: type,
      status: "pending", // Default status for all applications
      created_at: new Date().toISOString()
    };
    
    const result = await createApplication(applicationData);
    
    return NextResponse.json(
      { message: "Application submitted successfully", id: result.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { message: "Failed to submit application" },
      { status: 500 }
    );
  }
} 