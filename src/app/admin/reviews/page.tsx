'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
}

const INITIAL_EDIT = { id: '', rating: 5, title: '', comment: '' };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [editReview, setEditReview] = useState(INITIAL_EDIT);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchReviews = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '15' });
      if (search) params.set('search', search);
      const res = await axios.get(`/api/admin/reviews?${params}`);
      setReviews(res.data.reviews || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
      setPage(p);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const startEdit = (review: Review) => {
    setEditReview({ id: review._id, rating: review.rating, title: review.title || '', comment: review.comment });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editReview.id) return;
    if (!editReview.comment.trim()) {
      toast.error('Review comment cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await axios.patch('/api/admin/reviews', {
        id: editReview.id,
        rating: editReview.rating,
        title: editReview.title,
        comment: editReview.comment,
      });
      toast.success('Review updated');
      fetchReviews(page);
      setEditing(false);
    } catch {
      toast.error('Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await axios.delete(`/api/admin/reviews?id=${encodeURIComponent(id)}`);
      toast.success('Review deleted');
      fetchReviews(page);
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, idx) => (
      <span key={idx} className={`inline-block w-3 h-3 rounded-full ${idx < rating ? 'bg-amber-400' : 'bg-gray-200'}`} />
    ));
  };

  const filteredReviews = useMemo(() => reviews, [reviews]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500">Manage customer reviews and ratings.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchReviews(1)}
            placeholder="Search by user, product, or text..."
            className="flex-1 min-w-0 px-4 py-2 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-rose-300"
          />
          <button onClick={() => fetchReviews(1)} className="px-4 py-2 bg-rose-500 text-white rounded-2xl text-sm hover:bg-rose-600 transition-colors">Search</button>
        </div>
      </div>

      {editing && (
        <div className="mb-6 bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit review</h2>
              <p className="text-sm text-gray-500">Update the rating, title, or comment.</p>
            </div>
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Rating</span>
              <select
                value={editReview.rating}
                onChange={(e) => setEditReview({ ...editReview, rating: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-rose-300"
              >
                {[5,4,3,2,1].map((value) => (
                  <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                ))}
              </select>
            </label>

            <label className="sm:col-span-2 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Title</span>
              <input
                type="text"
                value={editReview.title}
                onChange={(e) => setEditReview({ ...editReview, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-rose-300"
                placeholder="Optional review title"
              />
            </label>

            <label className="sm:col-span-3 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Comment</span>
              <textarea
                rows={4}
                value={editReview.comment}
                onChange={(e) => setEditReview({ ...editReview, comment: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-3xl text-sm focus:outline-none focus:border-rose-300"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 justify-end">
            <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-2xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-2xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reviewer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Comment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 7 }).map((__, cell) => (
                      <td key={cell} className="px-4 py-4"><div className="h-3 bg-gray-100 rounded-full animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No reviews found</td>
                </tr>
              ) : filteredReviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">{review.userName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  </td>
                  <td className="px-4 py-4 text-rose-600 font-medium">{review.title || '—'}</td>
                  <td className="px-4 py-4 text-gray-600 max-w-xs truncate">{review.comment}</td>
                  <td className="px-4 py-4 text-gray-600">{review.productId}</td>
                  <td className="px-4 py-4 text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => startEdit(review)} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        <PencilSquareIcon className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDelete(review._id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                        <TrashIcon className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <div>Showing {reviews.length} of {total} reviews</div>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchReviews(page - 1)} disabled={page === 1} className="px-3 py-2 rounded-2xl border border-gray-200 disabled:opacity-40">Previous</button>
              <button onClick={() => fetchReviews(page + 1)} disabled={page >= totalPages} className="px-3 py-2 rounded-2xl border border-gray-200 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
