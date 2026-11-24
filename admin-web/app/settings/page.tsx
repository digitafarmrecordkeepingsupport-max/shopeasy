'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Shield, CreditCard, Save, CheckCircle, Database, Truck, RefreshCw } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { AdminAuthService } from '../../services/adminAuth.service';
import { AdminSettingsService } from '../../services/adminSettings.service';
import { StoreSettingsData } from '../../types';

export default function SettingsPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('ShopEasy');
  const [supportEmail, setSupportEmail] = useState('qazeembasitoladimeji@gmsail.com');
  const [supportPhone, setSupportPhone] = useState('+234 801 234 5678');
  const [deliveryFee, setDeliveryFee] = useState('2000');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('50000');
  const [bankName, setBankName] = useState('ShopEasy Microfinance / Paystack');
  const [bankAccountNumber, setBankAccountNumber] = useState('0123456789');
  const [bankAccountName, setBankAccountName] = useState('ShopEasy Commerce Nigeria');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const admin = await AdminAuthService.getCurrentAdmin();
    if (!admin) {
      router.push('/admin-login');
      return;
    }
    await loadSettings();
  };

  const loadSettings = async () => {
    setLoading(true);
    const data = await AdminSettingsService.getSettings();
    setStoreName(data.storeName);
    setSupportEmail(data.supportEmail);
    setSupportPhone(data.supportPhone);
    setDeliveryFee(data.deliveryFee.toString());
    setFreeShippingThreshold(data.freeShippingThreshold.toString());
    setBankName(data.bankName);
    setBankAccountNumber(data.bankAccountNumber);
    setBankAccountName(data.bankAccountName);
    setMaintenanceMode(data.maintenanceMode);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await AdminSettingsService.updateSettings(
      {
        storeName,
        supportEmail,
        supportPhone,
        deliveryFee: Number(deliveryFee) || 2000,
        freeShippingThreshold: Number(freeShippingThreshold) || 50000,
        bankName,
        bankAccountNumber,
        bankAccountName,
        maintenanceMode,
      },
      supportEmail
    );
    setSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } else {
      alert(`Error updating settings: ${res.error || 'Failed'}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F6FD]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader searchPlaceholder="Search settings..." />

        <main className="p-8 space-y-7 max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171428] tracking-tight flex items-center space-x-2.5">
                <Settings size={28} className="text-[#6515D5]" />
                <span>Store & System Settings</span>
              </h1>
              <p className="text-sm text-[#77738A] mt-1 font-medium">
                Configure delivery rates, bank checkout accounts, and store parameters synced to the mobile app.
              </p>
            </div>
            <button
              onClick={loadSettings}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-[#EAE6F3] text-[#171428] hover:bg-[#FAF8FE] px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Reload</span>
            </button>
          </div>

          {savedSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-2 text-green-700 text-sm font-bold shadow-sm">
              <CheckCircle size={18} />
              <span>Settings saved & synced to mobile apps in real-time!</span>
            </div>
          )}

          {/* Backend Connection Status Banner */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE6F3] shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                <Database size={24} />
              </div>
              <div>
                <div className="text-sm font-black text-[#171428]">MongoDB Atlas & Cloudinary Live</div>
                <div className="text-xs text-[#77738A]">Connected to cloud cluster with real-time sync</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-[#16A34A] text-xs font-bold rounded-full">
              Connected
            </span>
          </div>

          {/* Settings Form */}
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 border border-[#EAE6F3] shadow-sm space-y-6">
            <h2 className="text-base font-black text-[#171428] border-b border-[#F5F2FA] pb-3">
              Store Profile & Administrator
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Store Brand Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F6FD] border border-[#EAE6F3] rounded-2xl text-sm font-medium text-[#171428] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Super Administrator Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F6FD] border border-[#EAE6F3] rounded-2xl text-sm font-medium text-[#171428] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Customer Support Phone
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F6FD] border border-[#EAE6F3] rounded-2xl text-sm font-medium text-[#171428] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
                />
              </div>
            </div>

            <h2 className="text-base font-black text-[#171428] border-b border-[#F5F2FA] pb-3 pt-3 flex items-center space-x-2">
              <Truck size={18} className="text-[#6515D5]" />
              <span>Delivery & Shipping Rates (Synced to App)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Flat Delivery Fee (₦)
                </label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F6FD] border border-[#EAE6F3] rounded-2xl text-sm font-medium text-[#171428] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
                />
                <span className="text-[11px] text-[#77738A] mt-1 block">Default shipping charge applied at cart checkout.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Free Shipping Threshold (₦)
                </label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F6FD] border border-[#EAE6F3] rounded-2xl text-sm font-medium text-[#171428] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/20 focus:border-[#6515D5]"
                />
                <span className="text-[11px] text-[#77738A] mt-1 block">Orders exceeding this amount automatically receive free delivery.</span>
              </div>
            </div>

            <h2 className="text-base font-black text-[#171428] border-b border-[#F5F2FA] pb-3 pt-3 flex items-center space-x-2">
              <CreditCard size={18} className="text-[#6515D5]" />
              <span>Direct Bank Transfer Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F6FD] border border-[#EAE6F3] rounded-2xl text-sm font-medium text-[#171428]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F6FD] border border-[#EAE6F3] rounded-2xl text-sm font-medium text-[#171428]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F6FD] border border-[#EAE6F3] rounded-2xl text-sm font-medium text-[#171428]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#F5F2FA] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-[#6515D5] hover:bg-[#520FB3] text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
