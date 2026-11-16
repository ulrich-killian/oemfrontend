const API_URL = process.env.API_URL;

export type Brand = { id: number; name: string };
export type Model = { id: number; name: string; year_from: number; year_to: number | null };
export type Part = {
  id: number;
  oem_number: string;
  name: string;
  price_cents: number;
  stock: number;
  weight_kg: string | null;
};

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`API ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}