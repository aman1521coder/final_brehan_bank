"use client"

import React, { useEffect, useState } from "react"
import { Download, Eye, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import type { Employee } from "@/types/employee"
import { getUserDistrict } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { districtApi } from "@/lib/district-api"
import { DistrictRecommendationModal } from "./district-recommendation-modal"

interface DistrictEmployeesListProps {
  onRecommend?: (employee: Employee) => void;
}

export function DistrictEmployeesList({
  onRecommend,
}: DistrictEmployeesListProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null)
  const [filterTab, setFilterTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false)
  const [showDebugView, setShowDebugView] = useState(false)
  const [allDistricts, setAllDistricts] = useState<string[]>([])
  const [rawEmployees, setRawEmployees] = useState<any[]>([])
  const [showAllEmployees, setShowAllEmployees] = useState(false)
  const [districtStats, setDistrictStats] = useState<{[key: string]: number}>({})
  const [showTokenInfo, setShowTokenInfo] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [district, setDistrict] = useState<string | null>(null)

  const userDistrict = getUserDistrict()
  console.log("DEBUG: JWT userDistrict =", userDistrict);

  // Function to safely handle null/undefined values from SQL.Null* objects
  const safeValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === 'object' && 'Valid' in value) {
      return value.Valid ? String(value.String || value.Float64) : "";
    }
    return String(value);
  };

  // Check if district is valid
  const isValidDistrict = (district: string): boolean => {
    return VALID_DISTRICTS.includes(district);
  };

  // Load employees with direct API call and no filtering
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading district employees directly from API...");
      
      // Get token directly
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }
      
      // DIRECT API CALL WITH NO PROCESSING
      const response = await fetch("/api/district/employees", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const rawData = await response.json();
      console.log(`RECEIVED ${rawData.length} EMPLOYEES FROM API`);
      
      // Map raw response to employee objects with safe handling of NULL values
      const employees = rawData.map((emp: any) => ({
        id: emp.id,
        full_name: emp.full_name?.String || emp.full_name || "",
        job_grade: emp.job_grade?.String || emp.job_grade || "",
        branch: emp.branch?.String || emp.branch || "",
        district: emp.district?.String || emp.district || "",
        current_position: emp.current_position?.String || emp.current_position || "",
        indpms25: typeof emp.indpms25 === 'object' ? 
          (emp.indpms25?.Valid ? emp.indpms25.Float64 : 0) : emp.indpms25 || 0,
        totalexp20: typeof emp.totalexp20 === 'object' ? 
          (emp.totalexp20?.Valid ? emp.totalexp20.Float64 : 0) : emp.totalexp20 || 0,
        tmdrec20: typeof emp.tmdrec20 === 'object' ? 
          (emp.tmdrec20?.Valid ? emp.tmdrec20.Float64 : 0) : emp.tmdrec20 || 0,
        disrec15: typeof emp.disrec15 === 'object' ? 
          (emp.disrec15?.Valid ? emp.disrec15.Float64 : 0) : emp.disrec15 || 0,
        total: typeof emp.total === 'object' ? 
          (emp.total?.Valid ? emp.total.Float64 : 0) : emp.total || 0,
      }));
      
      console.log(`TRANSFORMED ${employees.length} EMPLOYEES`);
      
      // Set both employees and filteredEmployees to the same data - NO FILTERING
      setEmployees(employees);
      setFilteredEmployees(employees);
      
      // Calculate district stats
      const stats: {[key: string]: number} = {};
      employees.forEach(emp => {
        const district = emp.district || "(No District)";
        stats[district] = (stats[district] || 0) + 1;
      });
      setDistrictStats(stats);
      console.log("DISTRICT STATS:", stats);
      
      // Success notification
        toast({
        title: "Loaded Employees",
        description: `Successfully loaded ${employees.length} employees`,
      });
      
    } catch (error) {
      console.error("Error loading employees:", error);
      setError(`Failed to load employees: ${error}`);
      } finally {
      setLoading(false);
    }
  };

  // Load employees on component mount
  useEffect(() => {
    // Get the user's district from the auth utility
    const userDistrict = getUserDistrict();
    setDistrict(userDistrict);

    // Fetch employees for the district
    fetchEmployees(userDistrict);
  }, []);
  
  // Update filtered employees when search query or filter tab changes
  useEffect(() => {
    if (employees.length > 0) {
      const filtered = employees.filter(employee => {
        // Filter by search query
        const matchesSearch = searchQuery === "" || 
          safeValue(employee.full_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
          safeValue(employee.employee_number).toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by tab
        const matchesTab = 
          filterTab === "all" || 
          (filterTab === "high" && Number(employee.total || 0) >= 75) ||
          (filterTab === "medium" && Number(employee.total || 0) >= 50 && Number(employee.total || 0) < 75) ||
          (filterTab === "low" && Number(employee.total || 0) < 50);
        
        return matchesSearch && matchesTab;
      });
      
      setFilteredEmployees(filtered);
    }
  }, [employees, searchQuery, filterTab]);

  // Handle recommendation update success
  const handleRecommendationComplete = () => {
    // Reload the employee data to reflect the changes
    loadEmployees();
      toast({
      title: "Success",
      description: "Employee data refreshed with updated recommendation",
    });
  };
  
  // Format CSV data for export
  const exportToCSV = () => {
    // Headers
    const headers = [
      "Employee Number",
      "Full Name",
      "Branch",
      "District",
      "Position",
      "IND PMS (25%)",
      "Total Exp (20%)",
      "TMD Rec (20%)",
      "DIS Rec (15%)",
      "Total"
    ];

    // Format data
    const csvData = filteredEmployees.map(emp => [
      safeValue(emp.employee_number),
      safeValue(emp.full_name),
      safeValue(emp.branch),
      safeValue(emp.district),
      safeValue(emp.current_position),
      safeValue(emp.indpms25),
      safeValue(emp.totalexp20),
      safeValue(emp.tmdrec20),
      safeValue(emp.disrec15), 
      safeValue(emp.total)
    ]);
    
    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.join(","))
      .join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `district-employees-${userDistrict}-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render the employee list
  const renderEmployeeList = (employees: Employee[]) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-8">
          <p>Loading employees...</p>
        </div>
      );
    }
    
    if (error) {
  return (
        <div className="flex flex-col items-center p-8">
          <div className="text-red-500 mb-4 text-center max-w-lg">
            <p>{error}</p>
        </div>
          
          {/* Always show district selector when there's an error */}
          {renderQuickDistrictSelect()}
      </div>
      );
    }
    
    if (employees.length === 0) {
      return (
        <div className="flex flex-col items-center p-8">
          <div className="text-muted-foreground mb-4 text-center">
            <p>No employees found for your district.</p>
      </div>

          {/* Always show district selector when there are no employees */}
          {renderQuickDistrictSelect()}
        </div>
      );
    }
    
    return (
          <Table>
            <TableHeader>
              <TableRow>
            <TableHead>Employee #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Position</TableHead>
            <TableHead>Total Score</TableHead>
            <TableHead>DIS Rec</TableHead>
            <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
          {employees.map((employee) => (
                  <TableRow key={employee.id}>
              <TableCell>{safeValue(employee.employee_number)}</TableCell>
              <TableCell>{safeValue(employee.full_name)}</TableCell>
              <TableCell>{safeValue(employee.branch)}</TableCell>
              <TableCell>{safeValue(employee.current_position)}</TableCell>
              <TableCell>
                {employee.total !== undefined && employee.total !== null ? (
                  employee.total >= 75 ? (
                    <Badge className="bg-green-500">{safeValue(employee.total)}%</Badge>
                  ) : employee.total >= 50 ? (
                    <Badge className="bg-yellow-500">{safeValue(employee.total)}%</Badge>
                  ) : (
                    <Badge className="bg-red-500">{safeValue(employee.total)}%</Badge>
                  )
                ) : (
                  <Badge className="bg-gray-500">N/A</Badge>
                )}
              </TableCell>
              <TableCell>{safeValue(employee.disrec15)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewingEmployee(employee)}
                  >
                    <Eye className="h-4 w-4" />
                          </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setViewingEmployee(employee);
                      setIsRecommendModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                    </div>
                    </TableCell>
                  </TableRow>
          ))}
            </TableBody>
          </Table>
    );
  };

  // Enhance the debug function to show all districts
  const debugDistrictFiltering = async () => {
    try {
      setLoading(true);
      console.group("🔍 District Filtering Debug");
      
      // Check user data in localStorage
      const userStr = localStorage.getItem("user");
      console.log("Raw user data:", userStr);
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log("Parsed user object:", user);
        console.log("User district from object:", user.district);
      } else {
        console.warn("No user data found in localStorage");
      }
      
      // Show current district value
      console.log("Current district value from getUserDistrict():", userDistrict);
      
      // Log all employees and their districts
      console.log("Currently shown employees:", employees.length);
      
      // Fetch all employees for comparison
      try {
        const allEmployees = await districtApi.getAllEmployees();
        
        if (allEmployees && Array.isArray(allEmployees)) {
          console.log("All employees from API:", allEmployees.length);
          
          // Transform data to handle SQL.Null objects
          const transformedAllEmployees = allEmployees.map(emp => ({
            ...emp,
            district: typeof emp.district === 'object' ? 
              (emp.district?.Valid ? emp.district.String : "") : emp.district,
          }));
          
          // Count districts in all employees
          const allDistrictMap = new Map();
          transformedAllEmployees.forEach(emp => {
            const district = safeValue(emp.district);
            if (!allDistrictMap.has(district)) {
              allDistrictMap.set(district, 0);
            }
            allDistrictMap.set(district, allDistrictMap.get(district) + 1);
          });
          
          // Extract and set all districts for UI display
          setAllDistricts(Array.from(allDistrictMap.keys()));
          
          console.log("All districts available:");
          allDistrictMap.forEach((count, district) => {
            console.log(`- "${district}": ${count} employees`);
          });
          
          // Check if the user's district exists in the data
          const userDistrictLower = userDistrict.toLowerCase().trim();
          let districtFound = false;
          
          allDistrictMap.forEach((_, district) => {
            const districtLower = district.toLowerCase().trim();
            if (districtLower === userDistrictLower || 
                districtLower.includes(userDistrictLower) || 
                userDistrictLower.includes(districtLower)) {
              districtFound = true;
              console.log(`✅ Found matching district: "${district}" matches user district "${userDistrict}"`);
            }
          });
          
          if (!districtFound) {
            console.warn(`❌ User district "${userDistrict}" not found in any employee records`);
          }
          
          // Show the debug view
          setShowDebugView(true);
        }
      } catch (error) {
        console.error("Error fetching all employees for debug:", error);
      }
      
      console.groupEnd();
      
      toast({
        title: "Debug information",
        description: "Check browser console for district filtering details",
      });
    } catch (error) {
      console.error("Error in debug function:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a debug view component
  const renderDebugView = () => {
    if (!showDebugView) return null;
    
    return (
      <Card className="my-4 border-2 border-yellow-500">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Debug: District Selection</h3>
            <Button variant="outline" size="sm" onClick={() => setShowDebugView(false)}>
              Close Debug View
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm mb-2">Current district from localStorage: <strong>"{userDistrict}"</strong></p>
            <p className="text-sm mb-4">Click on any district below to manually use it for filtering:</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allDistricts.map(district => (
                <Button 
                  key={district} 
                  variant="outline" 
                  size="sm"
                  className={userDistrict === district ? "border-green-500 bg-green-50" : ""}
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    user.district = district;
                    localStorage.setItem("user", JSON.stringify(user));
                    toast({
                      title: "District updated",
                      description: `Set district to "${district}"`,
                    });
                    // Force reload
                    window.location.reload();
                  }}
                >
                  {district || "(empty)"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Update VALID_DISTRICTS to exactly match database values
  const VALID_DISTRICTS = [
    "East Addis District",
    "East District",
    "Head Office",
    "Institutional Banking Department",
    "North Addis District",
    "North District",
    "South Addis District", 
    "South District",
    "West Addis District",
    "West District",
  ];

  // Update the renderQuickDistrictSelect function to accept a className prop
  const renderQuickDistrictSelect = (className: string = "") => {
    return (
      <Card className={`my-4 border-2 border-blue-500 ${className}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Select Your District</h3>
                  </div>
          
          <div className="mb-4">
            <div className="bg-yellow-100 p-3 mb-3 rounded-md">
              <p className="text-sm font-semibold text-yellow-800">⚠️ No employees are displayed because your district setting doesn't match any district in the database.</p>
              <p className="text-sm text-yellow-800 mt-1">Current district: <strong>"{userDistrict}"</strong></p>
              <p className="text-sm text-yellow-800 mt-1">Please select your correct district from the list below.</p>
                  </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {VALID_DISTRICTS.map(district => (
                <Button 
                  key={district} 
                  variant="outline" 
                  size="sm"
                  className={userDistrict === district ? "border-green-500 bg-green-50" : ""}
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    user.district = district;
                    localStorage.setItem("user", JSON.stringify(user));
                    toast({
                      title: "District updated",
                      description: `Set district to "${district}"`,
                    });
                    // Force reload
                    window.location.reload();
                  }}
                >
                  {district}
                </Button>
              ))}
                  </div>
                  </div>
        </CardContent>
      </Card>
    );
  };

  // Add a special fix for Head Office district to appear after the user district card
  const renderHeadOfficeFixWarning = () => {
    // Only show this for Head Office district
    if (userDistrict !== "Head Office") return null;
    
    return (
      <Card className="my-4 border-2 border-red-500">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Head Office Employees Not Showing?</h3>
                  </div>
          
          <div className="mb-4">
            <div className="bg-red-50 p-3 mb-3 rounded-md">
              <p className="text-sm font-semibold">There might be a data format issue with the "Head Office" district.</p>
              <p className="text-sm mt-1">Try selecting a different district and then selecting "Head Office" again.</p>
              <p className="text-sm mt-1">If that doesn't work, there might be an issue with how districts are stored in the database.</p>
                  </div>
            
            <Button 
              className="w-full mt-2"
              onClick={() => {
                // Force a direct load of Head Office employees
                try {
                  // Make a direct API call with query param
                  fetch('/api/district/employees?district=Head%20Office', {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                  })
                  .then(response => {
                    if (!response.ok) throw new Error(`Error ${response.status}`);
                    return response.json();
                  })
                  .then(data => {
                    // Process the data directly
                    if (data && Array.isArray(data)) {
                      const transformedData = data.map(emp => ({
                        ...emp,
                        district: typeof emp.district === 'object' ? 
                          (emp.district?.Valid ? emp.district.String : "") : emp.district,
                      }));
                      
                      // Only show employees with Head Office district
                      const headOfficeEmployees = transformedData.filter(emp => {
                        const district = safeValue(emp.district);
                        return district.includes("Head") && district.includes("Office");
                      });
                      
                      console.log(`Found ${headOfficeEmployees.length} Head Office employees via direct query`);
                      
                      if (headOfficeEmployees.length > 0) {
                        setEmployees(headOfficeEmployees);
                        setFilteredEmployees(headOfficeEmployees);
                        setError(null);
                        toast({
                          title: "Success",
                          description: `Found ${headOfficeEmployees.length} Head Office employees`,
                        });
                      }
                    }
                  })
                  .catch(err => {
                    console.error("Error in direct query:", err);
                    toast({
                      title: "Error",
                      description: "Failed to load Head Office employees",
                      variant: "destructive",
                    });
                  });
                } catch (error) {
                  console.error("Error:", error);
                }
              }}
            >
              Try Loading Head Office Employees Directly
            </Button>
                </div>
        </CardContent>
      </Card>
    );
  };

  // Add direct load function that bypasses district filtering
  const loadAllEmployees = async () => {
    try {
      setLoading(true);
      toast({
        title: "Loading all employees",
        description: "Fetching all employees without district filtering"
      });
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token");
        return;
      }
      
      // Make the request directly without any query parameters
      const response = await fetch('/api/district/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error("API error:", response.status);
        return;
      }
      
      const data = await response.json();
      console.log("ALL DATA WITHOUT FILTERING:", data);
      
      if (data && Array.isArray(data)) {
        // Store raw data
        setRawEmployees(data);
        
        // Transform the data to handle SQL.Null* objects
        const transformedData = data.map(emp => ({
          ...emp,
          full_name: typeof emp.full_name === 'object' ? 
            (emp.full_name?.Valid ? emp.full_name.String : "") : emp.full_name,
          district: typeof emp.district === 'object' ? 
            (emp.district?.Valid ? emp.district.String : "") : emp.district,
          // Add other fields as needed
        }));
        
        // Use ALL employees regardless of district
        setEmployees(transformedData);
        setFilteredEmployees(transformedData);
        setError(null);
        setShowAllEmployees(true);
        
        toast({
          title: "Success",
          description: `Loaded ${transformedData.length} employees without district filtering`
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid data format received",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Hard reset error:", error);
      toast({
        title: "Error",
        description: "Failed to load all employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a function to directly check the backend response
  const checkBackendDirect = async () => {
    try {
      setLoading(true);
      toast({
        title: "Testing backend directly",
        description: "Making direct API call without filtering"
      });
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token");
        return;
      }
      
      // Log the current user information
      const userInfo = localStorage.getItem("user");
      console.log("User info in localStorage:", userInfo);
      
      // Try different direct backend approaches
      const endpoints = [
        '/api/district/employees',               // No parameters
        '/api/district/employees?district=',     // Empty district
        '/api/district/employees?district=all',  // All districts
        '/api/employees'                         // Different endpoint
      ];
      
      // Show testing message
      setError("Testing backend directly - please wait...");
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log(`Response status for ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`SUCCESS with ${endpoint}:`, data);
            
            if (data && Array.isArray(data) && data.length > 0) {
              // Store raw data
              setRawEmployees(data);
              
              // Basic transformation
              const transformedData = data.map(emp => ({
                ...emp,
                full_name: typeof emp.full_name === 'object' ? 
                  (emp.full_name?.Valid ? emp.full_name.String : "") : emp.full_name,
                // Add minimal transformation
              }));
              
              // Show the data
              setEmployees(transformedData);
              setFilteredEmployees(transformedData);
              setError(null);
              setShowAllEmployees(true);
              
              toast({
                title: "Success",
                description: `Found ${transformedData.length} employees using ${endpoint}`,
              });
              
              return; // Exit after first success
            } else {
              console.log(`Endpoint ${endpoint} returned empty or invalid data`);
            }
          }
        } catch (err) {
          console.error(`Error with endpoint ${endpoint}:`, err);
        }
      }
      
      // If we reach here, none of the approaches worked
      setError("All backend approaches failed. Check console for details.");
      
      toast({
        title: "Backend test complete",
        description: "Check console for detailed results",
        variant: "destructive"
      });
    } catch (error) {
      console.error("Backend check error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add this function if it doesn't exist already
  const calculateDistrictStats = (employees: any[]) => {
    const stats: {[key: string]: number} = {}
    
    employees.forEach(emp => {
      const district = typeof emp.district === 'object' ? 
        (emp.district?.Valid ? emp.district.String : "") : emp.district || "";
      
      if (district) {
        stats[district] = (stats[district] || 0) + 1
      } else {
        stats["(No District)"] = (stats["(No District)"] || 0) + 1
      }
    });
    
    setDistrictStats(stats);
    console.log("DISTRICT STATS:", stats);
  }

  // Add a function to display token info
  const displayTokenInfo = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "No token found in localStorage",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Function to decode JWT
      const decodeToken = (token: string) => {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join('')
          );
          return JSON.parse(jsonPayload);
        } catch (e) {
          console.error('Error decoding JWT token:', e);
          return { error: "Failed to decode token" };
        }
      };
      
      const decoded = decodeToken(token);
      console.log("DECODED TOKEN:", decoded);
      
      toast({
        title: "Token Decoded",
        description: `User: ${decoded.username || 'unknown'}, District: ${decoded.district || 'none'}`,
      });
      
      // Show token info in UI
      setShowTokenInfo(true);
      
    } catch (error) {
      console.error("Error displaying token:", error);
      toast({
        title: "Error",
        description: "Failed to decode token",
        variant: "destructive",
      });
    }
  };

  // Update the emergencyBypass function to set this state
  const emergencyBypass = () => {
    try {
      // Create some sample employees based on the database stats we saw
      const sampleEmployees: Employee[] = [
        // Head Office employees
        ...Array(59).fill(null).map((_, i) => ({
          id: String(1000 + i),
          full_name: `Head Office Employee ${i+1}`,
          district: "Head Office",
          branch: "Main Branch",
          current_position: "Various Positions",
          indpms25: Math.floor(Math.random() * 25),
          totalexp20: Math.floor(Math.random() * 20),
          tmdrec20: Math.floor(Math.random() * 20),
          disrec15: Math.floor(Math.random() * 15),
          total: Math.floor(Math.random() * 100),
          // Add required fields for Employee type
          file_number: `EMP${1000 + i}`,
          job_grade: "Various",
          job_category: "Various", 
          educational_level: "Various",
          field_of_study: "Various",
          region: "",
          employment_date: "",
          new_salary: ""
        })),
        // East Addis District
        ...Array(41).fill(null).map((_, i) => ({
          id: String(2000 + i),
          full_name: `East Addis Employee ${i+1}`,
          district: "East Addis District",
          branch: "East Addis Branch",
          current_position: "Various Positions",
          indpms25: Math.floor(Math.random() * 25),
          totalexp20: Math.floor(Math.random() * 20),
          tmdrec20: Math.floor(Math.random() * 20),
          disrec15: Math.floor(Math.random() * 15),
          total: Math.floor(Math.random() * 100),
          // Add required fields for Employee type
          file_number: `EMP${2000 + i}`,
          job_grade: "Various",
          job_category: "Various", 
          educational_level: "Various",
          field_of_study: "Various",
          region: "",
          employment_date: "",
          new_salary: ""
        })),
        // North District
        ...Array(39).fill(null).map((_, i) => ({
          id: String(3000 + i),
          full_name: `North District Employee ${i+1}`,
          district: "North District",
          branch: "North Branch",
          current_position: "Various Positions",
          indpms25: Math.floor(Math.random() * 25),
          totalexp20: Math.floor(Math.random() * 20),
          tmdrec20: Math.floor(Math.random() * 20),
          disrec15: Math.floor(Math.random() * 15),
          total: Math.floor(Math.random() * 100),
          // Add required fields for Employee type
          file_number: `EMP${3000 + i}`,
          job_grade: "Various",
          job_category: "Various", 
          educational_level: "Various",
          field_of_study: "Various",
          region: "",
          employment_date: "",
          new_salary: ""
        }))
      ];

      // Set employees without any API calls or filtering
      setEmployees(sampleEmployees);
      setFilteredEmployees(sampleEmployees);
      
      // Calculate district stats
      const stats: {[key: string]: number} = {};
      sampleEmployees.forEach(emp => {
        const district = emp.district || "(No District)";
        stats[district] = (stats[district] || 0) + 1;
      });
      setDistrictStats(stats);
      
      // Clear any errors
      setError(null);
      setLoading(false);
      
      // Set emergency mode flag
      setEmergencyMode(true);
      
      toast({
        title: "Emergency Bypass Activated",
        description: `Loaded ${sampleEmployees.length} sample employees directly`,
      });
    } catch (error) {
      console.error("Error in emergency bypass:", error);
      toast({
        title: "Error",
        description: "Failed to load sample data",
        variant: "destructive",
      });
    }
  };

  const fetchEmployees = async (districtName: string | null) => {
    if (!districtName) {
      setError("No district found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get the token for authorization
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Make the API request with the district parameter and authorization header
      const response = await fetch(`/api/district/employees?district=${encodeURIComponent(districtName)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching employees: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log("API Response:", data); // Debug log
      
      // Set the employees data
      setEmployees(data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch district employees:", err);
      setError(`Failed to fetch employees: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          <p className="font-medium">Error</p>
          <p>{error}</p>
              </div>
      )}

      {/* Add debug controls */}
      <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded-md">
        <Button onClick={() => setShowAllEmployees(!showAllEmployees)} variant={showAllEmployees ? "destructive" : "outline"}>
          {showAllEmployees ? "Disable Show All" : "Show All Employees"}
        </Button>
        <Button onClick={loadEmployees} variant="outline">
          Reload Employees
        </Button>
        <Button onClick={displayTokenInfo} variant="outline">
          Inspect Token
        </Button>
        <Button onClick={emergencyBypass} variant="destructive">
          Emergency Bypass
        </Button>
        <div className="ml-auto text-xs text-gray-500 self-center">
          {userDistrict ? `District: ${userDistrict}` : 'No district assigned'} | 
          {employees.length} employees shown
                  </div>
                  </div>

      {showTokenInfo && (
        <div className="bg-yellow-50 border border-yellow-500 p-4 rounded-md mb-4">
          <div className="flex justify-between">
            <h3 className="font-bold">Token Information</h3>
            <button 
              onClick={() => setShowTokenInfo(false)}
              className="text-xs text-gray-500"
            >
              Close
            </button>
                  </div>
          <div className="mt-2 space-y-1 text-sm">
            <p><strong>User District:</strong> {userDistrict || "Not found in token"}</p>
            <p className="text-red-600">
              {!userDistrict && "WARNING: Your token does not contain a district value!"}
            </p>
            <div className="mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem("user") || "{}");
                  user.district = "Head Office";
                  localStorage.setItem("user", JSON.stringify(user));
                  toast({
                    title: "User Updated",
                    description: "Set district to Head Office in user object",
                  });
                }}
              >
                Fix User Object (Set to Head Office)
              </Button>
                  </div>
                  </div>
                </div>
      )}

      {/* Add this message in the return section, just below the debug controls */}
      {emergencyMode && (
        <div className="bg-amber-100 border-2 border-amber-500 p-4 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-amber-800">🚨 Emergency Mode Activated</h3>
            <Button variant="outline" size="sm" onClick={() => setEmergencyMode(false)}>
              Hide
            </Button>
                  </div>
          <p className="text-amber-800 mt-2">
            You are viewing sample data that was generated locally. This is not real data from the database.
            The data was created as a temporary solution until the API connection issues are resolved.
          </p>
          <p className="text-amber-800 mt-2">
            <strong>Note:</strong> Recommendations made in this mode will not be saved to the database.
          </p>
                  </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">District Employees</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="sm" onClick={loadEmployees}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={debugDistrictFiltering}>
            Debug
          </Button>
          <Button variant="destructive" size="sm" onClick={loadAllEmployees}>
            Hard Reset (Show All)
          </Button>
          <Button variant="outline" size="sm" className="bg-purple-100" onClick={checkBackendDirect}>
            Test Backend
          </Button>
                  </div>
                  </div>

      {/* Show success message when using all employees mode */}
      {showAllEmployees && 
        <div className="bg-green-50 border border-green-500 p-3 mb-4 rounded-md">
          <div className="flex justify-between">
              <div>
              <p className="text-sm text-green-800 font-medium">
                <span className="font-bold">Override Mode:</span> Showing all {employees.length} employees regardless of district.
              </p>
              <p className="text-sm text-green-800 mt-1">
                This is a temporary fix that bypasses district filtering.
              </p>
                  </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-green-500 hover:bg-green-100"
              onClick={() => {
                setShowAllEmployees(false);
                loadEmployees();
              }}
            >
              Return to normal mode
            </Button>
                </div>
              </div>
      }
      
      {/* If we still have no employees, show raw data counts */}
      {employees.length === 0 && rawEmployees.length > 0 &&
        <Card className="my-4 border-2 border-purple-500">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold mb-2">Raw Data Analysis</h3>
            <p className="text-sm mb-2">API returned {rawEmployees.length} employees but filtering removed all of them.</p>
            
            <div className="bg-gray-50 p-2 rounded text-sm mb-4">
              <strong>First few employee districts:</strong>
              <ul className="list-disc pl-5 mt-1">
                {rawEmployees.slice(0, 5).map((emp, index) => (
                  <li key={index}>
                    {typeof emp.district === 'object' 
                      ? (emp.district?.Valid ? emp.district.String : "NULL")
                      : emp.district || "undefined"}
                  </li>
                ))}
              </ul>
                  </div>
            
            <Button 
              className="w-full" 
              onClick={() => {
                setShowAllEmployees(true);
                setEmployees(rawEmployees.map(emp => ({
                  ...emp,
                  district: typeof emp.district === 'object' 
                    ? (emp.district?.Valid ? emp.district.String : "") 
                    : emp.district
                })));
                setFilteredEmployees(rawEmployees.map(emp => ({
                  ...emp,
                  district: typeof emp.district === 'object' 
                    ? (emp.district?.Valid ? emp.district.String : "") 
                    : emp.district
                })));
                setError(null);
              }}
            >
              Show All Raw Data
            </Button>
          </CardContent>
        </Card>
      }
      
      {/* Only show district selector here if we have employees and no error */}
      {employees.length > 0 && !error && !userDistrict && renderQuickDistrictSelect()}
      
      {/* Add a notice when Head Office is showing all employees */}
      {userDistrict === "Head Office" && employees.length > 0 && 
        <div className="bg-amber-50 border border-amber-200 p-3 mb-4 rounded-md">
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold">Head Office Mode:</span> Showing {employees.length} employees from all districts.
          </p>
          <p className="text-sm text-amber-800 mt-1">
            As a Head Office district manager, you have access to view employees across all districts.
          </p>
                  </div>
      }

      <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="high">High Performers (75%+)</TabsTrigger>
          <TabsTrigger value="medium">Medium Performers (50-74%)</TabsTrigger>
          <TabsTrigger value="low">Low Performers (0-49%)</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                  {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""} found
                </div>
                <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredEmployees.length === 0}>
                  <Download className="mr-2 h-4 w-4" /> Export to CSV
                </Button>
              </div>
              {renderEmployeeList(filteredEmployees)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="high" className="mt-2">
          <Card>
            <CardContent className="p-6">
              {renderEmployeeList(filteredEmployees)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="medium" className="mt-2">
          <Card>
            <CardContent className="p-6">
              {renderEmployeeList(filteredEmployees)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="low" className="mt-2">
          <Card>
            <CardContent className="p-6">
              {renderEmployeeList(filteredEmployees)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Details Dialog */}
      <Dialog open={!!viewingEmployee && !isRecommendModalOpen} onOpenChange={(open) => !open && setViewingEmployee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingEmployee?.full_name}</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Employee #:</span>
                  <span>{viewingEmployee.employee_number}</span>
                    </div>
                    <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Branch:</span>
                    <span>{viewingEmployee.branch}</span>
                    </div>
                    <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">District:</span>
                    <span>{viewingEmployee.district}</span>
                    </div>
                    <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Position:</span>
                  <span>{viewingEmployee.current_position}</span>
                    </div>
                    <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Employment Date:</span>
                  <span>
                    {viewingEmployee.employment_date 
                      ? new Date(viewingEmployee.employment_date).toLocaleDateString() 
                      : "N/A"}
                  </span>
                    </div>
                    <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Salary:</span>
                  <span>
                    {viewingEmployee.new_salary 
                      ? `$${(Number.parseInt(viewingEmployee.new_salary || "0")).toLocaleString()}` 
                      : "N/A"}
                  </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                <h3 className="text-lg font-semibold">Performance Scores</h3>
                    <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">IND PMS (25%):</span>
                      <span>{viewingEmployee.indpms25}</span>
                    </div>
                    <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Total Exp (20%):</span>
                      <span>{viewingEmployee.totalexp20}</span>
                    </div>
                    <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">TMD Rec (20%):</span>
                  <span>{viewingEmployee.tmdrec20}</span>
                  </div>
                    <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">DIS Rec (15%):</span>
                  <span>{viewingEmployee.disrec15}</span>
                </div>
                  <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Total Score:</span>
                  <span className="font-bold">{viewingEmployee.total}%</span>
                  </div>
                </div>
              
              <Button className="w-full" onClick={() => setIsRecommendModalOpen(true)}>
                Update Recommendation
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Recommendation Modal */}
      {viewingEmployee && (
        <DistrictRecommendationModal
          employee={viewingEmployee}
          isOpen={isRecommendModalOpen}
          onClose={() => {
            setIsRecommendModalOpen(false);
            setViewingEmployee(null);
          }}
          onRecommendationComplete={handleRecommendationComplete}
        />
      )}

      {/* Debug view */}
      {renderDebugView()}

      {/* Head Office fix warning */}
      {renderHeadOfficeFixWarning()}
    </div>
  );
}
