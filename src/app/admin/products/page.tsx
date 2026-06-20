'use client';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  colors?: string[];
  sizes?: string[];
  sku?: string;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isNewProduct: boolean;
  gstEnabled: boolean;
}

const ACCESSORIES_SUBCATEGORIES = ['earring', 'bracelet', 'chain', 'hair-accessories', 'anti-tarnish-jewellery'] as const;
const SUBCATEGORY_LABELS: Record<string, string> = {
  'earring': 'Earring',
  'bracelet': 'Bracelet',
  'chain': 'Chain',
  'hair-accessories': 'Hair Accessories',
  'anti-tarnish-jewellery': 'Anti Tarnish Jewellery',
};

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const CATEGORY_TAGS: Record<string, string[]> = {
  accessories: ['korean', 'hair', 'cute', 'aesthetic', 'minimal', 'clip', 'pin', 'bow', 'pearl', 'vintage'],
  dresses: ['korean', 'fashion', 'floral', 'summer', 'casual', 'chic', 'midi', 'mini', 'elegant', 'trendy'],
  stationery: ['kawaii', 'pastel', 'journal', 'planner', 'notebook', 'cute', 'aesthetic', 'study'],
};

function generateSKU(name: string, category: string): string {
  const prefix = category.slice(0, 3).toUpperCase();
  const initials = name
    .split(' ')
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${initials || 'XX'}-${suffix}`;
}

const EMPTY_FORM = {
  name: '', description: '', category: 'accessories', subcategory: '', price: '', discountPrice: '',
  stock: '', colors: '', sku: '',
  isFeatured: false, isNew: true, isTrending: false, isActive: true, gstEnabled: true,
};

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteModal({ product, onConfirm, onClose }: { product: Product; onConfirm: () => void; onClose: () => void }) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    await onConfirm();
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Delete Product?</h2>
        <p className="text-sm font-medium text-gray-700 mb-1 line-clamp-1 px-2">{product.name}</p>
        <p className="text-sm text-gray-400 mb-6">This will permanently remove the product from the database and all customer-facing pages. This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <motion.button
            onClick={handle}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold shadow-sm shadow-red-200 disabled:opacity-60 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(239,68,68,0.35)' }}
            whileTap={{ scale: 0.97 }}
          >
            {busy ? (
              <motion.span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <><TrashIcon className="w-4 h-4" />Delete</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);

  // Sizes multi-select
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeDropOpen, setSizeDropOpen] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);

  // Tags chips
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Close size dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) setSizeDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-suggest tags when category changes (only if tags are empty)
  useEffect(() => {
    if (tags.length === 0) {
      setTags(CATEGORY_TAGS[form.category]?.slice(0, 3) || []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category]);

  const fetchProducts = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '10' });
      if (search) params.set('search', search);
      const res = await axios.get(`/api/products?${params}`);
      setProducts(res.data.products || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setPage(p);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImages(prev => [...prev, ...res.data.urls]);
      toast.success(`${res.data.urls.length} image${res.data.urls.length > 1 ? 's' : ''} uploaded!`);
    } catch { toast.error('Image upload failed'); }
    finally { setUploading(false); }
  };

  const toggleSize = (s: string) => {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const openNew = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setSelectedSizes([]);
    setTags(CATEGORY_TAGS['accessories']?.slice(0, 3) || []);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.stock) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const { isNew: isNewVal, subcategory: subcat, ...restForm } = form;
      const { gstEnabled: gstVal, ...payloadRest } = restForm;
      const payload = {
        ...payloadRest,
        isNewProduct: isNewVal,
        gstEnabled: gstVal,
        subcategory: form.category === 'accessories' && subcat ? subcat : undefined,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        stock: Number(form.stock),
        sizes: selectedSizes,
        colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        tags,
        images,
      };

      if (editId) {
        await axios.put(`/api/products/${editId}`, payload);
        toast.success('Product updated!');
      } else {
        await axios.post('/api/products', payload);
        toast.success('Product created!');
      }

      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      setImages([]);
      setSelectedSizes([]);
      setTags([]);
      fetchProducts(page);
    } catch { toast.error('Failed to save product'); }
    finally { setSaving(false); }
  };

  const handleEdit = (p: Product) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category,
      subcategory: p.subcategory || '',
      price: String(p.price),
      discountPrice: String(p.discountPrice || ''),
      stock: String(p.stock),
      colors: p.colors?.join(', ') || '',
      sku: p.sku || '',
      isFeatured: p.isFeatured,
      isNew: p.isNewProduct,
      isTrending: p.isTrending,
      isActive: p.isActive,
      gstEnabled: p.gstEnabled ?? true,
    });
    setImages(p.images || []);
    setSelectedSizes(p.sizes || []);
    setTags(p.tags || CATEGORY_TAGS[p.category]?.slice(0, 3) || []);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      await axios.delete(`/api/products/${deleteModal._id}`);
      toast.success('Product deleted');
      setDeleteModal(null);
      fetchProducts(page);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <>
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Products</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-400 text-white text-sm font-semibold rounded-full hover:bg-rose-500 transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          onKeyDown={(e) => e.key === 'Enter' && fetchProducts(1)}
          className="flex-1 max-w-sm px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300"
        />
        <button onClick={() => fetchProducts(1)} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-xl hover:bg-gray-700 transition-colors">
          Search
        </button>
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{editId ? 'Edit Product' : 'New Product'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{editId ? 'Update product details' : 'Fill in the details below'}</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* ── Image upload ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Product Images</label>
                  {images.length > 0 && (
                    <span className="text-xs text-gray-400">{images.length} image{images.length > 1 ? 's' : ''}</span>
                  )}
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-2xl border border-gray-100" />
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[10px] bg-rose-400 text-white px-1.5 py-0.5 rounded-full font-bold">Main</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? 'border-rose-200 bg-rose-50' : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/40'} ${images.length > 0 ? 'py-3' : 'py-8'}`}>
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-rose-400 font-medium">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <PhotoIcon className="w-7 h-7 text-gray-300" />
                      <span className="text-sm font-medium text-gray-500">{images.length > 0 ? 'Add more images' : 'Upload product images'}</span>
                      <span className="text-xs text-gray-400">Select multiple · JPG, PNG, WebP</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                <p className="text-xs text-gray-400 mt-1">First image = main listing photo</p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* ── Core fields ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Korean Pearl Hair Clip"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-50"
                  />
                </div>

                {/* SKU — auto-generated, editable */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">SKU</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, sku: generateSKU(form.name || 'product', form.category) })}
                      className="text-[10px] font-semibold text-rose-400 hover:text-rose-500 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full transition-colors"
                    >
                      ↺ Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="ACC-HP-7X3K"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => { setForm({ ...form, category: e.target.value, subcategory: '' }); setTags([]); }}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 bg-white"
                  >
                    {['accessories', 'dresses', 'stationery'].map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory (only for accessories) */}
                {form.category === 'accessories' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Subcategory</label>
                    <select
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 bg-white"
                    >
                      <option value="">Select subcategory...</option>
                      {ACCESSORIES_SUBCATEGORIES.map(sc => (
                        <option key={sc} value={sc}>{SUBCATEGORY_LABELS[sc]}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="1999"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-50"
                  />
                </div>

                {/* Discount Price */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    placeholder="1499"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-50"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Stock *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="50"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-50"
                  />
                </div>

                {/* Colors */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Colors</label>
                  <input
                    type="text"
                    value={form.colors}
                    onChange={(e) => setForm({ ...form, colors: e.target.value })}
                    placeholder="Pink, White, Black"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-50"
                  />
                </div>
              </div>

              {/* ── Sizes checkbox dropdown ── */}
              <div ref={sizeRef} className="relative">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Sizes</label>
                <button
                  type="button"
                  onClick={() => setSizeDropOpen(o => !o)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 bg-white hover:border-rose-300 transition-colors"
                >
                  <span className={selectedSizes.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                    {selectedSizes.length === 0 ? 'Select sizes...' : selectedSizes.join(', ')}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${sizeDropOpen ? 'rotate-180' : ''}`} />
                </button>
                {sizeDropOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 p-2">
                    <div className="flex flex-wrap gap-2 p-1">
                      {ALL_SIZES.map(s => {
                        const checked = selectedSizes.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSize(s)}
                            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                              checked
                                ? 'bg-rose-400 text-white border-rose-400 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-400'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                    <div className="px-2 pt-1 pb-1 border-t border-gray-100 mt-1">
                      <button
                        type="button"
                        onClick={() => { setSelectedSizes(selectedSizes.length === ALL_SIZES.length ? [] : [...ALL_SIZES]); }}
                        className="text-xs text-rose-400 hover:text-rose-500 font-medium"
                      >
                        {selectedSizes.length === ALL_SIZES.length ? 'Clear all' : 'Select all'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Tags chips ── */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tags</label>
                  <button
                    type="button"
                    onClick={() => setTags(CATEGORY_TAGS[form.category] || [])}
                    className="text-[10px] font-semibold text-rose-400 hover:text-rose-500 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full transition-colors"
                  >
                    ✦ Auto-suggest
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2.5 border border-gray-200 rounded-xl focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-50 bg-white">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-500 text-xs font-semibold rounded-lg">
                      #{tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-rose-300 hover:text-rose-500">
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? 'Type tag + Enter...' : '+ add'}
                    className="flex-1 min-w-[80px] text-sm outline-none placeholder-gray-300 bg-transparent"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add · Backspace to remove last</p>
              </div>

              {/* ── Description ── */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-50 resize-none"
                />
              </div>

              {/* ── Toggles ── */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Visibility & Labels</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'isActive', label: 'Active (visible)', color: 'emerald' },
                    { key: 'isNew', label: 'Mark as New', color: 'blue' },
                    { key: 'isTrending', label: 'Trending', color: 'rose' },
                    { key: 'isFeatured', label: 'Featured', color: 'amber' },
                    { key: 'gstEnabled', label: 'GST Applicable', color: 'indigo' },
                  ].map((toggle) => {
                    const checked = form[toggle.key as keyof typeof form] as boolean;
                    return (
                      <label key={toggle.key} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${checked ? 'border-rose-200 bg-rose-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setForm({ ...form, [toggle.key]: e.target.checked })}
                          className="w-4 h-4 accent-rose-400"
                        />
                        <span className={`text-sm font-medium ${checked ? 'text-rose-600' : 'text-gray-600'}`}>{toggle.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-1 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-rose-400 text-white font-semibold rounded-full hover:bg-rose-500 transition-colors disabled:opacity-50 text-sm shadow-sm"
                >
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-full hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop table ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No products found</td></tr>
              ) : products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0] || 'https://via.placeholder.com/40'} alt={p.name} className="w-10 h-12 object-cover rounded-xl" />
                      <span className="font-medium text-gray-800 line-clamp-1 max-w-[160px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800">₹{(p.discountPrice || p.price).toLocaleString()}</span>
                    {p.discountPrice && <span className="text-xs text-gray-400 line-through ml-1">₹{p.price}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock > 10 ? 'text-emerald-600' : p.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.isActive && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Active</span>}
                      {p.isTrending && <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">Trending</span>}
                      {p.isNewProduct && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">New</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => handleEdit(p)} className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-50 rounded-lg transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <motion.button type="button" onClick={() => setDeleteModal(p)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.88 }}>
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => fetchProducts(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
              <button type="button" onClick={() => fetchProducts(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile card list ── */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
              <div className="flex gap-3">
                <div className="w-14 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">No products found</div>
        ) : (
          products.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex gap-3">
                <img src={p.images[0] || 'https://via.placeholder.com/56'} alt={p.name} className="w-14 h-16 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{p.name}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{p.category}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="font-bold text-gray-900 text-sm">₹{(p.discountPrice || p.price).toLocaleString()}</span>
                    {p.discountPrice && <span className="text-xs text-gray-400 line-through">₹{p.price}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock > 10 ? 'bg-emerald-50 text-emerald-600' : p.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>
                    Stock: {p.stock}
                  </span>
                  {p.isActive && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Active</span>}
                  {p.isTrending && <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">Trending</span>}
                  {p.isNewProduct && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">New</span>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" title="Edit product" onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-50 rounded-xl transition-colors">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button type="button" title="Delete product" onClick={() => setDeleteModal(p)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => fetchProducts(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 bg-white">Previous</button>
              <button type="button" onClick={() => fetchProducts(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 bg-white">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Delete confirm modal */}
    <AnimatePresence>
      {deleteModal && (
        <DeleteModal
          key="delete-modal"
          product={deleteModal}
          onConfirm={confirmDelete}
          onClose={() => setDeleteModal(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
