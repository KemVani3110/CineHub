import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const [result] = await db.query(
      `INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        is_active,
        provider
      ) VALUES (?, ?, ?, 'user', true, 'local')`,
      [name, email, passwordHash]
    );

    const userId = result.insertId;

    // Create default user preferences
    await db.query(
      `INSERT INTO user_preferences (
        user_id,
        language,
        notifications_email,
        notifications_push,
        notifications_recommendations,
        notifications_new_releases,
        privacy_show_watchlist,
        privacy_show_ratings,
        privacy_show_activity
      ) VALUES (?, 'en', true, true, true, true, true, true, true)`,
      [userId]
    );

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: userId,
          name,
          email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 