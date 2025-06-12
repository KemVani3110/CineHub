import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { compare, hash } from 'bcrypt';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, email, currentPassword, newPassword } = await req.json();

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update basic info if provided
      if (name || email) {
        const [result] = await connection.execute(
          'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
          [name, email, session.user.id]
        );
      }

      // Update password if provided
      if (currentPassword && newPassword) {
        // Verify current password
        const [rows] = await connection.execute(
          'SELECT password_hash FROM users WHERE id = ?',
          [session.user.id]
        );
        const users = rows as any[];

        if (users.length === 0) {
          throw new Error('User not found');
        }

        const isValid = await compare(currentPassword, users[0].password_hash);
        if (!isValid) {
          throw new Error('Current password is incorrect');
        }

        // Hash and update new password
        const hashedPassword = await hash(newPassword, 10);
        await connection.execute(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [hashedPassword, session.user.id]
        );
      }

      await connection.commit();

      return NextResponse.json({
        message: 'Profile updated successfully',
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar, role, created_at, last_login_at FROM users WHERE id = ?',
      [session.user.id]
    );
    const users = rows as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: users[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { message: 'Failed to get profile' },
      { status: 500 }
    );
  }
} 