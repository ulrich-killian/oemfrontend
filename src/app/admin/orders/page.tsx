import Link from 'next/link';
import { adminGet } from '@/lib/admin-api';
import { formatUsd } from '@/lib/api';

export const metadata = {
  title: 'Orders',
  robots: { index: false, follow: false },
};

type OrderRow = {
  id: number;
  invoice_number: string;
  status: string;
  buyer_name: string;
  buyer_email: string;
  total_cents: number;
  created_at: string;
};

const FILTERS: [string, string][] = [
  ['', 'All'],
  ['awaiting_payment', 'Awaiting payment'],
  ['paid', 'Paid'],
  ['packed', 'Packed'],
  ['shipped', 'Shipped'],
  ['delivered', 'Delivered'],
  ['cancelled', 'Cancelled'],
];

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = FILTERS.find(([value]) => value !== '' && value === raw)?.[0] ?? '';

  const orders = await adminGet<OrderRow[]>(
    `/admin/orders?limit=50${status ? `&status=${status}` : ''}`,
  );
  const label = Object.fromEntries(FILTERS);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/admin" className="text-sm text-gray-500 hover:underline">
        ← Admin
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map(([value, name]) => (
          <Link
            key={value || 'all'}
            href={value ? `/admin/orders?status=${value}` : '/admin/orders'}
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

      {orders.length === 0 ? (
        <p className="mt-6 text-gray-500">No orders here.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2 pr-4">Invoice</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Buyer</th>
                <th className="py-2 pr-4 text-right">Total</th>
                <th className="py-2">Placed (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/orders/${o.id}`} className="underline">
                      {o.invoice_number}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{label[o.status] ?? o.status}</td>
                  <td className="py-2 pr-4">
                    {o.buyer_name}
                    <div className="text-gray-500">{o.buyer_email}</div>
                  </td>
                  <td className="py-2 pr-4 text-right">{formatUsd(o.total_cents)}</td>
                  <td className="py-2 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'UTC',
                    })}
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