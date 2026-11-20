import Link from 'next/link';
import { adminGet } from '@/lib/admin-api';
import { formatUsd } from '@/lib/api';

export const metadata = { title: 'Parts', robots: { index: false, follow: false } };

type PartRow = {
  id: number;
  oem_number: string;
  name: string;
  price_cents: number;
  stock: number;
};

export default async function AdminParts({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (raw ?? '').trim().slice(0, 60);

  const parts = await adminGet<PartRow[]>(
    `/admin/parts?limit=50${q ? `&q=${encodeURIComponent(q)}` : ''}`,
  );

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/admin" className="text-sm text-gray-500 hover:underline">
        ← Admin
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Parts</h1>
        <Link href="/admin/parts/new" className="rounded bg-black px-4 py-2 text-white">
          Add part
        </Link>
      </div>

      <form action="/admin/parts" className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          maxLength={60}
          placeholder="Search by name or OEM number"
          aria-label="Search parts"
          className="flex-1 rounded border p-2"
        />
        <button className="rounded border px-4 py-2">Search</button>
      </form>

      {parts.length === 0 ? (
        <p className="mt-6 text-gray-500">No parts found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2 pr-4">OEM</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4 text-right">Price</th>
                <th className="py-2 text-right">Stock</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 pr-4">{p.oem_number}</td>
                  <td className="py-2 pr-4">
                    <Link href={`/admin/parts/${p.id}`} className="underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-right">{formatUsd(p.price_cents)}</td>
                  <td
                    className={`py-2 text-right ${p.stock === 0 ? 'font-semibold text-red-700' : ''}`}
                  >
                    {p.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}