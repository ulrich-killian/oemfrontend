import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-api';
import { API_URL } from '@/lib/api';

const NO_STORE = { 'Cache-Control': 'no-store' };

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: NO_STORE });
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return typeof body === 'object' && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n >= 1 && n <= 2_147_483_647 ? n : null;
}

export async function forwardToApi(
  method: 'POST' | 'PATCH' | 'PUT',
  path: string,
  payload: unknown,
) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return jsonError('Please sign in again.', 401);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return jsonError('The shop server is unavailable. Try again in a minute.', 502);
  }

  const data = await res.json().catch(() => null);
  if (res.ok) {
    return NextResponse.json(data ?? { ok: true }, { status: res.status, headers: NO_STORE });
  }
  if (res.status === 401) return jsonError('Please sign in again.', 401);
  if (res.status === 400 || res.status === 404 || res.status === 409) {
    const message = Array.isArray(data?.message) ? data.message.join('. ') : data?.message;
    return jsonError(
      typeof message === 'string' ? message : 'Please check the details.',
      res.status,
    );
  }
  return jsonError('Something went wrong. Try again.', 502);
}