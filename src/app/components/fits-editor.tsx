'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Model = {
  id: number;
  brand: string;
  name: string;
  year_from: number;
  year_to: number | null;
};

export function FitsEditor({
  partId,
  models,
  selected,
}: {
  partId: number;
  models: Model[];
  selected: number[];
}) {
  const router = useRouter();
  const [chosen, setChosen] = useState<Set<number>>(new Set(selected));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const brands = [...new Set(models.map((m) => m.brand))];

  function toggle(id: number) {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/admin/parts/${partId}/fits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_ids: [...chosen] }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) setError(data?.error ?? 'Could not save.');
      else setMessage('Fits saved.');
    } catch {
      setError('Could not reach the shop. Try again.');
    }
    setBusy(false);
  }

  return (
    <div className="mt-4">
      {brands.map((brand) => (
        <fieldset key={brand} className="mb-4">
          <legend className="font-medium">{brand}</legend>
          <div className="mt-1 space-y-1">
            {models
              .filter((m) => m.brand === brand)
              .map((m) => (
                <label key={m.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={chosen.has(m.id)}
                    onChange={() => toggle(m.id)}
                  />
                  <span>
                    {m.name}{' '}
                    <span className="text-gray-500">
                      {m.year_from}–{m.year_to ?? 'present'}
                    </span>
                  </span>
                </label>
              ))}
          </div>
        </fieldset>
      ))}
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
        onClick={save}
        disabled={busy}
        className="rounded bg-black px-5 py-3 text-white disabled:opacity-40"
      >
        {busy ? 'Saving…' : 'Save fits'}
      </button>
    </div>
  );
}