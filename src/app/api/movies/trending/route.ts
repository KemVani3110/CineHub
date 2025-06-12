import { NextResponse } from 'next/server';

// Get environment variables
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

if (!TMDB_API_KEY || !TMDB_BASE_URL) {
  console.error('Missing required environment variables:', {
    TMDB_API_KEY: !!TMDB_API_KEY,
    TMDB_BASE_URL: !!TMDB_BASE_URL
  });
}

export async function GET() {
  try {
    // Validate environment variables
    if (!TMDB_API_KEY || !TMDB_BASE_URL) {
      throw new Error('TMDB API configuration is missing. Please check your environment variables.');
    }

    // Construct the API URL
    const url = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&language=en-US`;
    
    // Make the request to TMDB API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        response: errorText
      });
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    // Parse the response
    const data = await response.json();

    // Validate the response data
    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid TMDB API response:', data);
      throw new Error('Invalid response format from TMDB API');
    }

    // Return the successful response
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    // Log the error
    console.error('Error in trending movies API:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to fetch trending movies',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 