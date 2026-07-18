import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false }, { status: 200 });
    }

    const sessionUser = verifyToken(token);
    if (!sessionUser) {
      return NextResponse.json({ loggedIn: false }, { status: 200 });
    }

    // Find if the user has a waitlist entry
    const entry = await db.waitlistEntry.findUnique({
      where: { userId: sessionUser.userId },
    });

    if (entry) {
      return NextResponse.json({
        loggedIn: true,
        hasSubmitted: true,
        entry: {
          id: entry.id,
          fullName: entry.fullName,
          email: entry.email,
          phoneNumber: entry.phoneNumber,
          interestReason: entry.interestReason,
          useCase: entry.useCase,
          emailStatus: entry.emailStatus,
          phoneStatus: entry.phoneStatus,
          createdAt: entry.createdAt,
        },
      });
    }

    return NextResponse.json({
      loggedIn: true,
      hasSubmitted: false,
      user: {
        email: sessionUser.email,
        name: sessionUser.name,
      },
    });
  } catch (error: any) {
    console.error('Waitlist status check error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
