import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
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

    // 2. Parse request body
    const { entryId, field, status } = await req.json();

    if (!entryId || !field || !status) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    if (field !== 'emailStatus' && field !== 'phoneStatus') {
      return NextResponse.json({ error: 'Invalid field parameter.' }, { status: 400 });
    }

    if (status !== 'valid' && status !== 'invalid' && status !== 'approved') {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    // 3. Update entry in database
    const updatedEntry = await db.waitlistEntry.update({
      where: { id: entryId },
      data: {
        [field]: status,
      },
    });

    return NextResponse.json({ success: true, entry: updatedEntry });
  } catch (error: any) {
    console.error('Admin status update error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
