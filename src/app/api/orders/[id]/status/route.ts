import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-api';
import { API_URL } from '@/lib/api';

const STATUSES = ['paid', 'packed', 'shipped', 'delivered', 'cancelled'];
const NO_STORE = { 'Cache-Control': 'no-store' };

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: NO_STORE });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return fail('Please sign in again.', 401);

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId < 1) return fail('Invalid order.', 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request.', 400);
  }
  const status =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>).status
      : undefined;
  if (typeof status !== 'string' || !STATUSES.includes(status)) {
    return fail('Invalid status.', 400);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
      cache: 'no-store',
    });
  } catch {
    return fail('The shop server is unavailable. Try again in a minute.', 502);
  }

  if (res.status === 401) return fail('Please sign in again.', 401);
  if (res.status === 404) return fail('Order not found.', 404);
  if (res.status === 409) {
    const data = await res.json().catch(() => null);
    return fail(typeof data?.message === 'string' ? data.message : 'That change is not allowed.', 409);
  }
  if (!res.ok) return fail('Something went wrong. Try again.', 502);

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}