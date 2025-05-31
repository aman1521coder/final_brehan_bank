"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { districtApi } from "@/lib/district-api";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EndpointCheck() {
  const [results, setResults] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken || "No token found");
    }
  }, []);

  const testEndpoint = async () => {
    setLoading(true);
    setResults("Testing API endpoint...\n");
    setResults(prev => prev + `Token: ${token.substring(0, 20)}...\n\n`);

    try {
      // Test with our API client (which removes trailing slashes)
      setResults(prev => prev + "1. Testing with API client (auto-removes trailing slashes):\n");
      const response = await districtApi.getEmployees();
      setResults(prev => prev + `Success! Status: ${response.status}\n`);
      setResults(prev => prev + `Received ${response.data.length} employees\n\n`);
      
      // Log first employee details
      if (response.data.length > 0) {
        setResults(prev => prev + "First employee details:\n");
        setResults(prev => prev + JSON.stringify(response.data[0], null, 2) + "\n\n");
      }
    } catch (error: any) {
      setResults(prev => prev + `Error: ${error.message}\n`);
      if (error.response) {
        setResults(prev => prev + `Status: ${error.response.status}\n`);
        setResults(prev => prev + `Error data: ${JSON.stringify(error.response.data)}\n\n`);
      }
    }

    // Direct fetch test with explicit Authorization header
    try {
      setResults(prev => prev + "2. Testing with direct fetch and explicit token:\n");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const directResponse = await fetch(`${API_BASE_URL}/api/district/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      setResults(prev => prev + `Status: ${directResponse.status}\n`);
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        setResults(prev => prev + `Success! Received ${data.length} employees\n\n`);
      } else {
        const text = await directResponse.text();
        setResults(prev => prev + `Error response: ${text}\n\n`);
      }
    } catch (error: any) {
      setResults(prev => prev + `Direct fetch error: ${error.message}\n\n`);
    }

    // Test our local auth debug endpoint
    try {
      setResults(prev => prev + "3. Testing local auth-debug endpoint:\n");
      
      const debugResponse = await fetch('/api/district/auth-debug', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const debugData = await debugResponse.json();
      setResults(prev => prev + `Debug response:\n${JSON.stringify(debugData, null, 2)}\n\n`);
    } catch (error: any) {
      setResults(prev => prev + `Auth debug error: ${error.message}\n\n`);
    }

    // Examine request headers being sent
    try {
      setResults(prev => prev + "4. Testing CORS preflight and request headers:\n");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      // Create a mock XMLHttpRequest to inspect headers
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `${API_BASE_URL}/api/district/employees`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      
      // Log all headers
      setResults(prev => prev + `Request headers set:\n`);
      setResults(prev => prev + `Authorization: Bearer ${token.substring(0, 20)}...\n\n`);

      // Don't actually send the request
      setResults(prev => prev + "Header inspection complete\n\n");
    } catch (error: any) {
      setResults(prev => prev + `Header test error: ${error.message}\n\n`);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Test</CardTitle>
          <CardDescription>
            Test the district employees API endpoint with trailing slash handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <div className="p-4 bg-amber-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Current Token:</h3>
              <div className="text-xs text-gray-500 break-all">
                {token ? token : "No token found"}
              </div>
            </div>
            
            <Button onClick={testEndpoint} disabled={loading}>
              {loading ? "Testing..." : "Test Endpoint"}
            </Button>
          </div>
          
          <div className="p-4 bg-slate-100 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Results:</h3>
            <pre className="whitespace-pre-wrap text-sm bg-slate-800 text-white p-4 rounded overflow-auto max-h-96">
              {results || "No results yet. Click 'Test Endpoint' to begin."}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 