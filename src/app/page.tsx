import { apiGet, type Brand } from '@/lib/api';
import Link from 'next/link';
import { SearchForm } from '@/app/components/search-form';

export default async function Home() {
  const brands = await apiGet<Brand[]>('/brands');

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">OEM Spare Parts Superstore</h1>
      <p className="mt-2 text-gray-500">
        Genuine OEM parts. Pick your brand to find what fits.
      </p>
      <SearchForm />
      <ul className="mt-6 grid grid-cols-2 gap-3">
        {brands.map((b) => (
         <li key={b.id}>
         <Link
           href={`/brands/${b.id}`}
           className="block rounded border p-4 font-medium hover:bg-gray-50"
         >
           {b.name}
         </Link>
       </li>
        ))}
      </ul>
    </main>
  );
}