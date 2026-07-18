import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || 'user'; // 'user' or 'admin'

    if (!code) {
      return NextResponse.redirect(new URL('/auth/login?error=no_code', req.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured');
      return NextResponse.redirect(new URL('/auth/login?error=server_config', req.url));
    }

    // Construct redirect URI dynamically (must match the redirect URI sent in auth init)
    const origin = new URL(req.url).origin;
    const redirectUri = `${origin}/api/auth/callback/google`;

    // 1. Exchange authorisation code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(new URL('/auth/login?error=token_exchange', req.url));
    }

    // 2. Fetch user profile info
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok || !profileData.email) {
      console.error('Failed to fetch user profile:', profileData);
      return NextResponse.redirect(new URL('/auth/login?error=profile_fetch', req.url));
    }

    const email = profileData.email.toLowerCase();
    const name = profileData.name || null;

    // 3. Handle Admin Authorization Gate
    if (state === 'admin') {
      if (!adminEmail || email !== adminEmail.toLowerCase()) {
        console.warn(`Unauthorized admin login attempt by ${email}`);
        return NextResponse.redirect(new URL('/admin/unauthorized', req.url));
      }

      // Predefined admin logs in -> upsert user as admin
      const adminUser = await db.user.upsert({
        where: { email },
        update: { name },
        create: {
          email,
          name,
          authMethod: 'google',
        },
      });

      const token = signToken({
        userId: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: 'admin',
      });

      const cookieStore = await cookies();
      cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours for admin session
      });

      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    // 4. Handle User Authorization Flow
    // Prevent Google login if they signed up using credentials (email/password)
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.authMethod === 'credentials') {
      return NextResponse.redirect(
        new URL('/auth/login?error=method_mismatch', req.url)
      );
    }

    // Create or update normal user
    const user = await db.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        authMethod: 'google',
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'user',
    });

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.redirect(new URL('/apply', req.url));
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', req.url));
  }
}
