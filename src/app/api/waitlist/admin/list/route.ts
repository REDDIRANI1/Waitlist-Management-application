import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    // 1. Verify admin session
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = verifyToken(token);
    const adminEmail = process.env.ADMIN_EMAIL;

    if (
      !sessionUser ||
      sessionUser.role !== 'admin' ||
      !adminEmail ||
      sessionUser.email.toLowerCase() !== adminEmail.toLowerCase()
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse search parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    // 3. Build query filter
    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 4. Fetch entries with linked User auth method
    const entries = await db.waitlistEntry.findMany({
      where,
      include: {
        user: {
          select: {
            authMethod: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 5. Map entries to return clean format
    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      fullName: entry.fullName,
      phoneNumber: entry.phoneNumber,
      email: entry.email,
      interestReason: entry.interestReason,
      useCase: entry.useCase,
      createdAt: entry.createdAt,
      authMethod: entry.user?.authMethod || 'credentials',
      emailStatus: entry.emailStatus,
      phoneStatus: entry.phoneStatus,
    }));

    return NextResponse.json({ success: true, entries: formattedEntries });
  } catch (error: any) {
    console.error('Admin entries list fetch error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
