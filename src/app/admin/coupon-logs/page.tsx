'use client';
import { useEffect, useState, useCallback } from 'react';
import { TagIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

type CouponAction =
  | 'claimed'
  | 'used'
  | 'rejected_already_used'
  | 'rejected_not_first_order'
  | 'rejected_not_found'
  | 'duplicate_email_attempt';

interface CouponLog {
  _id: string;
  email: string;
  couponCode: string;
  action: CouponAction;
  reason?: string;
  ipAddress?: string;
  userId?: string;
  orderId?: string;
  isAdminRead: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ACTION_CONFIG: Record<CouponAction, { label: string; color: string; icon: React.ElementType }> = {
  claimed:                    { label: 'Claimed',             color: 'bg-emerald-100 text-emerald-700', icon: CheckCircleIcon },
  used:                       { label: 'Used',                color: 'bg-blue-100 text-blue-700',       icon: CheckCircleIcon },
  rejected_already_used:      { label: 'Rejected: Used',      color: 'bg-red-100 text-red-700',         icon: XCircleIcon },
  rejected_not_first_order:   { label: 'Rejected: Not First', color: 'bg-orange-100 text-orange-700',   icon: XCircleIcon },
  rejected_not_found:         { label: 'Rejected: Not Found', color: 'bg-gray-100 text-gray-600',       icon: XCircleIcon },
  duplicate_email_attempt:    { label: 'Duplicate Email',     color: 'bg-yellow-100 text-yellow-700',   icon: ClockIcon },
};

export default function CouponLogsPage() {
  const [logs, setLogs] = useState<CouponLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (p: number, action: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (action) params.set('action', action);
      const res = await fetch(`/api/admin/coupon-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page, filter);
  }, [page, filter, fetchLogs]);

  const markAllRead = async () => {
    await fetch('/api/admin/coupon-logs', { method: 'PATCH' });
    setUnreadCount(0);
    setLogs((prev) => prev.map((l) => ({ ...l, isAdminRead: true })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TagIcon className="w-6 h-6 text-rose-400" />
          <h1 className="text-2xl font-bold text-gray-900">Coupon Logs</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-400 text-white text-xs font-bold rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-sm text-gray-500 hover:text-rose-400 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['', 'claimed', 'used', 'duplicate_email_attempt', 'rejected_already_used', 'rejected_not_first_order'].map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => { setFilter(a); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === a
                ? 'bg-rose-400 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300 hover:text-rose-400'
            }`}
          >
            {a === '' ? 'All' : ACTION_CONFIG[a as CouponAction]?.label || a}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Coupon Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">IP</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => {
                  const cfg = ACTION_CONFIG[log.action];
                  const Icon = cfg?.icon || ClockIcon;
                  return (
                    <tr
                      key={log._id}
                      className={`transition-colors hover:bg-gray-50 ${!log.isAdminRead ? 'bg-rose-50/40' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg?.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cfg?.label || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{log.email}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{log.couponCode}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{log.reason || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{log.ipAddress || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-rose-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-rose-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
