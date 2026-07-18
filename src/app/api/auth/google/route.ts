import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('target') || 'user'; // 'user' or 'admin'

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google Client ID is not configured in the environment variables.' },
        { status: 500 }
      );
    }

    // Resolve current origin dynamically for the redirect URI
    const urlObj = new URL(req.url);
    const origin = urlObj.origin;
    const redirectUri = `${origin}/api/auth/callback/google`;

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('openid email profile')}` +
      `&state=${encodeURIComponent(target)}` +
      `&prompt=select_account`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error: any) {
    console.error('Google Auth Init error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
