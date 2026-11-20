import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FitsEditor } from '@/app/components/fits-editor';
import { PartForm } from '@/app/components/part-form';
import { adminGet, adminGetOrNull } from '@/lib/admin-api';

export const metadata = { title: 'Edit part', robots: { index: false, follow: false } };

type PartDetail = {
  id: number;
  oem_number: string;
  name: string;
  price_cents: number;
  stock: number;
  weight_kg: string | null;
  model_ids: number[];
};
type Model = { id: number; brand: string; name: string; year_from: number; year_to: number | null };

export default async function EditPart({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partId = Number(id);
  if (!Number.isInteger(partId) || partId < 1) notFound();

  const part = await adminGetOrNull<PartDetail>(`/admin/parts/${partId}`);
  if (!part) notFound();
  const models = await adminGet<Model[]>('/admin/models');

  return (
    <main className="mx-auto max-w-xl p-6">
      <Link href="/admin/parts" className="text-sm text-gray-500 hover:underline">
        ← All parts
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{part.name}</h1>
      <PartForm mode="edit" part={part} />

      <h2 className="mt-10 text-xl font-semibold">Fits these vehicles</h2>
      <FitsEditor partId={part.id} models={models} selected={part.model_ids} />
    </main>
  );
}