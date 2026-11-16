import Link from 'next/link';
import { CartView } from '@/app/components/cart-view';

export default function CartPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Keep shopping
      </Link>
      <h1 className="mt-2 text-3xl font-bold">Your cart</h1>
      <CartView />
    </main>
  );
}