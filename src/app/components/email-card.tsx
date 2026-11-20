'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type EmailRow = {
  id: number;
  to_email: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
  sent_at: string | null;
};

export function EmailCard({ email }: { email: EmailRow }) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNote(`${label} copied.`);
    } catch {
      setNote('Could not copy. Select the text and copy it by hand.');
    }
  }

  async function markSent() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/emails/${email.id}/sent`, { method: 'PATCH' });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) setError(data?.error ?? 'Could not mark as sent.');
      else router.refresh();
    } catch {
      setError('Could not reach the shop. Try again.');
    }
    setBusy(false);
  }

  const button = 'rounded border px-3 py-1 text-sm';
  return (
    <li className="rounded border p-4">
      <p className="text-sm text-gray-500">To</p>
      <p className="font-medium">{email.to_email}</p>
      <p className="mt-2 text-sm text-gray-500">Subject</p>
      <p className="font-medium">{email.subject}</p>
      <pre className="mt-3 whitespace-pre-wrap break-words rounded bg-gray-50 p-3 text-sm">
        {email.body}
      </pre>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => copy('Address', email.to_email)} className={button}>
          Copy address
        </button>
        <button onClick={() => copy('Subject', email.subject)} className={button}>
          Copy subject
        </button>
        <button onClick={() => copy('Message', email.body)} className={button}>
          Copy message
        </button>
        {email.status === 'pending' && (
          <button
            onClick={markSent}
            disabled={busy}
            className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40"
          >
            Mark sent
          </button>
        )}
      </div>

      <p role="status" className="mt-2 text-sm text-green-700">
        {note}
      </p>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
      {email.sent_at && (
        <p className="mt-1 text-sm text-gray-500">
          Sent{' '}
          {new Date(email.sent_at).toLocaleString('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'UTC',
          })}{' '}
          UTC
        </p>
      )}
    </li>
  );
}