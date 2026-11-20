import Link from 'next/link';
import { PartForm } from '@/app/components/part-form';
import { adminGet } from '@/lib/admin-api';

export const metadata = { title: 'Add part', robots: { index: false, follow: false } };

export default async function NewPart() {
  await adminGet('/admin/me'); // sends you to the login page if your session is missing

  return (
    <main className="mx-auto max-w-xl p-6">
      <Link href="/admin/parts" className="text-sm text-gray-500 hover:underline">
        ← All parts
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Add part</h1>
      <PartForm mode="create" />
    </main>
  );
}