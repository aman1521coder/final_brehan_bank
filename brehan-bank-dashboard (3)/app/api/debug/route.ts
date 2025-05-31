import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  // Get the authorization header from the request
  const authHeader = request.headers.get("Authorization");
  
  // Get API URL from environment or use default
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  
  try {
    // Basic connectivity test
    const pingResponse = await axios.get(`${apiUrl}/ping`);
    
    // Test authenticated endpoint
    let authResponse = null;
    let authError = null;
    
    if (authHeader) {
      try {
        // Try to make an authenticated request to get jobs
        const response = await axios.get(`${apiUrl}/admin/jobs`, {
          headers: {
            Authorization: authHeader
          }
        });
        authResponse = {
          status: response.status,
          headers: response.headers,
          data: response.data
        };
      } catch (error) {
        authError = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      apiUrl,
      auth: {
        headerPresent: !!authHeader,
        headerValue: authHeader ? `${authHeader.substring(0, 15)}...` : null
      },
      pingTest: {
        success: true,
        response: {
          status: pingResponse.status,
          data: pingResponse.data
        }
      },
      authTest: {
        success: !!authResponse,
        response: authResponse,
        error: authError
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      apiUrl,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    }, { status: 500 });
  }
} 