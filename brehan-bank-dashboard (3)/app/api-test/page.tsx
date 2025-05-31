"use client"

import { useState } from "react"
import { updateManagerRecommendation } from "@/lib/managerAPI"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ApiTestPage() {
  const [employeeId, setEmployeeId] = useState<string>("")
  const [score, setScore] = useState<number>(15)
  const [result, setResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleTest = async () => {
    setIsLoading(true)
    setResult("")
    
    try {
      const response = await updateManagerRecommendation(employeeId, {
        employee_id: parseInt(employeeId),
        score: score,
        tmdrec20: score
      })
      
      setResult(JSON.stringify(response.data, null, 2))
    } catch (error: any) {
      console.error("API test error:", error)
      setResult(
        `Error: ${error.message}\n\n` +
        (error.response ? 
          `Status: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}` 
          : "No response data available")
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Manager Recommendation API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee-id">Employee ID</Label>
            <Input 
              id="employee-id" 
              value={employeeId} 
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter employee ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="score">Score (0-20)</Label>
            <Input 
              id="score" 
              type="number" 
              min={0} 
              max={20} 
              step={0.5}
              value={score} 
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>
          
          <Button 
            onClick={handleTest} 
            disabled={isLoading || !employeeId}
          >
            {isLoading ? "Testing..." : "Test API Call"}
          </Button>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 