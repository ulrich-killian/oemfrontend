'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

type PartData = {
  id: number;
  oem_number: string;
  name: string;
  price_cents: number;
  stock: number;
  weight_kg: string | null;
};
type Props = { mode: 'create' } | { mode: 'edit'; part: PartData };

const PRICE = /^\d{1,7}(\.\d{1,2})?$/;
const WEIGHT = /^\d{1,5}(\.\d{1,2})?$/;
const WHOLE = /^\d{1,7}$/;

export function PartForm(props: Props) {
  const router = useRouter();
  const part = props.mode === 'edit' ? props.part : null;
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setMessage('');

    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? '').trim();
    const price = text('price');
    const stock = text('stock');
    const weight = text('weight');

    if (!PRICE.test(price)) {
      setError('Price must look like 49.99.');
      return;
    }
    if (!WHOLE.test(stock) || Number(stock) > 1_000_000) {
      setError('Stock must be a whole number, up to 1,000,000.');
      return;
    }
    if (weight && !WEIGHT.test(weight)) {
      setError('Weight must look like 1.25.');
      return;
    }

    const payload: Record<string, unknown> = {
      name: text('name'),
      price_cents: Math.round(Number(price) * 100),
      stock: Number(stock),
    };
    if (weight) payload.weight_kg = Number(weight);
    if (!part) payload.oem_number = text('oem_number');

    setBusy(true);
    setError('');
    try {
      const res = await fetch(part ? `/api/admin/parts/${part.id}` : '/api/admin/parts', {
        method: part ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        setError(data?.error ?? 'Could not save.');
      } else if (!part) {
        router.push(`/admin/parts/${data.id}`);
        return;
      } else {
        setMessage('Saved.');
        router.refresh();
      }
    } catch {
      setError('Could not reach the shop. Try again.');
    }
    setBusy(false);
  }

  const input = 'mt-1 w-full rounded border p-2';
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      {part ? (
        <p className="text-gray-600">
          OEM number: <span className="font-semibold">{part.oem_number}</span>{' '}
          <span className="text-sm text-gray-500">(cannot be changed)</span>
        </p>
      ) : (
        <label className="block">
          <span className="text-sm text-gray-700">OEM number</span>
          <input name="oem_number" required maxLength={60} className={input} />
        </label>
      )}
      <label className="block">
        <span className="text-sm text-gray-700">Name</span>
        <input name="name" required maxLength={200} defaultValue={part?.name} className={input} />
      </label>
      <label className="block">
        <span className="text-sm text-gray-700">Price (USD)</span>
        <input
          name="price"
          required
          inputMode="decimal"
          placeholder="49.99"
          defaultValue={part ? (part.price_cents / 100).toFixed(2) : ''}
          className={input}
        />
      </label>
      <label className="block">
        <span className="text-sm text-gray-700">Stock</span>
        <input
          name="stock"
          required
          inputMode="numeric"
          defaultValue={part ? String(part.stock) : '0'}
          className={input}
        />
      </label>
      <label className="block">
        <span className="text-sm text-gray-700">Shipping weight, kg (optional)</span>
        <input
          name="weight"
          inputMode="decimal"
          placeholder="1.25"
          defaultValue={part?.weight_kg ?? ''}
          className={input}
        />
      </label>

      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-green-700">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-black px-5 py-3 text-white disabled:opacity-40"
      >
        {busy ? 'Saving…' : part ? 'Save changes' : 'Add part'}
      </button>
    </form>
  );
}