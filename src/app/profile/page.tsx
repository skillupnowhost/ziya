'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  PlusIcon,
  TrashIcon,
  HeartIcon,
  MapPinIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
  StarIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/solid';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Address {
  doorNumber: string;
  streetName: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

type Tab = 'profile' | 'addresses' | 'favourites';

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const { items: wishlistItems, remove: removeWishlist } = useWishlist();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const initialTab = (searchParams.get('tab') as Tab) || 'profile';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    doorNumber: '', streetName: '', landmark: '', city: '', state: '', pincode: '', country: 'India',
  });
  const [activeSuggestionField, setActiveSuggestionField] = useState<keyof Address | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [removeAddrIdx, setRemoveAddrIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
    if (user) {
      setForm({ name: user.name || '', phone: '' });
      axios.get('/api/auth/me').then((r) => {
        setForm({ name: r.data.user.name || '', phone: r.data.user.phone || '' });
        setAddresses(r.data.user.addresses || []);
      }).catch(console.error);
    }
  }, [user, authLoading, router]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.put('/api/auth/me', { name: form.name, phone: form.phone });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async () => {
    if (!newAddress.doorNumber || !newAddress.streetName || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all required address fields');
      return;
    }
    const updated = [...addresses, newAddress];
    try {
      await axios.put('/api/auth/me', { addresses: updated });
      setAddresses(updated);
      setNewAddress({ doorNumber: '', streetName: '', landmark: '', city: '', state: '', pincode: '', country: 'India' });
      setShowAddForm(false);
      toast.success('Address added!');
    } catch {
      toast.error('Failed to add address');
    }
  };

  const removeAddress = async (idx: number) => {
    const updated = addresses.filter((_, i) => i !== idx);
    try {
      await axios.put('/api/auth/me', { addresses: updated });
      setAddresses(updated);
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image too large. Max 5MB.'); return; }
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await axios.post('/api/auth/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: res.data.user.avatar });
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    if (!user?.avatar) return;
    setAvatarUploading(true);
    try {
      await axios.delete('/api/auth/avatar');
      updateUser({ avatar: undefined });
      toast.success('Profile photo removed');
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center profile-hero-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-[3px] border-rose-300/30 border-t-rose-400 animate-spin" />
          <p className="text-sm text-rose-200/70 font-medium tracking-wide">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'profile',    label: 'Profile',    icon: <UserIcon className="w-4 h-4" /> },
    { key: 'addresses',  label: 'Addresses',  icon: <MapPinIcon className="w-4 h-4" />,  badge: addresses.length || undefined },
    { key: 'favourites', label: 'Favourites', icon: <HeartIcon className="w-4 h-4" />,   badge: wishlistItems.length || undefined },
  ];

  const initials = (user?.name || 'Z').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <motion.div
        className="relative profile-hero-bg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 left-1/3 w-64 h-64 rounded-full bg-pink-600/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-72 h-72 rounded-full bg-fuchsia-800/20 blur-3xl" />

        {/* Fine dot-grid overlay */}
        <div
          className="hero-dot-grid pointer-events-none absolute inset-0 opacity-[0.07]"
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

            {/* Avatar stack */}
            <div className="relative shrink-0 flex items-center justify-center group/avatar">
              {/* Pulsing ring */}
              <span className="absolute inset-0 rounded-full avatar-ring bg-rose-400/40" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white/20 shadow-2xl overflow-hidden bg-gradient-to-br from-rose-300 to-pink-500 flex items-center justify-center">
                {avatarUploading ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <svg className="animate-spin w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : (
                  <>
                    {user?.avatar
                      ? <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                      : <span className="text-3xl font-black text-white select-none">{initials}</span>
                    }
                    {/* Hover overlay — camera icon */}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer rounded-full"
                      title="Change photo"
                    >
                      <CameraIcon className="w-7 h-7 text-white drop-shadow" />
                    </button>
                  </>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                title="Upload profile photo"
                aria-label="Upload profile photo"
                onChange={handleAvatarChange}
              />

              {/* Verified badge */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-2 border-white shadow-lg flex items-center justify-center">
                <CheckBadgeIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Avatar action buttons (visible below avatar on mobile, or as small pills) */}
            <div className="flex gap-2 mt-1 sm:hidden">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-white/15 hover:bg-white/25 text-white rounded-full transition-all disabled:opacity-50"
              >
                <CameraIcon className="w-3.5 h-3.5" />
                {user?.avatar ? 'Change' : 'Add Photo'}
              </button>
              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  disabled={avatarUploading}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-red-500/20 hover:bg-red-500/35 text-white rounded-full transition-all disabled:opacity-50"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            {/* Name block */}
            <div className="text-center sm:text-left flex-1 min-w-0 pb-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <SparklesIcon className="w-4 h-4 text-rose-300 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-rose-300/80">Ziya Member</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-1.5 truncate">
                {user?.name || 'My Account'}
              </h1>
              <p className="text-sm text-white/50 truncate">{user?.email}</p>
            </div>

            {/* Orders pill */}
            <a
              href="/orders"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold tracking-wide transition-all"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              My Orders
            </a>
          </div>

          {/* Stats row */}
          <motion.div
            className="grid grid-cols-3 gap-3 mt-8 max-w-md mx-auto sm:mx-0"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
          >
            {[
              { label: 'Saved Addresses', value: addresses.length, icon: <MapPinIcon className="w-4 h-4" /> },
              { label: 'Wishlist Items',  value: wishlistItems.length, icon: <HeartSolid className="w-4 h-4" /> },
              { label: 'Member Since',   value: '2026', icon: <StarIcon className="w-4 h-4" /> },
            ].map((s) => (
              <motion.div
                key={s.label}
                className="stat-glass rounded-2xl p-3 sm:p-4 text-center group hover:bg-white/20 transition-colors cursor-default"
                variants={{ hidden: { opacity: 0, y: 16, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className="flex justify-center mb-1 text-rose-300/70">{s.icon}</div>
                <p className="text-xl sm:text-2xl font-black text-white tabular-nums">{s.value}</p>
                <p className="text-[10px] text-white/50 mt-0.5 leading-tight">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════════════ BODY ═══════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">

        {/* Floating Tab Bar */}
        <div className="flex gap-1.5 p-1.5 mb-7 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-200/60 border border-white/60">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${
                activeTab === t.key
                  ? 'bg-gradient-to-br from-rose-400 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40 scale-[1.02]'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50/80'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className={`min-w-[20px] h-5 px-1 text-[10px] font-black rounded-full flex items-center justify-center ${
                  activeTab === t.key
                    ? 'bg-white/25 text-white'
                    : 'bg-rose-100 text-rose-500'
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            className="grid grid-cols-1 lg:grid-cols-5 gap-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >

            {/* Form — takes 3 cols */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm shadow-gray-100/80 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-200">
                  <UserIcon className="w-4.5 h-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-black text-gray-900 leading-none">Personal Info</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Update your details below</p>
                </div>
                {/* Desktop photo buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-all disabled:opacity-50"
                  >
                    <CameraIcon className="w-3.5 h-3.5" />
                    {avatarUploading ? 'Uploading…' : user?.avatar ? 'Change Photo' : 'Add Photo'}
                  </button>
                  {user?.avatar && !avatarUploading && (
                    <button
                      type="button"
                      onClick={handleAvatarDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-400 rounded-xl transition-all"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-gray-400 mb-2 group-focus-within:text-rose-500 transition-colors">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-rose-400 transition-colors" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:bg-white focus:border-rose-300 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-gray-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      title="Email address"
                      placeholder="your@email.com"
                      className="w-full pl-11 pr-20 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-semibold text-gray-400 cursor-not-allowed"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100">
                      <CheckBadgeIcon className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-gray-400 mb-2 group-focus-within:text-rose-500 transition-colors">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-rose-400 transition-colors" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 00000 00000"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:bg-white focus:border-rose-300 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="mt-7 w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 text-white text-sm font-black tracking-wide shadow-lg shadow-rose-200/60 hover:shadow-xl hover:shadow-rose-300/50 hover:scale-[1.01] active:scale-100 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            {/* Side panel — 2 cols */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Quick links */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <p className="px-5 pt-5 pb-3 text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">Quick Access</p>
                {[
                  {
                    label: 'Manage Addresses',
                    desc: `${addresses.length} saved`,
                    icon: <MapPinIcon className="w-5 h-5 text-rose-400" />,
                    color: 'from-rose-50 to-pink-50',
                    action: () => setActiveTab('addresses'),
                  },
                  {
                    label: 'Wishlist',
                    desc: `${wishlistItems.length} items`,
                    icon: <HeartSolid className="w-5 h-5 text-rose-400" />,
                    color: 'from-pink-50 to-fuchsia-50',
                    action: () => setActiveTab('favourites'),
                  },
                  {
                    label: 'My Orders',
                    desc: 'Track & return',
                    icon: <ShoppingBagIcon className="w-5 h-5 text-rose-400" />,
                    color: 'from-rose-50 to-orange-50',
                    action: () => router.push('/orders'),
                  },
                ].map((item, i, arr) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className={`w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-rose-50/40 transition-all text-left ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{item.label}</p>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Member card */}
              <div className="relative overflow-hidden rounded-3xl profile-hero-bg p-5 shadow-lg">
                <div className="pointer-events-none absolute -top-6 -right-6 w-28 h-28 rounded-full bg-rose-400/20 blur-2xl" />
                <SparklesIcon className="w-5 h-5 text-rose-300 mb-3" />
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-300/80 mb-1">Ziya Member</p>
                <p className="text-lg font-black text-white leading-snug">{user?.name || 'Fashion Fan'}</p>
                <p className="text-[11px] text-white/40 mt-0.5 truncate">{user?.email}</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Member Since 2026</span>
                  <CheckBadgeIcon className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ADDRESSES TAB ───────────────────────────────────────── */}
        {activeTab === 'addresses' && (
          <motion.div
            key="addresses"
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >

            {addresses.length === 0 && !showAddForm && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-14 text-center">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="w-8 h-8 text-rose-300" />
                </div>
                <h3 className="font-black text-gray-800 mb-1">No saved addresses</h3>
                <p className="text-sm text-gray-400">Add a delivery address to speed up checkout.</p>
              </div>
            )}

            {addresses.map((addr, i) => (
              <motion.div
                key={i}
                className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-rose-100/30 transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-pink-400 rounded-l-3xl" />
                <div className="flex items-start justify-between gap-4 p-5 pl-6">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 flex items-center justify-center shrink-0">
                      <MapPinIcon className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-gray-900 text-sm truncate">{addr.doorNumber}{addr.streetName ? `, ${addr.streetName}` : ''}</p>
                      {addr.landmark && <p className="text-xs text-gray-400 mt-0.5 truncate">Near {addr.landmark}</p>}
                      <p className="text-sm text-gray-500 mt-0.5">{addr.city}, {addr.state} — {addr.pincode}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {addr.country}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveAddrIdx(i)}
                    aria-label="Remove address"
                    title="Remove address"
                    className="p-2.5 rounded-2xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {showAddForm ? (
              <div className="bg-white rounded-3xl border-2 border-rose-200/60 shadow-lg shadow-rose-100/20 p-6 sm:p-7 space-y-5 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                    <PlusIcon className="w-4 h-4 text-rose-400" />
                  </div>
                  <h3 className="font-black text-gray-900">New Address</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { key: 'doorNumber',  label: 'Door / Flat Number',  placeholder: 'e.g. 12B, Flat 3', full: false, required: true },
                    { key: 'streetName',  label: 'Street Name',         placeholder: 'Street or area name', full: false, required: true },
                    { key: 'landmark',    label: 'Landmark (optional)',  placeholder: 'Near park, school…', full: true,  required: false },
                    { key: 'city',        label: 'City',                 placeholder: 'City',               full: false, required: true },
                    { key: 'state',       label: 'State',                placeholder: 'State',              full: false, required: true },
                    { key: 'pincode',     label: 'PIN Code',             placeholder: '6-digit PIN',        full: false, required: true },
                  ] as { key: keyof Address; label: string; placeholder: string; full?: boolean; required: boolean }[]).map((f) => {
                    const suggestions = Array.from(new Set(
                      addresses.map((a) => a[f.key]).filter(Boolean)
                    )) as string[];
                    const fieldVal = newAddress[f.key];
                    const filtered = suggestions.filter(
                      (s) => s.toLowerCase().includes(fieldVal.toLowerCase()) && s !== fieldVal
                    );
                    return (
                    <div key={f.key} className={`relative ${f.full ? 'sm:col-span-2' : ''}`}>
                      <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-gray-400 mb-2">
                        {f.label}{f.required && <span className="text-rose-400 ml-0.5">*</span>}
                      </label>
                      <input
                        type="text"
                        value={newAddress[f.key]}
                        onChange={(e) => setNewAddress({ ...newAddress, [f.key]: e.target.value })}
                        onFocus={() => setActiveSuggestionField(f.key)}
                        onBlur={() => setTimeout(() => setActiveSuggestionField(null), 150)}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:bg-white focus:border-rose-300 transition-all"
                      />
                      {activeSuggestionField === f.key && filtered.length > 0 && (
                        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-rose-100 rounded-2xl shadow-lg overflow-hidden">
                          {filtered.slice(0, 4).map((s) => (
                            <li
                              key={s}
                              onMouseDown={() => setNewAddress({ ...newAddress, [f.key]: s })}
                              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    onClick={addAddress}
                    className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/40 hover:scale-[1.01] transition-all"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 sm:flex-none px-8 py-3.5 border-2 border-gray-100 text-gray-500 text-sm font-bold rounded-2xl hover:border-gray-200 hover:text-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center gap-2.5 w-full py-5 border-2 border-dashed border-gray-200 rounded-3xl text-sm font-bold text-gray-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-all group"
              >
                <span className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                  <PlusIcon className="w-4 h-4" />
                </span>
                Add New Address
              </button>
            )}
          </motion.div>
        )}

        {/* ── FAVOURITES TAB ──────────────────────────────────────── */}
        {activeTab === 'favourites' && (
          <motion.div
            key="favourites"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {wishlistItems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-20 text-center">
                {/* Heart illustration */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <HeartIcon className="w-12 h-12 text-rose-300" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
                    <PlusIcon className="w-4 h-4 text-white" />
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8 leading-relaxed">
                  Tap the heart on any product to save it here and shop it later.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/40 hover:scale-[1.02] transition-all"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Explore Products
                </Link>
              </div>
            ) : (
              <>
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">
                      Saved Items
                      <span className="ml-2 text-xs font-bold bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full align-middle">
                        {wishlistItems.length}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Your curated collection</p>
                  </div>
                  <Link
                    href="/products"
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-600 transition-colors bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add more
                  </Link>
                </div>

                {/* Grid */}
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
                >
                  {wishlistItems.map((item, idx) => {
                    const discountPct = item.discountPrice
                      ? Math.round((1 - item.discountPrice / item.price) * 100)
                      : 0;
                    return (
                      <motion.div
                        key={item.productId}
                        className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-rose-100/40 hover:-translate-y-1.5 transition-all duration-300"
                        variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } }}
                        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {/* Image area */}
                        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=533&fit=crop'}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />

                          {/* Badges */}
                          {discountPct > 0 && (
                            <div className="absolute top-2.5 left-2.5 bg-gradient-to-br from-rose-400 to-pink-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                              -{discountPct}%
                            </div>
                          )}

                          {/* Gradient overlay on hover */}
                          <div className="duration-400 absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Slide-up hover panel */}
                          <div className="wish-card-overlay absolute bottom-0 left-0 right-0 p-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => removeWishlist(item.productId)}
                              aria-label="Remove from wishlist"
                              className="flex-none w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-red-400/80 transition-colors"
                            >
                              <HeartSolid className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/products/${item.productId}`}
                              className="flex-1 h-9 rounded-xl bg-white text-gray-900 text-xs font-black flex items-center justify-center hover:bg-rose-400 hover:text-white transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-rose-400 mb-1">{item.category}</p>
                          <Link href={`/products/${item.productId}`}>
                            <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug hover:text-rose-500 transition-colors">
                              {item.name}
                            </h4>
                          </Link>
                          <div className="flex items-baseline gap-1.5 mt-2">
                            <span className="text-sm font-black text-gray-900">
                              ₹{(item.discountPrice || item.price).toLocaleString()}
                            </span>
                            {item.discountPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{item.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    <ConfirmDialog
      open={removeAddrIdx !== null}
      type="danger"
      title="Remove address?"
      message="This address will be permanently removed from your saved list."
      confirmLabel="Remove"
      cancelLabel="Keep it"
      onConfirm={() => { if (removeAddrIdx !== null) removeAddress(removeAddrIdx); setRemoveAddrIdx(null); }}
      onCancel={() => setRemoveAddrIdx(null)}
    />
    </div>
  );
}
