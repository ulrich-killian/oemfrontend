import { NextResponse } from 'next/server';
import { apiGet, type Part } from '@/lib/api';

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('ids') ?? '';
  const ids = raw.split(',').map(Number);
  if (
    ids.length > 50 ||
    ids.some((n) => !Number.isInteger(n) || n < 1 || n > 2_147_483_647)
  ) {
    return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
  }

  try {
    const parts = await apiGet<Part[]>(`/parts?ids=${ids.join(',')}`);
    const safe = parts.map((p) => ({ ...p, stock: Math.min(p.stock, 100) }));
    return NextResponse.json(safe, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Shop is unavailable' }, { status: 502 });
  }
}