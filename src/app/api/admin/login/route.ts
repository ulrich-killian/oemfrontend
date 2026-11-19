import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';
import { ADMIN_COOKIE } from '@/lib/admin-api';

const NO_STORE = { 'Cache-Control': 'no-store' };

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request', 400);
  }
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  const password = typeof b.password === 'string' ? b.password : '';
  if (!email || !password) return fail('Enter your email and password.', 400);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch {
    return fail('The shop server is unavailable. Try again in a minute.', 502);
  }

  if (res.status === 400 || res.status === 401) return fail('Invalid email or password.', 401);
  if (res.status === 429) return fail('Too many attempts. Wait a minute and try again.', 429);

  const data = await res.json().catch(() => null);
  if (!res.ok || typeof data?.token !== 'string') return fail('Login failed. Try again.', 502);

  const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
  response.cookies.set(ADMIN_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 12 * 60 * 60,
  });
  return response;
}