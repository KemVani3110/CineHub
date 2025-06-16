import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

if (!TMDB_API_KEY || !TMDB_BASE_URL) {
  throw new Error('TMDB API configuration is missing');
}

export async function GET(
  request: Request,
  { params }: { params: { listType: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';

    console.log('Fetching movies:', {
      listType: params.listType,
      page,
      url: `${TMDB_BASE_URL}/movie/${params.listType}`
    });

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${params.listType}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('TMDB API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: response.url
      });
      return NextResponse.json(
        { error: 'Failed to fetch movies', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in movies API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 