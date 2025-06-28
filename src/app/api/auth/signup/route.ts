import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, company, plan } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !company) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Set plan limits
    const planLimits = {
      free: 3,
      basic: 25,
      pro: 250,
      enterprise: 5000
    };

    const analysesLimit = planLimits[plan as keyof typeof planLimits] || 3;

    // Use AuthService to register user
    const result = await AuthService.register(email, password, firstName, lastName, company);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Log the signup event
    console.log(`New ${plan || 'free'} signup: ${email} - ${firstName} ${lastName} (${company})`);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: result.user
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 