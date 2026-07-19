import axios from 'axios';

// Pulls every page from GET /api/orders so callers get the customer's
// full order history instead of just the first (default-limited) page.
export async function fetchAllOrders<T = Record<string, unknown>>(): Promise<T[]> {
  const limit = 100;
  const first = await axios.get(`/api/orders?page=1&limit=${limit}`);
  const orders: T[] = first.data.orders || [];
  const totalPages: number = first.data.pagination?.pages || 1;

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        axios.get(`/api/orders?page=${i + 2}&limit=${limit}`)
      )
    );
    for (const r of rest) orders.push(...(r.data.orders || []));
  }

  return orders;
}
