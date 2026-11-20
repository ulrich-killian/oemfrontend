import { forwardToApi, jsonError, readJson } from '@/lib/admin-proxy';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError('Invalid request.', 400);

  const payload: Record<string, unknown> = {
    oem_number: body.oem_number,
    name: body.name,
    price_cents: body.price_cents,
    stock: body.stock,
  };
  if (body.weight_kg !== undefined) payload.weight_kg = body.weight_kg;
  return forwardToApi('POST', '/admin/parts', payload);
}