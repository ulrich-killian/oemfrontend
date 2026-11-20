import { forwardToApi, jsonError, parseId, readJson } from '@/lib/admin-proxy';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = parseId((await params).id);
  if (id === null) return jsonError('Invalid part.', 400);
  const body = await readJson(request);
  if (!body) return jsonError('Invalid request.', 400);
  return forwardToApi('PUT', `/admin/parts/${id}/fits`, { model_ids: body.model_ids });
}