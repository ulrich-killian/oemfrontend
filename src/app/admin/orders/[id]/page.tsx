import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderStatusButtons } from '@/app/components/order-status-buttons';
import { adminGetOrNull } from '@/lib/admin-api';
import { formatUsd } from '@/lib/api';

export const metadata = {
  title: 'Order',
  robots: { index: false, follow: false },
};

type OrderDetail = {
  id: number;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_region: string | null;
  ship_postal_code: string | null;
  ship_country: string;
  created_at: string;
  invoice_number: string;
  paid_at: string | null;
  items: { oem_number: string; name: string; qty: number; unit_price_cents: number }[];
};

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }) + ' UTC';

export default async function AdminOrder({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId < 1) notFound();

  const o = await adminGetOrNull<OrderDetail>(`/admin/orders/${orderId}`);
  if (!o) notFound();

  const address = [o.ship_line1, o.ship_line2, o.ship_city, o.ship_region, o.ship_postal_code, o.ship_country]
    .filter(Boolean)
    .join(', ');

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin/orders" className="text-sm text-gray-500 hover:underline">
        ← All orders
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{o.invoice_number}</h1>
      <p className="mt-1 text-gray-600">
        Status: <span className="font-semibold">{o.status.replace('_', ' ')}</span> · Placed{' '}
        {when(o.created_at)}
        {o.paid_at ? ` · Paid ${when(o.paid_at)}` : ''}
      </p>

      <div className="mt-6">
        <OrderStatusButtons id={o.id} status={o.status} />
      </div>

      <h2 className="mt-8 text-lg font-semibold">Buyer</h2>
      <p>{o.buyer_name}</p>
      <p className="text-gray-600">{o.buyer_email}</p>
      <p className="text-gray-600">{o.buyer_phone}</p>

      <h2 className="mt-6 text-lg font-semibold">Ship to</h2>
      <p>{address}</p>

      <h2 className="mt-6 text-lg font-semibold">Items</h2>
      <ul className="mt-2 space-y-2">
        {o.items.map((i) => (
          <li key={i.oem_number} className="flex justify-between rounded border p-3">
            <span>
              {i.qty} × {i.name}{' '}
              <span className="text-sm text-gray-500">OEM {i.oem_number}</span>
            </span>
            <span>{formatUsd(i.unit_price_cents * i.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-1 text-right">
        <div className="text-gray-500">Subtotal {formatUsd(o.subtotal_cents)}</div>
        <div className="text-gray-500">
          Shipping {o.shipping_cents > 0 ? formatUsd(o.shipping_cents) : 'not set'}
        </div>
        <div className="text-lg font-semibold">Total {formatUsd(o.total_cents)}</div>
      </div>
    </main>
  );
}