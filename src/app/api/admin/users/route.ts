import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const [rows] = await pool.execute(`
      SELECT 
        id, name, email, role, is_active as isActive, 
        avatar, created_at as createdAt, last_login_at as lastLoginAt
      FROM users
      ORDER BY created_at DESC
    `);

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

    // Prevent admin from changing their own role
    if (session.user.id === String(userId) && session.user.role === 'admin' && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot change your own admin role' }, { status: 403 });
    }

    // Prevent promoting users to admin role
    if (role === 'admin') {
      return NextResponse.json({ error: 'Cannot promote users to admin role' }, { status: 403 });
    }

    // Prevent deactivating admin accounts
    if (role === 'admin' && !isActive) {
      return NextResponse.json({ error: 'Cannot deactivate admin accounts' }, { status: 403 });
    }

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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { userId } = await request.json();

    // Get user info before deletion for logging
    const [userRows] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );
    const userToDelete = (userRows as any[])[0];

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of admin accounts
    if (userToDelete.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin accounts' }, { status: 403 });
    }

    // Log the activity BEFORE deleting user
    await pool.execute(
      `INSERT INTO admin_activity_logs 
        (admin_id, action, target_user_id, description, metadata, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        session.user.id,
        'DELETE_USER',
        userId,
        `Deleted user ${userToDelete.name} (${userToDelete.email})`,
        JSON.stringify({ deletedUser: userToDelete }),
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown',
      ]
    );

    // Delete user AFTER logging
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ 
      message: 'User deleted successfully',
      deletedUser: userToDelete 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}