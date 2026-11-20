import { forwardToApi, jsonError, parseId, readJson } from '@/lib/admin-proxy';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = parseId((await params).id);
  if (id === null) return jsonError('Invalid part.', 400);
  const body = await readJson(request);
  if (!body) return jsonError('Invalid request.', 400);

  const payload: Record<string, unknown> = {};
  for (const key of ['name', 'price_cents', 'stock', 'weight_kg']) {
    if (body[key] !== undefined) payload[key] = body[key];
  }
  return forwardToApi('PATCH', `/admin/parts/${id}`, payload);
}