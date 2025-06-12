import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { NextAuthSession } from '@/types/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as NextAuthSession | null;
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total users count
    const [userCountRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM users'
    );
    const totalUsers = (userCountRows as any[])[0].total;

    // Get active users count
    const [activeUserCountRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM users WHERE is_active = true'
    );
    const activeUsers = (activeUserCountRows as any[])[0].total;

    // Get users by role
    const [roleCountRows] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    const usersByRole = (roleCountRows as any[]).reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.role] = row.count;
        return acc;
      },
      {}
    );

    // Get recent activity
    const [recentActivityRows] = await pool.execute(
      `SELECT 
        l.*,
        a.name as admin_name,
        a.email as admin_email,
        u.name as target_user_name,
        u.email as target_user_email
      FROM admin_activity_logs l
      LEFT JOIN users a ON l.admin_id = a.id
      LEFT JOIN users u ON l.target_user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 5`
    );

    // Get activity by type
    const [activityTypeRows] = await pool.execute(
      'SELECT action, COUNT(*) as count FROM admin_activity_logs GROUP BY action'
    );
    const activityByType = (activityTypeRows as any[]).reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.action] = row.count;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      totalUsers,
      activeUsers,
      usersByRole,
      recentActivity: recentActivityRows,
      activityByType,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 