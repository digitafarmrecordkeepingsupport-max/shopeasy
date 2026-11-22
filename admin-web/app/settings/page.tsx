'use client';

import React, { useState } from 'react';
import { Settings, Shield, CreditCard, Save, CheckCircle } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('ShopEasy');
  const [supportEmail, setSupportEmail] = useState('admin@shopeasy.com');
  const [supportPhone, setSupportPhone] = useState('+234 801 234 5678');
  const [deliveryFee, setDeliveryFee] = useState('2000');
  const [vipThreshold, setVipThreshold] = useState('200000');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search settings..." />

        <main className="p-8 space-y-7 max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight flex items-center space-x-2.5">
              <Settings size={28} className="text-[#6515D5]" />
              <span>Store Settings</span>
            </h1>
            <p className="text-sm text-[#77738A] mt-1 font-medium">
              Configure business profile, delivery rates, and backend payment settings.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-2 text-green-700 text-sm font-bold">
              <CheckCircle size={18} />
              <span>Settings successfully updated!</span>
            </div>
          )}

          {/* Backend Connection Status Banner */}
          <div className="bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isConnected ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-[#6515D5]'}`}>
                <Shield size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#171428]">Supabase Backend Integration</h4>
                <p className="text-xs text-[#77738A] mt-0.5">
                  {isConnected
                    ? 'Connected to live Supabase PostgreSQL database.'
                    : 'Running in Local Fast-Dev Demo Mode. Add NEXT_PUBLIC_SUPABASE_URL in .env to connect.'}
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-[#6515D5]'}`}>
              {isConnected ? 'Active & Synced' : 'Demo Active'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-8 border border-[#EAE6F3] shadow-sm space-y-6">
            <h3 className="text-lg font-black text-[#171428]">Store Configuration</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#171428] mb-1.5">Store Brand Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] mb-1.5">Support Email</label>
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] mb-1.5">Support Phone (Nigeria)</label>
                <input
                  type="text"
                  required
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] mb-1.5">Default Delivery Fee (₦)</label>
                <input
                  type="number"
                  required
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] mb-1.5">VIP Customer Spend Threshold (₦)</label>
                <input
                  type="number"
                  required
                  value={vipThreshold}
                  onChange={(e) => setVipThreshold(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-xl text-sm text-[#171428]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#6515D5] hover:bg-[#520FB3] text-white text-sm font-bold shadow-md shadow-purple-600/20 transition flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save Store Settings</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
