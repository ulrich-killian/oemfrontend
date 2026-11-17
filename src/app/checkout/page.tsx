import Link from 'next/link';
import { CheckoutForm } from '@/app/components/checkout-form';

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <Link href="/cart" className="text-sm text-gray-500 hover:underline">
        ← Back to cart
      </Link>
      <h1 className="mt-2 text-3xl font-bold">Checkout</h1>
      <CheckoutForm />
    </main>
  );
}