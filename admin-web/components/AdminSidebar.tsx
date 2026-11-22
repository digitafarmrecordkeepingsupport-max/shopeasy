'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Grid,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  ChevronRight,
  Rocket,
} from 'lucide-react';
import { AdminAuthService } from '../services/adminAuth.service';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  hasSubmenu?: boolean;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Products', href: '/products', icon: <Package size={20} />, hasSubmenu: true },
    { label: 'Orders', href: '/orders', icon: <ShoppingCart size={20} />, badge: 3 },
    { label: 'Customers', href: '/customers', icon: <Users size={20} /> },
    { label: 'Categories', href: '/categories', icon: <Grid size={20} /> },
    { label: 'Analytics', href: '/analytics', icon: <BarChart3 size={20} /> },
    { label: 'Marketing', href: '/marketing', icon: <Megaphone size={20} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = async () => {
    await AdminAuthService.logout();
    router.push('/admin-login');
  };

  return (
    <aside className="w-64 bg-[#36066B] text-white flex flex-col min-h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-5 border-b border-purple-800/40">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#6515D5] shadow-md">
            <svg viewBox="0 0 40 40" className="w-6 h-6 fill-current">
              <rect x="6" y="12" width="28" height="24" rx="6" fill="#6515D5" />
              <path d="M14 12V8C14 4.68 16.68 2 20 2C23.31 2 26 4.68 26 8V12" stroke="#6515D5" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <path d="M13 18H16L18 27H27L29 20H17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="19" cy="29" r="1.3" fill="#FFFFFF" />
              <circle cx="26" cy="29" r="1.3" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-black tracking-tight leading-none">
              <span className="text-white">Shop</span>
              <span className="text-[#FFB21A]">Easy</span>
            </div>
            <div className="text-[10px] text-purple-200/70 font-medium tracking-wide mt-1">
              Shop Smarter. Live Better.
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#5510A8] text-white shadow-sm shadow-purple-950/20'
                  : 'text-purple-200/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className={isActive ? 'text-white' : 'text-purple-300'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className="bg-[#EF4444] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.hasSubmenu && (
                  <ChevronRight size={16} className="text-purple-300/70" />
                )}
              </div>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-purple-200/80 hover:bg-white/5 hover:text-white transition-all text-left"
        >
          <LogOut size={20} className="text-purple-300" />
          <span>Logout</span>
        </button>
      </nav>

      {/* Bottom Promo Card: "Grow Your Business" */}
      <div className="p-4 pt-0">
        <div className="bg-gradient-to-br from-[#4A0D9B] to-[#2B045B] rounded-2xl p-4 border border-purple-400/20 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold text-white">Grow Your</div>
              <div className="text-sm font-bold text-white">Business</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-[#FFB21A]">
              <Rocket size={18} />
            </div>
          </div>

          <p className="text-[11px] text-purple-200/80 mt-2 mb-3 leading-tight">
            Manage your store efficiently with ShopEasy.
          </p>

          <button className="w-full py-2 px-3 rounded-xl bg-[#FFB21A] hover:bg-[#E69E10] text-[#171428] text-xs font-bold transition shadow-sm flex items-center justify-center space-x-1">
            <span>Upgrade Plan →</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
