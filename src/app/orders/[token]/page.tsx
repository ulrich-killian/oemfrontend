import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiGetOrNull, formatUsd } from '@/lib/api';

export const metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
};

type OrderItem = { oem_number: string; name: string; qty: number; unit_price_cents: number };
type Order = {
  status: string;
  total_cents: number;
  subtotal_cents: number;
  shipping_cents: number;
  created_at: string;
  invoice_number: string;
  items: OrderItem[];
};

const STATUS: Record<string, string> = {
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound();

  const order = await apiGetOrNull<Order>(`/orders/${token}`);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">Thank you for your order</h1>
      <p className="mt-2 text-gray-600">
        Invoice <span className="font-semibold">{order.invoice_number}</span> ·{' '}
        {new Date(order.created_at).toLocaleDateString('en-GB', {
          dateStyle: 'medium',
          timeZone: 'UTC',
        })}
      </p>
      <p className="mt-1">
        Status:{' '}
        <span className="font-semibold">{STATUS[order.status] ?? order.status}</span>
      </p>

      <ul className="mt-6 space-y-2">
        {order.items.map((i) => (
          <li key={i.oem_number} className="flex justify-between rounded border p-3">
            <span>
              {i.qty} × {i.name}{' '}
              <span className="text-sm text-gray-500">OEM {i.oem_number}</span>
            </span>
            <span>{formatUsd(i.unit_price_cents * i.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-1 border-t pt-4 text-right">
        <div className="text-gray-500">Subtotal {formatUsd(order.subtotal_cents)}</div>
        <div className="text-gray-500">
  Shipping {order.shipping_cents > 0 ? formatUsd(order.shipping_cents) : 'to be confirmed'}
</div>
<div className="text-xl font-semibold">
  Total {formatUsd(order.total_cents)}
  {order.shipping_cents === 0 && (
    <span className="text-sm font-normal text-gray-500"> (before shipping)</span>
  )}
</div>
      </div>

      <p className="mt-6 rounded bg-gray-50 p-4 text-sm text-gray-700">
        Keep the link to this page. It’s how you check your order status. We’ll contact you about
        payment and shipping.
      </p>
      <Link href="/" className="mt-6 inline-block underline">
        Keep shopping
      </Link>
    </main>
  );
}