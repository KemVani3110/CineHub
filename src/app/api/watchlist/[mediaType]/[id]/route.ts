import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: { mediaType: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { mediaType, id } = params;

    await db.query(
      `DELETE FROM watchlist 
       WHERE user_id = ? 
       AND ${mediaType === 'movie' ? 'movie_id' : 'tv_id'} = ?`,
      [session.user.id, parseInt(id)]
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 