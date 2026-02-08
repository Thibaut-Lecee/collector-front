import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, buildLogoutUrl } from '@/lib/auth';

/**
 * Initiates the logout process by redirecting the user to the external Identity
 * Provider's (IdP) logout endpoint. This endpoint validates that the user has an
 * active session with a valid ID token, generates a cryptographically secure state
 * parameter for CSRF protection, and stores it in a secure HTTP-only cookie.
 *
 * The state parameter will be validated upon the user's return from the IdP to
 * ensure the logout callback is legitimate and not a forged request.
 *
 * @returns A redirect response to the IdP's logout URL on success, or a 400-error
 * response if no valid session exists. The response includes a secure state cookie
 * that will be validated in the logout callback.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.idToken) {
    return NextResponse.json(
      { error: 'No valid session or ID token found' },
      { status: 400 },
    );
  } else {
    const { url, state } = await buildLogoutUrl(session.idToken);
    // Use 303 to force a GET on the IdP logout endpoint after a POST form submit.
    const response = NextResponse.redirect(url, 303);

    response.cookies.set('logout_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/logout/callback',
    });

    // Clear local session cookies immediately so the user is logged out from the app
    // even if they never return from the IdP logout redirect.
    for (const cookie of request.cookies.getAll()) {
      if (
        cookie.name.includes('authjs.') ||
        cookie.name.startsWith('next-auth.') ||
        cookie.name.startsWith('__Secure-next-auth.') ||
        cookie.name.startsWith('__Host-next-auth.')
      ) {
        response.cookies.delete(cookie.name);
      }
    }

    return response;
  }
}
