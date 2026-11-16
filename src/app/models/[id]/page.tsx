import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PartList } from '@/app/components/part-list'
import { apiGet, type Part } from '@/lib/api';

export default async function ModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const modelId = Number(id);
  if (!Number.isInteger(modelId)) notFound();

  const parts = await apiGet<Part[]>(`/parts?model_id=${modelId}`);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Start again
      </Link>
      <h1 className="mt-2 text-3xl font-bold">Parts that fit</h1>
      {parts.length === 0 ? (
        <p className="mt-6 text-gray-500">No parts listed for this model yet.</p>
      ) : (
        <PartList parts={parts} />
      )}
    </main>
  );
}