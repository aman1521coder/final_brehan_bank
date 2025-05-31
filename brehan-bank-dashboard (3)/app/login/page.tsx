// pages/login.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, User } from "lucide-react";
// Import our API helper from JS file using dynamic import to avoid TypeScript errors
import { authAPI, debugToken } from "@/lib/api.js";
import { toast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import Link from "next/link";
import DebugLogin from "./debug-login";

// Define types for the response
interface LoginUser {
  id: string;
  name: string;
  role: string;
  district?: string;
}

interface LoginResponse {
  token: string;
  user: LoginUser;
}

// List of districts
const DISTRICTS = [
  "East District",
  "East Addis District",
  "West District",
  "West Addis District",
  "North District",
  "North Addis District",
  "South District",
  "South Addis District",
  "Central Ethiopia ",
  "Head Office",
];

// API base URL for your backend authentication service
const API_BASE_URL = "http://localhost:8080";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    district: "",
    role: "manager" // Default role selection
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);

  // Handle redirect after successful login
  useEffect(() => {
    if (redirect) {
      console.log("Redirecting to:", redirect);
      router.push(redirect);
    }
  }, [redirect, router]);

  // Add error message display from localStorage in useEffect
  useEffect(() => {
    const authError = localStorage.getItem("authError");
    if (authError) {
      setError(authError);
      // Clear the error after displaying it
      localStorage.removeItem("authError");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Sending login request to:", `${API_BASE_URL}/api/auth/login`);
      
      // Include district in the API request payload if selected
      const requestPayload = {
        name: formData.name,
        password: formData.password,
        role: formData.role,
        // Include district in the request if provided
        ...(formData.district && { district: formData.district }),
      };
      
      console.log("Login payload:", { ...requestPayload, password: "*****" });
      
      // Direct API call to avoid type issues
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });
      
      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Login successful, response:", data);
      
      if (!data || !data.token || !data.user) {
        throw new Error("Invalid response format from server");
      }
      
      const { token, user } = data;
      const role = user.role;
      
      console.log("Login successful as", role, "with user data:", user);

      // Store token in localStorage WITHOUT Bearer prefix so token validation works correctly
      localStorage.setItem('token', token); // Store raw token without Bearer prefix
      
      // Also store bearer-prefixed token for API calls if needed by some components
      localStorage.setItem('bearer_token', `Bearer ${token}`);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify({
        ...user,
        district: formData.district || user.district || "" // Ensure district is stored in user object
      }));

      // Set clean token (without Bearer) in cookie for middleware
      Cookies.set("token", token, { 
        expires: 7, 
        path: '/',
        sameSite: 'lax'
      });
      
      // After a successful login for district manager, add district to cookies too
      if ((role === "district_manager" || role === "district") && (formData.district || user.district)) {
        const districtValue = formData.district || user.district || "";
        console.log("Setting district cookie and localStorage:", districtValue);
        
        // Set in both cookies and localStorage for redundancy
        Cookies.set("district", districtValue, { 
          expires: 7, 
          path: '/',
          sameSite: 'lax'
        });
        
        localStorage.setItem('district', districtValue);
      }

      // Show success toast
      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Determine redirect path based on role
      let redirectPath: string;
      if (role === "admin") {
        redirectPath = "/admin/dashboard";
      } else if (role === "manager") {
        redirectPath = "/manager/dashboard";
      } else if (role === "district_manager" || role === "district") {
        redirectPath = "/district/dashboard";
      } else {
        setError("Invalid user role");
        setLoading(false);
        return;
      }

      // Set the redirect path which will trigger the useEffect
      setRedirect(redirectPath);
    } catch (err: any) {
      // Handle login error
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Invalid name or password";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-center text-amber-800">Brehan Bank</h1>
          <h2 className="text-xl text-center mt-2 text-amber-600">Management System</h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-amber-700 mb-1">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-amber-500" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-amber-50"
                required
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-amber-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-amber-500" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-amber-50"
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-amber-700 mb-1">
              Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-amber-500" />
              </div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-amber-50"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="district_manager">District Manager</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-amber-700 mb-1">
              District (for District Managers)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-amber-500" />
              </div>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-amber-50"
              >
                <option value="">Select your district (optional)</option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-md disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-amber-700">Brehan Bank Employee Management System</p>
          <p className="text-xs text-amber-500 mt-2">
            Demo credentials: admin/admin123, manager/manager123, district/district123
          </p>
        </div>
      </div>
      
      {/* Add auth debug link */}
      <div className="fixed bottom-4 right-4">
        <Link href="/auth-test" className="text-xs text-amber-600 hover:text-amber-800">
          Auth Test
        </Link>
      </div>
    </div>
  );
}