"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

// API base URL 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function DebugToken() {
  const [token, setToken] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const getStoredToken = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      setResult({ error: "No token found in localStorage" });
    }
  };
  
  const verifyToken = async () => {
    if (!token) {
      setResult({ error: "No token provided" });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const verifyEndpoint = `${API_BASE_URL}/api/public/debug/verify-token`;
      console.log("Verifying token at:", verifyEndpoint);
      
      const response = await axios.post(verifyEndpoint, {
        token: token.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setResult(response.data);
    } catch (error: any) {
      console.error("Token verification error:", error);
      setResult({
        error: error.message,
        details: error.response?.data || "No response data"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Token Verification</CardTitle>
        <CardDescription>
          Test JWT token validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">JWT Token</label>
          <Textarea 
            value={token} 
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here"
            className="min-h-32"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={getStoredToken}>
            Use Current Token
          </Button>
          <Button onClick={verifyToken} disabled={loading || !token}>
            {loading ? "Verifying..." : "Verify Token"}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Results:</h3>
            <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-72">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Token verification is done directly on the server using the same key as authentication.
      </CardFooter>
    </Card>
  );
} 