import { NextResponse } from 'next/server';

// Simple API route to handle the token from the login page
export async function POST(request: Request) {
  try {
    // In a real implementation, this would set an HTTP-only cookie with the token
    // For now just acknowledge the request
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 