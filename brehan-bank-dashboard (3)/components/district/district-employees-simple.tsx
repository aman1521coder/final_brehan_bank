"use client"

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Eye, FileCheck, Search, MoreHorizontal } from "lucide-react";
import { getUserDistrict } from "@/lib/auth";
import { getDistrictFromAllSources, debugDistrictInfo } from "@/lib/district-auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DistrictRecommendationForm } from "./district-recommendation-form";
import { useToast } from "@/hooks/use-toast";

// Define the Employee type
interface Employee {
  id: string | number;
  full_name: string;
  file_number?: string;
  new_position?: string;
  current_position?: string;
  district?: string;
  branch?: string;
  department?: string;
  employee_number?: string;
  job_grade?: string;
  indpms25?: number;
  totalexp20?: number;
  tmdrec20?: number;
  disrec15?: number;
  total?: number;
}

export function DistrictEmployeesSimple() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<'all' | 'needs-review' | 'has-recommendation' | 'high-score'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRecommendDialogOpen, setIsRecommendDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get the user's district from multiple sources
    const userDistrict = getDistrictFromAllSources();
    setDistrict(userDistrict);
    
    // Debug district information
    console.log("District Info:", debugDistrictInfo());
    
    if (!userDistrict) {
      setError("No district found. Please log in again with a district selection.");
      setLoading(false);
      return;
    }

    // Fetch employees for the district
    fetchEmployees(userDistrict);
  }, []);

  useEffect(() => {
    // Filter employees based on search query and filter mode
    if (employees.length > 0) {
      const filtered = employees.filter(employee => {
        // Filter by search query
        const matchesSearch = 
          !searchQuery ||
          (employee.full_name && employee.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.file_number && employee.file_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.new_position && employee.new_position.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.branch && employee.branch.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filter by recommendation status
        if (filterMode === 'needs-review') {
          return matchesSearch && (!employee.disrec15 || Number(employee.disrec15) === 0);
        } else if (filterMode === 'has-recommendation') {
          return matchesSearch && employee.disrec15 && Number(employee.disrec15) > 0;
        } else if (filterMode === 'high-score') {
          return matchesSearch && employee.disrec15 && Number(employee.disrec15) > 10; // High district recommendation score
        }
        
        return matchesSearch; // 'all' mode shows all employees matching search
      });
      
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
    }
  }, [employees, searchQuery, filterMode]);

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
      
      // Ensure token has proper Bearer prefix for API calls
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log("Using auth token (first 20 chars):", formattedToken.substring(0, 20) + "...");

      // Make the API request with the district parameter and authorization header
      const response = await fetch(`/api/district/employees?district=${encodeURIComponent(districtName)}`, {
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
          'X-District': districtName, // Add district in headers too for redundancy
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching employees: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log
      
      // Transform the data if needed to handle SQL.Null* values
      const transformedData = data.map((emp: any) => ({
        id: emp.id,
        full_name: typeof emp.full_name === 'object' ? 
          (emp.full_name?.Valid ? emp.full_name.String : "") : emp.full_name || "",
        file_number: emp.file_number || "",
        new_position: typeof emp.new_position === 'object' ? 
          (emp.new_position?.Valid ? emp.new_position.String : "") : 
          (emp.current_position || ""),
        current_position: typeof emp.current_position === 'object' ? 
          (emp.current_position?.Valid ? emp.current_position.String : "") : emp.current_position || "",
        district: typeof emp.district === 'object' ? 
          (emp.district?.Valid ? emp.district.String : "") : emp.district || "",
        branch: typeof emp.branch === 'object' ? 
          (emp.branch?.Valid ? emp.branch.String : "") : emp.branch || "",
        department: typeof emp.department === 'object' ? 
          (emp.department?.Valid ? emp.department.String : "") : emp.department || "",
        job_grade: typeof emp.job_grade === 'object' ?
          (emp.job_grade?.Valid ? emp.job_grade.String : "") : emp.job_grade || "",
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

      // Set the employees data
      setEmployees(transformedData || []);
      setFilteredEmployees(transformedData || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch district employees:", err);
      setError(`Failed to fetch employees: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleRecommendEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsRecommendDialogOpen(true);
  };

  const handleRecommendationSuccess = () => {
    setIsRecommendDialogOpen(false);
    // Refresh employee data
    fetchEmployees(district);
    toast({
      title: "Recommendation Updated",
      description: "The district recommendation was successfully updated",
    });
  };

  // Function to export employees to CSV
  const exportToCSV = () => {
    if (filteredEmployees.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no employees matching your current filters.",
        variant: "destructive",
      });
      return;
    }

    // Define CSV headers
    const headers = [
      "ID",
      "File Number",
      "Name",
      "Position",
      "Department",
      "Branch",
      "Grade",
      "District",
      "IND PMS (25%)",
      "Total EXP (20%)",
      "TMD Rec (20%)",
      "District Rec (15%)",
      "Total Score"
    ];

    // Convert employee data to CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...filteredEmployees.map((employee) => {
        return [
          employee.id,
          employee.file_number || "",
          `"${employee.full_name || ""}"`, // Quotes to handle names with commas
          `"${employee.new_position || employee.current_position || ""}"`,
          `"${employee.department || ""}"`,
          `"${employee.branch || ""}"`,
          employee.job_grade || "",
          `"${employee.district || ""}"`,
          employee.indpms25 || "0",
          employee.totalexp20 || "0",
          employee.tmdrec20 || "0",
          employee.disrec15 || "0",
          employee.total || "0"
        ].join(",");
      })
    ];

    // Create CSV content
    const csvContent = csvRows.join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `district-employees-${district}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${filteredEmployees.length} employees exported to CSV.`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchEmployees(district)}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex justify-between items-center">
          <span>{district ? `Employees in ${district}` : 'District Employees'}</span>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchEmployees(district)}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Display token debugging information
                const token = localStorage.getItem('token');
                const tokenInfo = {
                  raw: token ? token.substring(0, 20) + '...' : 'Not found',
                  hasBearer: token ? token.startsWith('Bearer ') : false,
                  length: token ? token.length : 0,
                  district: district,
                };
                console.log('Token debug info:', tokenInfo);
                
                // Also show parsed JWT if possible
                try {
                  // Properly handle Bearer prefix
                  const cleanToken = token?.startsWith('Bearer ') ? token.substring(7) : token;
                  
                  // Split the token into parts
                  if (cleanToken) {
                    const parts = cleanToken.split('.');
                    if (parts.length === 3) {
                      // Decode the middle part (payload)
                      const payload = JSON.parse(atob(parts[1]));
                      console.log('Decoded token payload:', payload);
                    } else {
                      console.error('Invalid token format - should have 3 parts:', parts.length);
                    }
                  }
                } catch (e) {
                  console.error('Error decoding token:', e);
                }
                
                // Display with toast
                toast({
                  title: "Token Information",
                  description: `Token found: ${token ? 'Yes' : 'No'}, Has Bearer: ${tokenInfo.hasBearer}, District: ${district || 'None'}`
                });
              }}
            >
              Debug Auth
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, position, department..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 rounded-md p-0.5">
              <Button 
                variant={filterMode === 'all' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setFilterMode('all')}
                className="text-xs px-2"
              >
                All Employees
              </Button>
              <Button 
                variant={filterMode === 'needs-review' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setFilterMode('needs-review')}
                className="text-xs px-2"
              >
                Needs District Rec
              </Button>
              <Button 
                variant={filterMode === 'has-recommendation' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setFilterMode('has-recommendation')}
                className="text-xs px-2"
              >
                Has Recommendation
              </Button>
              <Button 
                variant={filterMode === 'high-score' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setFilterMode('high-score')}
                className="text-xs px-2"
              >
                High Score ({'>'}10)
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">No employees found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>File #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>TMD Rec</TableHead>
                  <TableHead>District Rec (15%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow 
                    key={employee.id}
                    className={!employee.disrec15 || Number(employee.disrec15) === 0 ? "bg-amber-50" : ""}
                  >
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell>{employee.file_number}</TableCell>
                    <TableCell className="font-medium">{employee.full_name}</TableCell>
                    <TableCell>{employee.new_position || employee.current_position}</TableCell>
                    <TableCell>{employee.branch}</TableCell>
                    <TableCell>
                      {employee.tmdrec20 && Number(employee.tmdrec20) > 0 ? (
                        <Badge variant={Number(employee.tmdrec20) > 15 ? "default" : "secondary"}>
                          {employee.tmdrec20}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">Not Set</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.disrec15 && Number(employee.disrec15) > 0 ? (
                        <Badge variant={Number(employee.disrec15) > 10 ? "default" : "secondary"} className={Number(employee.disrec15) > 10 ? "bg-green-600" : ""}>
                          {employee.disrec15}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-500 border-red-300">Not Set</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.disrec15 && Number(employee.disrec15) > 0 ? (
                        <Badge className={Number(employee.disrec15) > 10 ? "bg-green-600" : "bg-blue-600"}>
                          {Number(employee.disrec15) > 10 ? "District Highly Recommended" : "District Recommended"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                          Needs District Recommendation
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRecommendEmployee(employee)}>
                            <FileCheck className="mr-2 h-4 w-4" />
                            {employee.disrec15 && Number(employee.disrec15) > 0 
                              ? "Update Recommendation" 
                              : "Provide Recommendation"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Personal Information</h3>
                  <p>
                    <span className="font-medium">ID:</span> {selectedEmployee.id}
                  </p>
                  <p>
                    <span className="font-medium">Name:</span> {selectedEmployee.full_name}
                  </p>
                  <p>
                    <span className="font-medium">File Number:</span> {selectedEmployee.file_number}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Job Information</h3>
                  <p>
                    <span className="font-medium">Department:</span> {selectedEmployee.department}
                  </p>
                  <p>
                    <span className="font-medium">Branch:</span> {selectedEmployee.branch}
                  </p>
                  <p>
                    <span className="font-medium">District:</span> {selectedEmployee.district}
                  </p>
                  <p>
                    <span className="font-medium">Position:</span> {selectedEmployee.new_position || selectedEmployee.current_position}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Evaluation Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p>
                    <span className="font-medium">Individual PMS (25%):</span> {selectedEmployee.indpms25 || 0}
                  </p>
                  <p>
                    <span className="font-medium">Total Experience (20%):</span> {selectedEmployee.totalexp20 || 0}
                  </p>
                  <p>
                    <span className="font-medium">TMD Rec (20%):</span> {selectedEmployee.tmdrec20 || "Not yet provided"}
                  </p>
                  <p>
                    <span className="font-medium">District Rec (15%):</span> {selectedEmployee.disrec15 || "Not yet provided"}
                  </p>
                  <p>
                    <span className="font-medium">Total Score:</span> {selectedEmployee.total || "Incomplete"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleRecommendEmployee(selectedEmployee);
                }}>
                  Provide Recommendation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Recommendation Dialog */}
      <Dialog open={isRecommendDialogOpen} onOpenChange={setIsRecommendDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>District Recommendation</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <DistrictRecommendationForm
              employee={selectedEmployee as any}
              onSuccess={handleRecommendationSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 