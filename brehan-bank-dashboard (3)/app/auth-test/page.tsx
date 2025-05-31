"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthTestPage() {
  const [token, setToken] = useState("")
  const [cleanedToken, setCleanedToken] = useState("")
  const [user, setUser] = useState(null)
  const [testResult, setTestResult] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("token") || ""
    setToken(storedToken)

    // Clean token (remove Bearer prefix if present)
    let cleaned = storedToken
    if (cleaned.toLowerCase().startsWith("bearer ")) {
      cleaned = cleaned.substring(7) // Remove 'bearer ' (7 characters)
    }
    setCleanedToken(cleaned)

    // Get user from localStorage
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        setUser(JSON.parse(userStr))
      }
    } catch (err) {
      console.error("Error parsing user data:", err)
    }
  }, [])

  const testAuth = async () => {
    setLoading(true)
    setTestResult("")
    
    try {
      // Test with cleaned token (no bearer prefix)
      const cleanToken = token.toLowerCase().startsWith("bearer ")
        ? token.substring(7).trim()
        : token.trim()
        
      const response = await axios.get("http://localhost:8080/api/employees", {
        headers: {
          "Authorization": `Bearer ${cleanToken}`
        }
      })
      
      setTestResult(`Success! Status: ${response.status}, Found ${Array.isArray(response.data) ? response.data.length : 0} employees`)
    } catch (err) {
      console.error("Auth test failed:", err)
      setTestResult(`Failed: ${err.message}${err.response ? ` (Status: ${err.response.status})` : ""}`)
      
      if (err.response?.data) {
        setTestResult(prev => `${prev}\nError data: ${JSON.stringify(err.response.data)}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const resetToken = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.reload()
  }

  const updateToken = (e) => {
    setToken(e.target.value)
  }

  const saveToken = () => {
    localStorage.setItem("token", token)
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="bg-amber-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
        <div className="space-y-2">
          <p><strong>Token (raw):</strong> {token ? `${token.substring(0, 20)}...` : "No token"}</p>
          <p><strong>Token (cleaned):</strong> {cleanedToken ? `${cleanedToken.substring(0, 20)}...` : "No token"}</p>
          <p><strong>Has Bearer prefix:</strong> {token.toLowerCase().startsWith("bearer ") ? "Yes" : "No"}</p>
          <p><strong>User:</strong> {user ? `${user.name} (${user.role})` : "No user"}</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testAuth} 
          disabled={loading} 
          className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test API Call"}
        </button>
        
        <button 
          onClick={resetToken} 
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded ml-2"
        >
          Reset Token & User
        </button>
      </div>
      
      {testResult && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6 whitespace-pre-wrap">
          <h2 className="text-lg font-semibold mb-2">Test Result</h2>
          <p>{testResult}</p>
        </div>
      )}
      
      <div className="bg-white p-4 border rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Update Token</h2>
        <textarea 
          value={token} 
          onChange={updateToken}
          className="w-full h-24 p-2 border rounded mb-2"
        />
        <button 
          onClick={saveToken} 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Save Token
        </button>
      </div>
      
      <Link href="/login" className="text-amber-600 hover:text-amber-800">
        Back to Login
      </Link>
    </div>
  )
} 