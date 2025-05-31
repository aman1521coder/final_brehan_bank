"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function TestDistrictApi() {
  const [results, setResults] = useState<string>("")
  const [district, setDistrict] = useState<string>("")
  const [token, setToken] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // Get user and token info
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user")
      const tokenStr = localStorage.getItem("token")
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setDistrict(user.district || "")
        } catch (e) {
          console.error("Error parsing user data:", e)
        }
      }
      
      if (tokenStr) {
        setToken(tokenStr)
      }
    }
  }, [])

  const testFetch = async () => {
    setLoading(true)
    setResults("Testing with fetch API...\n")
    
    try {
      const headers = new Headers()
      headers.append('Authorization', `Bearer ${token.trim()}`)
      headers.append('Content-Type', 'application/json')
      headers.append('Accept', 'application/json')
      if (district) {
        headers.append('X-District', district)
      }
      
      setResults(prev => prev + `Making fetch request to ${API_BASE_URL}/api/district/employees with district ${district}\n`)
      
      const response = await fetch(`${API_BASE_URL}/api/district/employees`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      })
      
      setResults(prev => prev + `Fetch response status: ${response.status}\n`)
      
      if (response.ok) {
        const data = await response.json()
        setResults(prev => prev + `Success! Received ${Array.isArray(data) ? data.length : 0} employees\n`)
        setResults(prev => prev + JSON.stringify(data, null, 2).substring(0, 200) + '...\n')
      } else {
        setResults(prev => prev + `Error: ${response.statusText}\n`)
      }
    } catch (error: any) {
      setResults(prev => prev + `Fetch failed: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }
  
  const testXHR = () => {
    setLoading(true)
    setResults("Testing with XMLHttpRequest...\n")
    
    const xhr = new XMLHttpRequest()
    xhr.withCredentials = true
    
    xhr.addEventListener("readystatechange", function() {
      if (this.readyState === 4) {
        setResults(prev => prev + `XHR status: ${this.status}\n`)
        
        if (this.status >= 200 && this.status < 300) {
          try {
            const data = JSON.parse(this.responseText)
            setResults(prev => prev + `Success! Received ${Array.isArray(data) ? data.length : 0} employees\n`)
            setResults(prev => prev + JSON.stringify(data, null, 2).substring(0, 200) + '...\n')
          } catch (e) {
            setResults(prev => prev + `Error parsing response: ${e}\n`)
          }
        } else {
          setResults(prev => prev + `Error: ${this.statusText}\n`)
        }
        
        setLoading(false)
      }
    })
    
    setResults(prev => prev + `Making XHR request to ${API_BASE_URL}/api/district/employees with district ${district}\n`)
    
    xhr.open("GET", `${API_BASE_URL}/api/district/employees`)
    xhr.setRequestHeader("Authorization", `Bearer ${token.trim()}`)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.setRequestHeader("Accept", "application/json")
    if (district) {
      xhr.setRequestHeader("X-District", district)
    }
    xhr.send()
  }

  const testDirectNoCredentials = async () => {
    setLoading(true)
    setResults("Testing with direct fetch, no credentials...\n")
    
    try {
      const headers = {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
      
      if (district) {
        headers['X-District'] = district
      }
      
      // Make sure we have NO trailing slash
      const url = `${API_BASE_URL}/api/district/employees`
      setResults(prev => prev + `Making direct request to ${url}\n`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        // No credentials in this test
      })
      
      setResults(prev => prev + `Response status: ${response.status}\n`)
      
      if (response.ok) {
        const data = await response.json()
        setResults(prev => prev + `Success! Received data.\n`)
      } else {
        setResults(prev => prev + `Error: ${response.statusText}\n`)
      }
    } catch (error: any) {
      setResults(prev => prev + `Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  const testModeNoCORS = async () => {
    setLoading(true)
    setResults("Testing with no-cors mode...\n")
    
    try {
      const headers = {
        'Authorization': `Bearer ${token.trim()}`,
        'X-District': district || ''
      }
      
      const url = `${API_BASE_URL}/api/district/employees`
      setResults(prev => prev + `Making no-cors request to ${url}\n`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        mode: 'no-cors' // This should bypass CORS but will make response opaque
      })
      
      setResults(prev => prev + `Response type: ${response.type}\n`)
      setResults(prev => prev + `Response status: ${response.status}\n`)
      setResults(prev => prev + "Note: With no-cors, we can't read the response content\n")
    } catch (error: any) {
      setResults(prev => prev + `Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  const testDirectEndpoint = async () => {
    setLoading(true)
    setResults("Testing direct endpoint with query params...\n")
    
    try {
      const headers = {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json'
      }
      
      // Create URL with query parameter
      const params = new URLSearchParams()
      if (district) {
        params.append('district', district)
      }
      
      const url = `${API_BASE_URL}/api/district/employees?${params.toString()}`
      setResults(prev => prev + `Making request to ${url}\n`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      })
      
      setResults(prev => prev + `Response status: ${response.status}\n`)
      
      if (response.ok) {
        const data = await response.json()
        setResults(prev => prev + `Success! Received ${Array.isArray(data) ? data.length : 0} employees\n`)
      } else {
        setResults(prev => prev + `Error: ${response.statusText}\n`)
      }
    } catch (error: any) {
      setResults(prev => prev + `Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  const testWithoutJSON = async () => {
    setLoading(true)
    setResults("Testing without Content-Type JSON...\n")
    
    try {
      // Only include Authorization - no Content-Type or Accept headers
      const headers = {
        'Authorization': `Bearer ${token.trim()}`
      }
      
      if (district) {
        headers['X-District'] = district
      }
      
      const url = `${API_BASE_URL}/api/district/employees`
      setResults(prev => prev + `Making minimal headers request to ${url}\n`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      })
      
      setResults(prev => prev + `Response status: ${response.status}\n`)
      
      try {
        const text = await response.text()
        setResults(prev => prev + `Raw response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}\n`)
        
        // Try to parse as JSON if it looks like JSON
        if (text.startsWith('[') || text.startsWith('{')) {
          const data = JSON.parse(text)
          setResults(prev => prev + `Parsed JSON: ${Array.isArray(data) ? data.length + ' items' : 'object'}\n`)
        }
      } catch (e) {
        setResults(prev => prev + `Error parsing response: ${e}\n`)
      }
    } catch (error: any) {
      setResults(prev => prev + `Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  const testDirectBackend = async () => {
    setLoading(true)
    setResults("DIRECT TEST TO BACKEND - bypassing Next.js completely...\n")
    
    try {
      // Form the URL exactly as needed by the Go backend
      const directUrl = `${API_BASE_URL}/api/district/employees`
      
      // Create headers with exactly the format Go expects
      const headers = new Headers()
      headers.append('Authorization', `Bearer ${token.trim()}`)
      
      if (district) {
        headers.append('X-District', district)
      }
      
      setResults(prev => prev + `Sending direct request to ${directUrl}\n`)
      setResults(prev => prev + `Authorization: Bearer ${token.substring(0, 15)}...\n`)
      
      // Create the most basic fetch possible
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(directUrl, {
        method: 'GET',
        headers: headers,
        signal: controller.signal,
        credentials: 'include',
        cache: 'no-cache' // Bypass cache completely
      })
      
      clearTimeout(timeoutId)
      
      setResults(prev => prev + `Response status: ${response.status}\n`)
      setResults(prev => prev + `Response headers: ${JSON.stringify(Object.fromEntries([...response.headers.entries()]))}\n`)
      
      if (response.ok) {
        const text = await response.text()
        setResults(prev => prev + `Response text (first 200 chars): ${text.substring(0, 200)}...\n`)
        
        try {
          if (text.trim()) {
            const data = JSON.parse(text)
            setResults(prev => prev + `Success! Parsed JSON with ${Array.isArray(data) ? data.length + ' items' : 'object'}\n`)
          } else {
            setResults(prev => prev + "Warning: Empty response body\n")
          }
        } catch (e) {
          setResults(prev => prev + `Error parsing JSON: ${e}\n`)
        }
      } else {
        setResults(prev => prev + `Error response: ${response.statusText}\n`)
        const text = await response.text()
        setResults(prev => prev + `Error details: ${text}\n`)
      }
    } catch (error: any) {
      setResults(prev => prev + `Exception during fetch: ${error.message}\n`)
      if (error.name === 'AbortError') {
        setResults(prev => prev + "Request timed out after 10 seconds\n")
      }
    } finally {
      setLoading(false)
    }
  }

  const testPostMethod = async () => {
    setLoading(true)
    setResults("Testing GET via POST method (CORS workaround)...\n")
    
    try {
      // Create request body with auth info
      const body = {
        method: "GET",
        path: "/api/district/employees",
        district: district || ""
      }
      
      // Use POST instead of GET
      const url = `${API_BASE_URL}/api/proxy` // This would need to be implemented on your backend
      setResults(prev => prev + `Making POST request to ${url}\n`)
      setResults(prev => prev + `With body: ${JSON.stringify(body)}\n`)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`
        },
        body: JSON.stringify(body),
        credentials: 'include'
      })
      
      setResults(prev => prev + `Response status: ${response.status}\n`)
      
      const text = await response.text()
      setResults(prev => prev + `Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}\n`)
      
      if (text.startsWith('[') || text.startsWith('{')) {
        try {
          const data = JSON.parse(text)
          setResults(prev => prev + `Parsed JSON successfully\n`)
        } catch (e) {
          setResults(prev => prev + `Error parsing JSON: ${e}\n`)
        }
      }
    } catch (error: any) {
      setResults(prev => prev + `Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  // Add a formatted JSON output of token and district
  const getDebugInfoJson = () => {
    const tokenInfo = token ? {
      token: token.substring(0, 15) + '...',
      length: token.length,
      format: token.includes('.') ? 'JWT' : 'Unknown',
      parts: token.split('.').length
    } : 'None';
    
    return JSON.stringify({
      token: tokenInfo,
      district: district || 'None',
      api_url: API_BASE_URL
    }, null, 2);
  }

  // Add custom URL test section at the bottom
  const [customUrl, setCustomUrl] = useState(`${API_BASE_URL}/api/district/employees`)
  const [customResults, setCustomResults] = useState("")

  const testCustomUrl = async () => {
    setLoading(true)
    setCustomResults(`Testing custom URL: ${customUrl}\n`)
    
    try {
      const response = await fetch(customUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'X-District': district || ''
        },
        credentials: 'include'
      })
      
      setCustomResults(prev => prev + `Response status: ${response.status}\n`)
      
      const text = await response.text()
      setCustomResults(prev => prev + `Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}\n`)
    } catch (error: any) {
      setCustomResults(prev => prev + `Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>District API Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm font-bold mb-2">Debug Information:</p>
          <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto">
            {getDebugInfoJson()}
          </pre>
        </div>
        
        <div className="mb-4">
          <p className="text-sm mb-2">Token: {token ? token.substring(0, 15) + '...' : 'None'}</p>
          <p className="text-sm mb-2">District: {district || 'None'}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={testFetch} disabled={loading}>
            Test with Fetch
          </Button>
          <Button onClick={testXHR} disabled={loading} variant="outline">
            Test with XHR
          </Button>
          <Button onClick={testDirectNoCredentials} disabled={loading} variant="secondary">
            Direct (No Credentials)
          </Button>
          <Button onClick={testModeNoCORS} disabled={loading} variant="destructive">
            No-CORS Mode
          </Button>
          <Button onClick={testDirectEndpoint} disabled={loading} variant="default">
            Direct with Query Params
          </Button>
          <Button onClick={testWithoutJSON} disabled={loading} variant="outline" className="border-amber-500 text-amber-500">
            No Content-Type
          </Button>
          <Button onClick={testDirectBackend} disabled={loading} variant="outline" className="border-green-500 text-green-500">
            Direct Backend
          </Button>
          <Button onClick={testPostMethod} disabled={loading} variant="outline" className="border-purple-500 text-purple-500">
            POST Method
          </Button>
        </div>
        
        <div className="bg-muted p-4 rounded-md">
          <pre className="whitespace-pre-wrap text-sm">
            {results || "No results yet. Click a test button to start."}
          </pre>
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="text-base font-medium mb-2">Test Custom URL</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 px-3 py-1 border rounded"
            />
            <Button onClick={testCustomUrl} disabled={loading} size="sm">
              Test
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">
              {customResults || "Enter a URL and click Test."}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 