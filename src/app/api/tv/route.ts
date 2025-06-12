import { NextRequest, NextResponse } from 'next/server';
import { TMDB_API_KEY, TMDB_BASE_URL } from '@/services/tmdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listType = searchParams.get('listType') || 'popular';
    const page = searchParams.get('page') || '1';

    ('TV API Route - Received params:', { listType, page });

    const url = `${TMDB_BASE_URL}/tv/${listType}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    ('Fetching from URL:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    (`Successfully fetched TV shows data for ${listType}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TV shows' },
      { status: 500 }
    );
  }
} 