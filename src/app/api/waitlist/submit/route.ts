import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { validateEmailFormatAndDomain, validatePhone } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const sessionUser = verifyToken(token);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
    }

    // 2. Parse request body
    const { fullName, phoneNumber, interestReason, useCase } = await req.json();

    if (!fullName || !phoneNumber || !interestReason || !useCase) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // 3. Strict format and duplication checks
    const userEmail = sessionUser.email.toLowerCase();

    // Check duplicate waitlist entry for this user / email
    const existingEntryByEmail = await db.waitlistEntry.findUnique({
      where: { email: userEmail },
    });

    if (existingEntryByEmail) {
      return NextResponse.json(
        { error: 'You have already submitted an early access request with this email.' },
        { status: 400 }
      );
    }

    // Validate phone number format and get normalized value
    const phoneValidation = validatePhone(phoneNumber);
    if (!phoneValidation.valid || !phoneValidation.normalized) {
      return NextResponse.json({ error: phoneValidation.reason }, { status: 400 });
    }

    const normalizedPhone = phoneValidation.normalized;

    // Check duplicate phone number
    const existingEntryByPhone = await db.waitlistEntry.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (existingEntryByPhone) {
      return NextResponse.json(
        { error: 'This phone number is already registered on the waitlist.' },
        { status: 400 }
      );
    }

    // 4. Perform Advanced/Logical verification checks
    // Email domain lookup validation
    const emailValidation = await validateEmailFormatAndDomain(userEmail);
    const emailStatus = emailValidation.valid ? 'valid' : 'invalid';

    // Phone logical checks (already parsed in validatePhone, but let's check for warnings)
    // In our validator, repeating/sequential digits fail `validatePhone.valid`,
    // but if we want to allow it as "invalid status" instead of hard blocking,
    // we can restructure. However, hard-blocking sequential/repeating digits is standard.
    // Let's set phoneStatus to 'valid' by default as the validator passed.
    // If the admin wants to approve, they can.
    const phoneStatus = 'valid';

    // 5. Save submission to database
    const newEntry = await db.waitlistEntry.create({
      data: {
        userId: sessionUser.userId,
        fullName,
        phoneNumber: normalizedPhone,
        email: userEmail,
        interestReason,
        useCase,
        emailStatus,
        phoneStatus,
      },
    });

    return NextResponse.json({
      success: true,
      entry: newEntry,
    });
  } catch (error: any) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
