import { NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    
    // Try to ping the backend - we'll try a few common endpoints
    const endpoints = [
      '/api/v1/health',
      '/api/v1/status',
      '/api/v1/ping',
      '/api/v1/auth/authenticate'  // The endpoint we're actually using
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${EXTERNAL_API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          accessible: true
        });
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
          accessible: false
        });
      }
    }
    
    // Also test with a POST to the auth endpoint
    try {
      const authTestResponse = await fetch(`${EXTERNAL_API_BASE_URL}/api/v1/auth/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'test', password: 'test' }),
      });
      
      results.push({
        endpoint: '/auth/authenticate (POST)',
        status: authTestResponse.status,
        statusText: authTestResponse.statusText,
        headers: Object.fromEntries(authTestResponse.headers.entries()),
        accessible: true,
        note: 'Expected to fail authentication, but server should respond'
      });
    } catch (error) {
      results.push({
        endpoint: '/auth/authenticate (POST)',
        error: error instanceof Error ? error.message : 'Unknown error',
        accessible: false
      });
    }
    
    return NextResponse.json({
      backendUrl: EXTERNAL_API_BASE_URL,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Backend health check failed:', error);
    return NextResponse.json(
      { 
        error: 'Backend health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
