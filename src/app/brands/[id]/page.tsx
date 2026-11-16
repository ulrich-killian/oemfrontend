import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiGet, type Brand, type Model } from '@/lib/api';

export default async function BrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brandId = Number(id);
  if (!Number.isInteger(brandId)) notFound();

  const [brands, models] = await Promise.all([
    apiGet<Brand[]>('/brands'),
    apiGet<Model[]>(`/models?brand_id=${brandId}`),
  ]);
  const brand = brands.find((b) => b.id === brandId);
  if (!brand) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← All brands
      </Link>
      <h1 className="mt-2 text-3xl font-bold">{brand.name}</h1>
      <p className="mt-2 text-gray-500">Pick your model and year range.</p>
      <ul className="mt-6 space-y-3">
        {models.map((m) => (
          <li key={m.id}>
            <Link
              href={`/models/${m.id}`}
              className="block rounded border p-4 hover:bg-gray-50"
            >
              <span className="font-medium">{m.name}</span>{' '}
              <span className="text-gray-500">
                {m.year_from}–{m.year_to ?? 'present'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}