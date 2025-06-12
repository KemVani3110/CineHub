import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const action = searchParams.get('action') || '';

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        l.*,
        a.name as admin_name,
        a.email as admin_email,
        u.name as target_user_name,
        u.email as target_user_email
      FROM admin_activity_logs l
      LEFT JOIN users a ON l.admin_id = a.id
      LEFT JOIN users u ON l.target_user_id = u.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (search) {
      query += `
        AND (
          a.name LIKE ? OR
          a.email LIKE ? OR
          u.name LIKE ? OR
          u.email LIKE ? OR
          l.description LIKE ?
        )
      `;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (startDate) {
      query += ' AND l.created_at >= ?';
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ' AND l.created_at <= ?';
      queryParams.push(endDate);
    }

    if (action) {
      query += ' AND l.action = ?';
      queryParams.push(action);
    }

    // Get total count
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM (${query}) as filtered`,
      queryParams
    );
    const total = (countRows as any[])[0].total;

    // Get paginated results
    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [logs] = await pool.execute(query, queryParams);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 