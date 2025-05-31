"use client"

import { useState, useEffect } from 'react'
import { makeDistrictApiCall } from '@/lib/api'

export default function SimpleEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [updateMessage, setUpdateMessage] = useState('')

  // Fetch employees on page load
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Function to fetch employees using makeDistrictApiCall directly
  async function fetchEmployees() {
    setLoading(true)
    setError('')
    
    try {
      // Get token and district for debug logs
      const token = localStorage.getItem('token')
      const userJson = localStorage.getItem('user')
      const district = userJson ? JSON.parse(userJson).district : ''
      
      console.log(`Fetching employees with token: ${token?.substring(0, 15)}...`)
      console.log(`District: ${district}`)
      
      // Make the API call directly
      const response = await makeDistrictApiCall('/api/district/employees', {
        method: 'GET'
      })
      
      console.log(`Got ${response.data?.length || 0} employees from API`)
      
      // Set employees and clear any selected employee
      setEmployees(response.data || [])
      setSelectedId(null)
    } catch (err: any) {
      console.error('Error fetching employees:', err)
      setError(err.message || 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  // Function to update the district recommendation score
  async function updateScore() {
    if (!selectedId) return
    
    setLoading(true)
    setUpdateMessage('')
    
    try {
      // Get district for logging
      const userJson = localStorage.getItem('user')
      const district = userJson ? JSON.parse(userJson).district : ''
      
      console.log(`Updating employee ${selectedId} with score ${score}`)
      console.log(`District: ${district}`)
      
      // Make the API call directly
      const response = await makeDistrictApiCall(`/api/district/employees/${selectedId}/recommendation`, {
        method: 'PATCH',
        data: {
          employee_id: selectedId,
          score: score,
          district: district
        }
      })
      
      console.log('Update response:', response)
      setUpdateMessage(`Successfully updated score for employee ${selectedId}`)
      
      // Refresh the employee list
      fetchEmployees()
    } catch (err: any) {
      console.error('Error updating score:', err)
      setUpdateMessage(`Error: ${err.message || 'Failed to update score'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Simple Employee Management</h1>
      
      {loading && <div style={{ padding: '10px', background: '#f0f0f0' }}>Loading...</div>}
      
      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      {updateMessage && (
        <div style={{ 
          padding: '10px', 
          background: updateMessage.includes('Error') ? '#ffebee' : '#e8f5e9', 
          color: updateMessage.includes('Error') ? '#c62828' : '#2e7d32',
          marginBottom: '20px'
        }}>
          {updateMessage}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <button
          onClick={fetchEmployees}
          style={{
            padding: '8px 16px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Employees
        </button>
        
        {selectedId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>
              <span style={{ marginRight: '8px' }}>District Rec (15%):</span>
              <input
                type="number"
                min="0"
                max="15"
                step="0.1"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value))}
                style={{ width: '80px', padding: '8px' }}
              />
            </label>
            
            <button
              onClick={updateScore}
              style={{
                padding: '8px 16px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Update Score
            </button>
          </div>
        )}
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Position</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Branch</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>District</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Job Grade</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>District Rec (15%)</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 && !loading ? (
            <tr>
              <td colSpan={8} style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr 
                key={employee.id}
                style={{ 
                  background: selectedId === employee.id ? '#e3f2fd' : 'white',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedId(employee.id)
                  setScore(employee.disrec15 || 0)
                }}
              >
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{employee.id}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {typeof employee.full_name === 'object'
                    ? (employee.full_name?.Valid ? employee.full_name.String : "")
                    : employee.full_name}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {typeof employee.current_position === 'object'
                    ? (employee.current_position?.Valid ? employee.current_position.String : "")
                    : employee.current_position || employee.new_position}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {typeof employee.branch === 'object'
                    ? (employee.branch?.Valid ? employee.branch.String : "")
                    : employee.branch}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {typeof employee.district === 'object'
                    ? (employee.district?.Valid ? employee.district.String : "")
                    : employee.district}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {typeof employee.job_grade === 'object'
                    ? (employee.job_grade?.Valid ? employee.job_grade.String : "")
                    : employee.job_grade}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {typeof employee.disrec15 === 'object'
                    ? (employee.disrec15?.Valid ? employee.disrec15.Float64 : "0")
                    : employee.disrec15 || "0"}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedId(employee.id)
                      setScore(employee.disrec15 || 0)
                      window.scrollTo(0, 0)
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        {employees.length > 0 && `Showing ${employees.length} employees`}
      </div>
    </div>
  )
} 