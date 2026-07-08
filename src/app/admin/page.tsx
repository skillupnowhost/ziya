'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { CurrencyRupeeIcon, ShoppingBagIcon, UsersIcon, CubeIcon, ExclamationTriangleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
}

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { name: string }[];
}

interface OutOfStockProduct {
  id: string;
  name: string;
  stock: number;
  image: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  product_id: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<OutOfStockProduct[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/stats'),
      axios.get('/api/admin/notifications').catch(() => ({ data: { notifications: [], outOfStockProducts: [] } })),
    ]).then(([statsRes, notifRes]) => {
      setStats(statsRes.data.stats);
      setRecentOrders(statsRes.data.recentOrders || []);
      setOutOfStockProducts(notifRes.data.outOfStockProducts || []);
      setNotifications((notifRes.data.notifications || []).filter((n: Notification) => !n.is_read));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await axios.put('/api/admin/notifications', { notificationId: 'all' });
      setNotifications([]);
    } catch { /* silent */ }
  };

  const startEditStock = (p: OutOfStockProduct) => {
    setEditingId(p.id);
    setEditValue(String(p.stock > 0 ? p.stock : ''));
  };

  const cancelEditStock = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveStock = async (productId: string) => {
    const newStock = Number(editValue);
    if (!Number.isFinite(newStock) || newStock < 0) return;

    setSaving(true);
    try {
      await axios.put(`/api/products/${productId}`, { stock: newStock });

      if (newStock > 0) {
        // Restocked — drop from the alert list and clear its notifications
        setOutOfStockProducts((prev) => prev.filter((p) => p.id !== productId));
        setNotifications((prev) => prev.filter((n) => n.product_id !== productId));
      } else {
        setOutOfStockProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
      }
      cancelEditStock();
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: stats ? `₹${stats.totalRevenue.toLocaleString()}` : '—', icon: CurrencyRupeeIcon, color: 'bg-rose-100 text-rose-500', href: '/admin/orders' },
    { label: 'Total Orders', value: stats?.totalOrders ?? '—', icon: ShoppingBagIcon, color: 'bg-blue-100 text-blue-500', href: '/admin/orders' },
    { label: 'Products', value: stats?.totalProducts ?? '—', icon: CubeIcon, color: 'bg-purple-100 text-purple-500', href: '/admin/products' },
    { label: 'Customers', value: stats?.totalUsers ?? '—', icon: UsersIcon, color: 'bg-emerald-100 text-emerald-500', href: '/admin/customers' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening at Ziya.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? <span className="inline-block w-16 h-7 bg-gray-100 rounded-lg animate-pulse" /> : card.value}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Out of Stock Alert */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-xl">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-red-800 text-sm">Out of Stock Alert</h2>
                <p className="text-xs text-red-600">{outOfStockProducts.length} product{outOfStockProducts.length > 1 ? 's' : ''} need restocking</p>
              </div>
            </div>
            <Link href="/admin/products" className="text-xs text-red-500 hover:text-red-600 font-semibold">
              Manage Products →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {outOfStockProducts.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-red-100">
                {p.image && (
                  <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  {editingId === p.id ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        min={0}
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveStock(p.id);
                          if (e.key === 'Escape') cancelEditStock();
                        }}
                        className="w-16 text-xs px-1.5 py-0.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-300"
                        placeholder="Qty"
                      />
                      <button
                        onClick={() => saveStock(p.id)}
                        disabled={saving}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditStock}
                        disabled={saving}
                        className="text-xs text-gray-400 hover:text-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-semibold text-red-500">Stock: {p.stock}</p>
                      <button
                        onClick={() => startEditStock(p)}
                        className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-rose-500"
                        title="Update stock"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {outOfStockProducts.length > 6 && (
            <p className="text-xs text-red-500 mt-2 text-center">
              +{outOfStockProducts.length - 6} more products out of stock
            </p>
          )}
        </div>
      )}

      {/* Unread Notifications */}
      {notifications.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-xl">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="font-bold text-amber-800 text-sm">Notifications ({notifications.length})</h2>
            </div>
            <button
              onClick={markAllRead}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
            >
              Mark all read
            </button>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-amber-100">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-rose-400 hover:text-rose-500 font-medium">View all →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-3">
                <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded flex-1 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
              </div>
            ))
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No orders yet</div>
          ) : recentOrders.map((order) => (
            <Link key={order._id} href={`/admin/orders?id=${order._id}`}>
              <div className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <span className="font-mono text-xs text-gray-400 w-20">#{order._id.slice(-6).toUpperCase()}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{order.items.map(i => i.name).join(', ')}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
                <span className="font-bold text-gray-900 text-sm">₹{order.total.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
