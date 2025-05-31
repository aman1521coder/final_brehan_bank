// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register']

// Static assets and public paths
const staticPaths = ['/_next', '/favicon.ico', '/images']

export function middleware(request: NextRequest) {
  console.log('Middleware executing for path:', request.nextUrl.pathname)
  
  // Skip middleware for static files and public API endpoints
  const pathMatches = (patterns: string[]) => patterns.some(p => request.nextUrl.pathname.startsWith(p))
  
  if (pathMatches(staticPaths)) {
    console.log('Static path, skipping auth check')
    return NextResponse.next()
  }
  
  if (pathMatches(publicPaths)) {
    console.log('Public path, skipping auth check')
    return NextResponse.next()
  }
  
  // Allow access to debugging pages
  if (request.nextUrl.pathname === '/auth-test') {
    console.log('Auth test page, allowing access')
    return NextResponse.next()
  }

  // Check for token in cookies
  const token = request.cookies.get('token')?.value
  
  // Debug token
  if (token) {
    console.log('Token in middleware:', `${token.substring(0, 15)}...`)
  } else {
    console.log('No token found in middleware')
  }
  
  // If no token, redirect to login
  if (!token) {
    console.log('Redirecting to login due to missing token')
    
    // Check for redirection loop
    const referer = request.headers.get('referer') || ''
    
    // If we're coming from login, don't redirect back to login
    if (referer.includes('/login')) {
      console.log('Detected potential redirect loop, allowing through')
      return NextResponse.next()
    }
    
    // Use 307 temporary redirect to preserve HTTP method
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Token exists, continue to the requested page
  console.log('Token validated, allowing access')
  
  // For API requests, forward the token in the Authorization header
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // For CORS preflight requests, just return immediately with proper headers
    if (request.method === 'OPTIONS') {
      console.log('OPTIONS preflight request - responding with CORS headers');
      const response = NextResponse.next();
      
      response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-District');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400');
      
      return response;
    }
    
    // Special handling for district API endpoints
    if (request.nextUrl.pathname.startsWith('/api/district/')) {
      console.log('District API request detected:', request.nextUrl.pathname);
      
      // For direct API requests, forward the token and district
      const token = request.cookies.get('token')?.value;
      const district = request.cookies.get('district')?.value;
      
      console.log('Token for district API:', token ? `${token.substring(0, 15)}...` : 'missing');
      console.log('District cookie value:', district || 'missing');
      
      if (!token) {
        console.log('No token for district API - returning 401');
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const headers = new Headers(request.headers);
      headers.set('Authorization', `Bearer ${token.trim()}`);
      
      if (district) {
        headers.set('X-District', district);
      }
      
      // Add CORS headers directly
      headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
      headers.set('Access-Control-Allow-Credentials', 'true');
      
      return NextResponse.next({
        request: {
          headers,
        },
      });
    }
    
    const headers = new Headers(request.headers);
    
    // Ensure proper Bearer token format
    headers.set('Authorization', `Bearer ${token.trim()}`);
    
    // Add district header if present in cookies
    const district = request.cookies.get('district')?.value;
    if (district && (request.nextUrl.pathname.includes('/district/'))) {
      console.log('Adding district header from cookie:', district);
      headers.set('X-District', district);
    }
    
    console.log('Adding Authorization header to API request');
    
    return NextResponse.next({
      request: {
        headers,
      },
    });
  }

  return NextResponse.next()
}

// Only match these paths - excluding static files and api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images/ (static image files)
     * - favicon.ico (favicon file)
     * - fonts/ (static font files)
     */
    "/((?!api/|_next/static|_next/image|images/|favicon.ico|fonts/).*)",
  ],
};