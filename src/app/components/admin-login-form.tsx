'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        router.push('/admin');
        router.refresh();
        return;
      }
      setError(data?.error ?? 'Login failed.');
    } catch {
      setError('Could not reach the shop. Try again.');
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm text-gray-700">Email</span>
        <input
          name="email"
          type="email"
          required
          maxLength={200}
          autoComplete="username"
          className="mt-1 w-full rounded border p-2"
        />
      </label>
      <label className="block">
        <span className="text-sm text-gray-700">Password</span>
        <input
          name="password"
          type="password"
          required
          maxLength={200}
          autoComplete="current-password"
          className="mt-1 w-full rounded border p-2"
        />
      </label>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-black px-5 py-3 text-white disabled:opacity-40"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}