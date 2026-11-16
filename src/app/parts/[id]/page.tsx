import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiGetOrNull, formatUsd, type PartDetail } from '@/lib/api';

export default async function PartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partId = Number(id);
  if (!Number.isInteger(partId)) notFound();

  const part = await apiGetOrNull<PartDetail>(`/parts/${partId}`);
  if (!part) notFound();
  const inStock = part.stock > 0;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-2 text-3xl font-bold">{part.name}</h1>
      <p className="mt-1 text-gray-500">OEM {part.oem_number}</p>

      <div className="mt-6 flex items-baseline gap-4">
        <span className="text-2xl font-semibold">{formatUsd(part.price_cents)}</span>
        <span className={inStock ? 'text-green-700' : 'text-red-700'}>
          {inStock ? 'In stock' : 'Out of stock'}
        </span>
      </div>
      {part.weight_kg && (
        <p className="mt-2 text-sm text-gray-500">Shipping weight: {part.weight_kg} kg</p>
      )}

      <h2 className="mt-8 text-xl font-semibold">Fits these vehicles</h2>
      {part.fits.length === 0 ? (
        <p className="mt-3 text-gray-500">No vehicles listed yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {part.fits.map((f) => (
            <li key={f.id}>
              <Link href={`/models/${f.id}`} className="underline">
                {f.brand} {f.name}
              </Link>{' '}
              <span className="text-gray-500">
                {f.year_from}–{f.year_to ?? 'present'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}