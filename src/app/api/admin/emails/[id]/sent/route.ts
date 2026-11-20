import { forwardToApi, jsonError, parseId } from '@/lib/admin-proxy';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = parseId((await params).id);
  if (id === null) return jsonError('Invalid message.', 400);
  return forwardToApi('PATCH', `/admin/emails/${id}/sent`, {});
}