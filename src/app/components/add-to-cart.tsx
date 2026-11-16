'use client';

import { useState } from 'react';
import { addToCart } from '@/lib/cart';

export function AddToCart({ partId, inStock }: { partId: number; inStock: boolean }) {
  const [qtyText, setQtyText] = useState('1');
  const [message, setMessage] = useState('');

  if (!inStock) {
    return <p className="mt-6 text-red-700">This part is out of stock.</p>;
  }

  function handleAdd() {
    const qty = Number(qtyText);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      setMessage('Enter a quantity from 1 to 100.');
      return;
    }
    const saved = addToCart(partId, qty);
    setMessage(
      saved
        ? `Added ${qty} to your cart.`
        : 'Could not save your cart. Your browser may be blocking storage.',
    );
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <input
        type="number"
        min={1}
        max={100}
        value={qtyText}
        onChange={(e) => setQtyText(e.target.value)}
        aria-label="Quantity"
        className="w-20 rounded border p-2"
      />
      <button onClick={handleAdd} className="rounded bg-black px-4 py-2 text-white">
        Add to cart
      </button>
      <span role="status" className="text-sm text-gray-600">
        {message}
      </span>
    </div>
  );
}