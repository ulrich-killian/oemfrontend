'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { clearCart, readCart, type CartLine } from '@/lib/cart';

// Edit this list to match the countries you really ship to.
const COUNTRIES: [string, string][] = [
  ['CM', 'Cameroon'], ['GA', 'Gabon'], ['GQ', 'Equatorial Guinea'], ['TD', 'Chad'],
  ['CF', 'Central African Republic'], ['CG', 'Republic of the Congo'],
  ['CD', 'DR Congo'], ['NG', 'Nigeria'], ['GH', 'Ghana'], ['CI', 'Côte d’Ivoire'],
  ['SN', 'Senegal'], ['ZA', 'South Africa'], ['KE', 'Kenya'], ['AE', 'United Arab Emirates'],
  ['GB', 'United Kingdom'], ['IE', 'Ireland'], ['FR', 'France'], ['DE', 'Germany'],
  ['IT', 'Italy'], ['ES', 'Spain'], ['PT', 'Portugal'], ['NL', 'Netherlands'],
  ['BE', 'Belgium'], ['CH', 'Switzerland'], ['AT', 'Austria'], ['SE', 'Sweden'],
  ['NO', 'Norway'], ['DK', 'Denmark'], ['US', 'United States'], ['CA', 'Canada'],
  ['AU', 'Australia'],
];

function Field(props: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength: number;
  minLength?: number;
  autoComplete: string;
}) {
  const { label, required = true, ...input } = props;
  return (
    <label className="block">
      <span className="text-sm text-gray-700">
        {label}
        {required ? '' : ' (optional)'}
      </span>
      <input {...input} required={required} className="mt-1 w-full rounded border p-2" />
    </label>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCart(readCart());
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const items = readCart();
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, items }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.order_token) {
        clearCart();
        router.push(`/orders/${encodeURIComponent(data.order_token)}`);
        return; // stay locked while the next page loads
      }
      setError(data?.error ?? 'Something went wrong. Please try again.');
    } catch {
      setError('Could not reach the shop. Check your connection and try again.');
    }
    setSubmitting(false);
  }

  if (cart === null) return <p className="mt-6 text-gray-500">Loading…</p>;
  if (cart.length === 0) {
    return (
      <p className="mt-6 text-gray-500">
        Your cart is empty.{' '}
        <Link href="/" className="underline">
          Find parts
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <p className="text-gray-600">
        {cart.length} {cart.length === 1 ? 'item' : 'items'} in your order.
      </p>
      <Field label="Full name" name="buyer_name" maxLength={100} autoComplete="name" />
      <Field label="Email" name="buyer_email" type="email" maxLength={200} autoComplete="email" />
      <Field label="Phone (with country code)" name="buyer_phone" type="tel" minLength={5} maxLength={30} autoComplete="tel" />
      <Field label="Address" name="ship_line1" maxLength={200} autoComplete="address-line1" />
      <Field label="Address line 2" name="ship_line2" required={false} maxLength={200} autoComplete="address-line2" />
      <Field label="City" name="ship_city" maxLength={100} autoComplete="address-level2" />
      <Field label="State / region" name="ship_region" required={false} maxLength={100} autoComplete="address-level1" />
      <Field label="Postal code" name="ship_postal_code" required={false} maxLength={20} autoComplete="postal-code" />
      <label className="block">
        <span className="text-sm text-gray-700">Country</span>
        <select
          name="ship_country"
          required
          defaultValue=""
          autoComplete="country"
          className="mt-1 w-full rounded border p-2"
        >
          <option value="" disabled>
            Select a country
          </option>
          {COUNTRIES.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-black px-5 py-3 text-white disabled:opacity-40"
      >
        {submitting ? 'Placing your order…' : 'Place order'}
      </button>
      <p className="text-sm text-gray-500">
        Shipping cost is not included yet. We’ll confirm it with you.
      </p>
    </form>
  );
}