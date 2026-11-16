import Link from 'next/link';
import { PartList } from '@/app/components/part-list';
import { SearchForm } from '@/app/components/search-form';
import { apiGet, type Part } from '@/lib/api';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (raw ?? '').trim().slice(0, 60);
  const parts = q ? await apiGet<Part[]>(`/parts?q=${encodeURIComponent(q)}`) : [];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-2 text-3xl font-bold">Search by OEM number</h1>
      <SearchForm defaultValue={q} />
      {!q ? (
        <p className="mt-6 text-gray-500">Type the number printed on your old part.</p>
      ) : parts.length === 0 ? (
        <p className="mt-6 text-gray-500">No part found for “{q}”. Check the number and try again.</p>
      ) : (
        <PartList parts={parts} />
      )}
    </main>
  );
}