import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      ("API - No session");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      ("API - Not admin");
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    ("API - Fetching users");
    const [rows] = await pool.execute(`
      SELECT 
        id, name, email, role, is_active as isActive, 
        avatar, created_at as createdAt, last_login_at as lastLoginAt
      FROM users
      ORDER BY created_at DESC
    `);

    ("API - Users fetched:", rows);
    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { userId, role, isActive } = await request.json();

    await pool.execute(
      'UPDATE users SET role = ?, is_active = ? WHERE id = ?',
      [role, isActive, userId]
    );

    const [rows] = await pool.execute(
      `SELECT 
        id, name, email, role, is_active as isActive, 
        avatar, created_at as createdAt, last_login_at as lastLoginAt
      FROM users WHERE id = ?`,
      [userId]
    );
    const updatedUser = (rows as any[])[0];

    // Log the activity
    await pool.execute(
      `INSERT INTO admin_activity_logs 
        (admin_id, action, target_user_id, description, metadata, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        session.user.id,
        'UPDATE_USER',
        userId,
        `Updated user ${updatedUser.name} (${updatedUser.email})`,
        JSON.stringify({ role, isActive }),
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown',
      ]
    );

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 