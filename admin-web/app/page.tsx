'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthService } from '../services/adminAuth.service';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const admin = await AdminAuthService.getCurrentAdmin();
      if (admin) {
        router.replace('/dashboard');
      } else {
        router.replace('/admin-login');
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6FD]">
      <div className="w-8 h-8 border-4 border-[#6515D5]/20 border-t-[#6515D5] rounded-full animate-spin" />
    </div>
  );
}
