export type CartLine = { part_id: number; qty: number };

const KEY = 'oem-cart-v1';
const MAX_QTY = 100;
const MAX_LINES = 50;

function isLine(x: unknown): x is CartLine {
  if (typeof x !== 'object' || x === null) return false;
  const l = x as Record<string, unknown>;
  return (
    Number.isInteger(l.part_id) && (l.part_id as number) > 0 &&
    Number.isInteger(l.qty) && (l.qty as number) > 0
  );
}

export function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter(isLine)
      .map((l) => ({ part_id: l.part_id, qty: Math.min(l.qty, MAX_QTY) }))
      .slice(0, MAX_LINES);
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
    return true;
  } catch {
    return false;
  }
}

export function addToCart(partId: number, qty: number): boolean {
  const cart = readCart();
  const existing = cart.find((l) => l.part_id === partId);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, MAX_QTY);
  } else if (cart.length < MAX_LINES) {
    cart.push({ part_id: partId, qty: Math.min(qty, MAX_QTY) });
  }
  return writeCart(cart);
}