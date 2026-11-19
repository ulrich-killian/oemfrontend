import { AdminLoginForm } from '@/app/components/admin-login-form';

export const metadata = {
  title: 'Admin login',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold">Admin login</h1>
      <AdminLoginForm />
    </main>
  );
}