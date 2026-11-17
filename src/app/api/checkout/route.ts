import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';

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
  if (typeof body !== 'object' || body === null) return fail('Invalid request', 400);
  const b = body as Record<string, unknown>;

  const text = (key: string) => (typeof b[key] === 'string' ? (b[key] as string).trim() : '');

  const payload: Record<string, unknown> = {};
  for (const key of [
    'buyer_name', 'buyer_email', 'buyer_phone', 'ship_line1', 'ship_city', 'ship_country',
  ]) {
    payload[key] = text(key);
  }
  for (const key of ['ship_line2', 'ship_region', 'ship_postal_code']) {
    const value = text(key);
    if (value) payload[key] = value;
  }
  payload.items = (Array.isArray(b.items) ? b.items : []).slice(0, 50).map((item) => {
    const line = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
    return { part_id: Number(line.part_id), qty: Number(line.qty) };
  });

  let res: Response;
  try {
    res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return fail('The shop is unavailable. Please try again in a moment.', 502);
  }

  const data = await res.json().catch(() => null);

  if (res.ok && data) {
    return NextResponse.json(
      {
        order_token: data.order_token,
        invoice_number: data.invoice_number,
        total_cents: data.total_cents,
      },
      { status: 201, headers: NO_STORE },
    );
  }
  if (res.status === 400 || res.status === 409) {
    const message = Array.isArray(data?.message) ? data.message.join('. ') : data?.message;
    return fail(typeof message === 'string' ? message : 'Please check your details.', res.status);
  }
  if (res.status === 429) {
    return fail('Too many attempts. Please wait a minute and try again.', 429);
  }
  return fail('Something went wrong. Please try again.', 502);
}