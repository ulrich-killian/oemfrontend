import { LogoutButton } from '@/app/components/logout-button';
import { adminGet } from '@/lib/admin-api';
import Link from 'next/link';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminHome() {
  const me = await adminGet<{ email: string }>('/admin/me');

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <LogoutButton />
      </div>
      <p className="mt-2 text-gray-600">Signed in as {me.email}</p>
      <nav className="mt-6">
  <Link href="/admin/orders" className="underline">
    Orders
  </Link>
</nav>
    </main>
  );
}