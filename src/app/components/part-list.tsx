import { formatUsd, type Part } from '@/lib/api';

export function PartList({ parts }: { parts: Part[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {parts.map((p) => (
        <li key={p.id} className="flex items-center justify-between rounded border p-4">
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-500">OEM {p.oem_number}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{formatUsd(p.price_cents)}</div>
            <div className={p.stock > 0 ? 'text-sm text-green-700' : 'text-sm text-red-700'}>
              {p.stock > 0 ? 'In stock' : 'Out of stock'}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}