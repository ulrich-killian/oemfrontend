import { LogoutButton } from '@/app/components/logout-button';
import { adminGet } from '@/lib/admin-api';

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
      <p className="mt-6 text-gray-500">Orders, parts and messages will appear here.</p>
    </main>
  );
}