'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatUsd, type Part } from '@/lib/api';
import { readCart, removeFromCart, setQuantity, type CartLine } from '@/lib/cart';

type Status = 'loading' | 'ready' | 'error';

export function CartView() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [parts, setParts] = useState<Record<string, Part>>({});
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    const cart = readCart();

    const load: Promise<Part[]> =
      cart.length === 0
        ? Promise.resolve([])
        : fetch(`/api/cart-parts?ids=${cart.map((l) => l.part_id).join(',')}`).then((res) => {
            if (!res.ok) throw new Error('bad response');
            return res.json() as Promise<Part[]>;
          });

    load
      .then((list) => {
        if (cancelled) return;
        setLines(cart);
        setParts(Object.fromEntries(list.map((p) => [p.id, p])));
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function change(partId: number, qty: number) {
    setQuantity(partId, qty);
    setLines(readCart());
  }

  function remove(partId: number) {
    removeFromCart(partId);
    setLines(readCart());
  }

  if (status === 'loading') {
    return <p className="mt-6 text-gray-500">Loading your cart…</p>;
  }
  if (status === 'error') {
    return (
      <p className="mt-6 text-red-700">
        We couldn’t load your cart right now. Your items are still saved. Please refresh in a moment.
      </p>
    );
  }
  if (lines.length === 0) {
    return (
      <p className="mt-6 text-gray-500">
        Your cart is empty.{' '}
        <Link href="/" className="underline">
          Find parts
        </Link>
      </p>
    );
  }

  const rows = lines.map((line) => {
    const part: Part | undefined = parts[line.part_id];
    let problem: string | null = null;
    if (!part) problem = 'This part is no longer available.';
    else if (part.stock === 0) problem = 'Out of stock. Remove it to continue.';
    else if (line.qty > part.stock) problem = 'Not enough in stock for this quantity. Lower it.';
    return { line, part, problem };
  });
  const hasProblems = rows.some((r) => r.problem !== null);
  const total = rows.reduce(
    (sum, r) => (r.part && !r.problem ? sum + r.part.price_cents * r.line.qty : sum),
    0,
  );

  return (
    <div className="mt-6">
      <ul className="space-y-3">
        {rows.map(({ line, part, problem }) => (
          <li key={line.part_id} className="rounded border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                {part ? (
                  <>
                    <Link href={`/parts/${part.id}`} className="font-medium hover:underline">
                      {part.name}
                    </Link>
                    <div className="text-sm text-gray-500">
                      OEM {part.oem_number} · {formatUsd(part.price_cents)} each
                    </div>
                  </>
                ) : (
                  <div className="font-medium">Part #{line.part_id}</div>
                )}
                {problem && (
                  <p role="alert" className="mt-1 text-sm text-red-700">
                    {problem}
                  </p>
                )}
              </div>
              <div className="text-right font-semibold">
                {part && !problem ? formatUsd(part.price_cents * line.qty) : ''}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => change(line.part_id, line.qty - 1)}
                disabled={line.qty <= 1}
                aria-label="Decrease quantity"
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                −
              </button>
              <span className="w-8 text-center">{line.qty}</span>
              <button
                onClick={() => change(line.part_id, line.qty + 1)}
                disabled={line.qty >= 100}
                aria-label="Increase quantity"
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                +
              </button>
              <button
                onClick={() => remove(line.part_id)}
                className="ml-4 text-sm text-gray-500 underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-gray-500">Subtotal (shipping not included)</span>
        <span className="text-xl font-semibold">{formatUsd(total)}</span>
      </div>
      {hasProblems && (
        <p className="mt-2 text-sm text-red-700">
          Fix or remove the lines marked in red to continue. They aren’t counted in the subtotal.
        </p>
      )}
      <button
        disabled
        className="mt-4 rounded bg-black px-5 py-3 text-white disabled:opacity-40"
      >
        Checkout (coming in the next step)
      </button>
    </div>
  );
}