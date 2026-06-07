'use client';
import { useEffect, useState } from 'react';

export function useRealtimeStock(productId: string, initialStock: number) {
  const [stock, setStock] = useState(initialStock);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const es = new EventSource(`/api/products/${productId}/stock-stream`);

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof data.stock === 'number') {
          setStock(data.stock);
        }
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      setConnected(false);
      // EventSource auto-reconnects; we don't need to do anything
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [productId]);

  // Sync if initial stock prop changes (e.g. after add-to-cart)
  useEffect(() => {
    setStock(initialStock);
  }, [initialStock]);

  return { stock, connected };
}
