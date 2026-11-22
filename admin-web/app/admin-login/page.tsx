'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Check, Shield, ArrowRight } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuth.service';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@shopeasy.com');
  const [password, setPassword] = useState('ShopEasyAdmin2026!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await AdminAuthService.login(email, password);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5FE] via-[#F2EAFD] to-[#E9DCFA] flex items-center justify-center p-6 lg:p-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Brand & Portal Description */}
        <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-8">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6515D5] flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <svg viewBox="0 0 40 40" className="w-7 h-7 fill-current">
                <rect x="6" y="12" width="28" height="24" rx="6" fill="#6515D5" />
                <path d="M14 12V8C14 4.68 16.68 2 20 2C23.31 2 26 4.68 26 8V12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M13 18H16L18 27H27L29 20H17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="19" cy="29" r="1.3" fill="#FFFFFF" />
                <circle cx="26" cy="29" r="1.3" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-black tracking-tight leading-none">
                <span className="text-[#6515D5]">Shop</span>
                <span className="text-[#FFB21A]">Easy</span>
              </div>
              <div className="text-xs text-[#77738A] font-semibold tracking-wide mt-1">
                Shop Smarter. Live Better.
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-[#171428] tracking-tight">
              Admin Portal
            </h1>
            <p className="text-lg text-[#55516B] leading-relaxed max-w-lg">
              Manage your store, track orders, and grow your business with ease.
            </p>
          </div>

          {/* Value Checklist */}
          <div className="space-y-3.5">
            {[
              'Add & Manage Products',
              'Track Orders',
              'View Sales Analytics',
              'Manage Customers',
            ].map((text) => (
              <div key={text} className="flex items-center space-x-3 text-base font-bold text-[#171428]">
                <div className="w-6 h-6 rounded-full bg-[#6515D5] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* 3D Dashboard Laptop Illustration Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/80 shadow-xl max-w-lg flex items-center justify-between relative overflow-hidden">
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#6515D5] uppercase tracking-wider">Live Control Center</div>
              <div className="text-base font-black text-[#171428]">Full Single-Vendor System</div>
              <div className="text-xs text-[#77738A]">Connected with Supabase & Expo Mobile App</div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6515D5] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Shield size={32} />
            </div>
          </div>
        </div>

        {/* Right Side: Admin Login Card matching Reference Image 1 */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#EAE6F3] relative">
            {/* Top Shield Emblem */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#6515D5] to-[#8B5CF6] flex items-center justify-center text-white shadow-xl shadow-purple-600/30 transform hover:scale-105 transition">
                  <Shield size={40} className="fill-current text-white/90" />
                  <Lock size={20} className="absolute text-[#36066B]" strokeWidth={2.5} />
                </div>
                {/* Floating soft spheres */}
                <div className="absolute -top-1 -right-2 w-5 h-5 rounded-full bg-purple-200/80 animate-pulse" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-purple-100" />
              </div>
            </div>

            {/* Card Titles */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#171428]">Admin Login</h2>
              <p className="text-sm text-[#77738A] mt-1.5 font-medium">
                Access your store dashboard
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-600">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#77738A]">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#EAE6F3] rounded-2xl text-sm text-[#171428] placeholder-[#A09CB3] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/30 focus:border-[#6515D5] transition font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#171428] uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#77738A]">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-12 py-3 bg-white border border-[#EAE6F3] rounded-2xl text-sm text-[#171428] placeholder-[#A09CB3] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/30 focus:border-[#6515D5] transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#77738A] hover:text-[#171428] transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6515D5] focus:ring-[#6515D5] border-gray-300 rounded cursor-pointer accent-[#6515D5]"
                  />
                  <span className="font-semibold text-[#171428]">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Password Reset Instructions:\nPlease run `node scripts/create-admin.js` to reset store owner password, or reset through the Supabase Authentication dashboard.')}
                  className="font-bold text-[#6515D5] hover:text-[#4A0D9B] transition"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#6515D5] hover:bg-[#520FB3] text-white text-base font-bold shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <ArrowRight size={18} />
                    <span>Login</span>
                  </>
                )}
              </button>

              {/* Security Footer Note */}
              <div className="pt-4 border-t border-[#F3EFFC] text-center space-y-1.5 text-xs text-[#77738A]">
                <div className="flex items-center justify-center space-x-1.5 font-bold text-[#171428]">
                  <Shield size={14} className="text-[#6515D5]" />
                  <span>Secure Access Only</span>
                </div>
                <div className="flex items-center justify-center space-x-1 font-medium">
                  <Lock size={12} />
                  <span>For authorized store owners only</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
