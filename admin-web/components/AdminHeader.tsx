'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import { AdminAuthService } from '../services/adminAuth.service';
import { AdminProfile } from '../types';

interface AdminHeaderProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export default function AdminHeader({
  searchPlaceholder = 'Search products, orders...',
  onSearch,
}: AdminHeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  useEffect(() => {
    AdminAuthService.getCurrentAdmin().then(setAdmin);
  }, []);

  const handleLogout = async () => {
    await AdminAuthService.logout();
    router.push('/admin-login');
  };

  return (
    <header className="h-20 bg-white border-b border-[#EAE6F3] px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77738A]">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onSearch?.(e.target.value);
          }}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 bg-[#F7F5FC] border border-[#EAE6F3] rounded-full text-sm text-[#171428] placeholder-[#77738A] focus:outline-none focus:ring-2 focus:ring-[#6515D5]/30 focus:border-[#6515D5] transition"
        />
      </div>

      {/* Right Controls: Admin Profile */}
      <div className="flex items-center space-x-6">
        {/* Admin Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-1.5 pl-2 pr-3 rounded-full hover:bg-[#F7F5FC] transition border border-transparent hover:border-[#EAE6F3]"
          >
            <div className="w-9 h-9 rounded-full bg-purple-100 overflow-hidden border border-[#EAE6F3] flex items-center justify-center text-[#6515D5] font-black text-xs">
              {admin?.full_name ? admin.full_name.charAt(0) : 'A'}
            </div>
            <div className="flex items-center space-x-1.5 text-sm font-bold text-[#171428]">
              <span>{admin?.full_name || 'Admin'}</span>
              <ChevronDown size={15} className="text-[#77738A]" />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EAE6F3] py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-[11px] text-[#77738A]">Signed in as</div>
                <div className="text-xs font-bold text-[#171428] truncate">
                  {admin?.email || 'qazeembasitoladimeji@gmsail.com'}
                </div>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/settings');
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#171428] hover:bg-[#F7F5FC] flex items-center space-x-2"
              >
                <User size={16} className="text-[#77738A]" />
                <span>Store Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-[#EF4444] hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
