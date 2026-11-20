import Link from 'next/link';
import { EmailCard } from '@/app/components/email-card';
import { adminGet } from '@/lib/admin-api';

export const metadata = { title: 'Messages', robots: { index: false, follow: false } };

type EmailRow = {
  id: number;
  to_email: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
  sent_at: string | null;
};

const FILTERS: [string, string][] = [
  ['pending', 'To send'],
  ['sent', 'Sent'],
];

export default async function AdminEmails({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = FILTERS.find(([value]) => value === raw)?.[0] ?? 'pending';

  const emails = await adminGet<EmailRow[]>(`/admin/emails?status=${status}&limit=50`);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin" className="text-sm text-gray-500 hover:underline">
        ← Admin
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Messages</h1>
      <p className="mt-1 text-gray-600">
        Invoices to send to customers. Copy each one into your email or chat, send it, then mark
        it sent.
      </p>

      <div className="mt-4 flex gap-2">
        {FILTERS.map(([value, name]) => (
          <Link
            key={value}
            href={`/admin/emails?status=${value}`}
            className={
              value === status
                ? 'rounded bg-black px-3 py-1 text-sm text-white'
                : 'rounded border px-3 py-1 text-sm'
            }
          >
            {name}
          </Link>
        ))}
      </div>

      {emails.length === 0 ? (
        <p className="mt-6 text-gray-500">Nothing here.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {emails.map((e) => (
            <EmailCard key={e.id} email={e} />
          ))}
        </ul>
      )}
    </main>
  );
}