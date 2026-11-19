'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Action = { status: string; label: string; danger?: boolean };

const NEXT: Record<string, Action[]> = {
  awaiting_payment: [
    { status: 'paid', label: 'Mark paid' },
    { status: 'cancelled', label: 'Cancel order', danger: true },
  ],
  paid: [
    { status: 'packed', label: 'Mark packed' },
    { status: 'cancelled', label: 'Cancel order', danger: true },
  ],
  packed: [
    { status: 'shipped', label: 'Mark shipped' },
    { status: 'cancelled', label: 'Cancel order', danger: true },
  ],
  shipped: [{ status: 'delivered', label: 'Mark delivered' }],
  delivered: [],
  cancelled: [],
};

export function OrderStatusButtons({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const actions = NEXT[status] ?? [];

  if (actions.length === 0) {
    return <p className="text-gray-500">No further actions for this order.</p>;
  }

  async function change(action: Action) {
    if (busy) return;
    if (action.danger) {
      const warning =
        status === 'awaiting_payment'
          ? 'Cancel this order? Its stock goes back on sale.'
          : 'Cancel this order? Its stock goes back on sale. This does NOT refund any payment.';
      if (!window.confirm(warning)) return;
    }

    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action.status }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        setError(data?.error ?? 'Could not change the status.');
      } else {
        router.refresh();
      }
    } catch {
      setError('Could not reach the shop. Try again.');
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.status}
            onClick={() => change(a)}
            disabled={busy}
            className={
              a.danger
                ? 'rounded border border-red-700 px-4 py-2 text-red-700 disabled:opacity-40'
                : 'rounded bg-black px-4 py-2 text-white disabled:opacity-40'
            }
          >
            {a.label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}