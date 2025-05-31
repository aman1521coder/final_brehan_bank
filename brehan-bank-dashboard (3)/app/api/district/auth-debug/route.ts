import { NextRequest, NextResponse } from 'next/server';

// This is a debugging endpoint to examine the exact token structure and headers
export async function GET(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization') || '';
  
  // Extract the token
  const tokenMatch = authHeader.match(/Bearer (.+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  
  if (!token) {
    return NextResponse.json(
      { 
        error: 'No token provided',
        headers: Object.fromEntries(request.headers),
      }, 
      { status: 401 }
    );
  }

  try {
    // Analyze token parts manually
    const tokenParts = token.split('.');
    
    return NextResponse.json({
      success: true,
      token_first_20_chars: token.substring(0, 20) + '...',
      token_parts: tokenParts.length,
      token_parts_length: tokenParts.map(part => part.length),
      // All request headers
      headers: Object.fromEntries(request.headers),
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Invalid token format',
      token_first_20_chars: token.substring(0, 20) + '...',
      message: error instanceof Error ? error.message : 'Unknown error',
      headers: Object.fromEntries(request.headers),
    }, { status: 400 });
  }
} 