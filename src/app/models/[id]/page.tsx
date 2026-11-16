import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiGet, formatUsd, type Part } from '@/lib/api';

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
        <ul className="mt-6 space-y-3">
          {parts.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded border p-4">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">OEM {p.oem_number}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatUsd(p.price_cents)}</div>
                <div className={p.stock > 0 ? 'text-sm text-green-700' : 'text-sm text-red-700'}>
                  {p.stock > 0 ? 'In stock' : 'Out of stock'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}