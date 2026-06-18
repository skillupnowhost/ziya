'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Cog6ToothIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export default function AdminSettingsPage() {
  const [codEnabled, setCodEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get('/api/admin/settings')
      .then((r) => {
        const s = r.data.settings;
        if (s.cod_enabled !== undefined) setCodEnabled(!!s.cod_enabled);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleCod = async (enabled: boolean) => {
    setCodEnabled(enabled);
    setSaving(true);
    try {
      await axios.put('/api/admin/settings', { key: 'cod_enabled', value: enabled });
      toast.success(enabled ? 'Cash on Delivery enabled' : 'Cash on Delivery disabled');
    } catch {
      setCodEnabled(!enabled);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-500">
            <Cog6ToothIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Settings</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage store configuration</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Payment Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <BanknotesIcon className="w-4.5 h-4.5 text-emerald-500 w-5 h-5" />
                Payment Settings
              </h2>
            </div>

            <div className="p-6">
              {/* COD Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    When disabled, customers can only pay online via Razorpay. The COD option will be hidden from checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCod(!codEnabled)}
                  disabled={saving}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:opacity-60 ${
                    codEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle Cash on Delivery"
                >
                  <motion.span
                    className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0"
                    animate={{ x: codEnabled ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Status indicator */}
              <div className={`mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                codEnabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                <span className={`w-2 h-2 rounded-full ${codEnabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {codEnabled
                  ? 'Customers can choose Cash on Delivery at checkout'
                  : 'Cash on Delivery is currently disabled for all customers'}
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <span className="text-blue-500 text-lg leading-none shrink-0">i</span>
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Note:</strong> This page requires a <code className="bg-blue-100 px-1 py-0.5 rounded text-[10px]">site_settings</code> table
              in your Supabase database with columns: <code className="bg-blue-100 px-1 py-0.5 rounded text-[10px]">key</code> (text, unique),{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded text-[10px]">value</code> (jsonb),{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded text-[10px]">updated_at</code> (timestamptz).
              If the table doesn&apos;t exist, defaults are used (COD enabled).
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
