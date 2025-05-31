import { NextResponse } from 'next/server';

// Mock users for development
const MOCK_USERS = {
  "admin": { password: "admin123", role: "admin", name: "Admin User", id: "1" },
  "manager": { password: "manager123", role: "manager", name: "Manager User", id: "2" },
  "district": { password: "district123", role: "district", name: "District User", id: "3" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, password } = body;

    // Find user by name
    const user = MOCK_USERS[name as keyof typeof MOCK_USERS];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create a mock token
    const token = "mock-token-" + Math.random().toString(36).substring(2);

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user.id,
        name: name,
        role: user.role,
        fullName: user.name
      },
      token
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
} 