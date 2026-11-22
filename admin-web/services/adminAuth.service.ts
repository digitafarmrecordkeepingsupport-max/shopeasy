import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { AdminProfile } from '../types';

const LOCAL_ADMIN_KEY = 'shopeasy_admin_session';

const MOCK_SUPER_ADMIN: AdminProfile = {
  id: 'usr-admin-owner',
  email: 'admin@shopeasy.com',
  full_name: 'Admin',
  phone_number: '+234 801 234 5678',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  role: 'super_admin',
  account_status: 'active',
  created_at: '2025-01-01T00:00:00Z',
};

export const AdminAuthService = {
  async getCurrentAdmin(): Promise<AdminProfile | null> {
    if (typeof window === 'undefined') return null;

    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
          return profile as AdminProfile;
        }
      }
    }

    const saved = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as AdminProfile;
      } catch {
        return null;
      }
    }

    return null;
  },

  async login(email: string, password?: string): Promise<{ profile: AdminProfile; error?: string }> {
    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password || '',
      });

      if (error) {
        return { profile: null as any, error: error.message };
      }

      if (data.user) {
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (pError || !profile) {
          await supabase.auth.signOut();
          return { profile: null as any, error: 'User profile not found.' };
        }

        if (profile.role !== 'admin' && profile.role !== 'super_admin') {
          await supabase.auth.signOut();
          return { profile: null as any, error: 'Access denied: You do not have administrator permissions.' };
        }

        if (profile.account_status !== 'active') {
          await supabase.auth.signOut();
          return { profile: null as any, error: `Account ${profile.account_status}. Please contact support.` };
        }

        const adminData = profile as AdminProfile;
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminData));
        }
        return { profile: adminData };
      }
    }

    // Demo Mode Fallback for local testing without active Supabase keys
    if (cleanEmail.includes('admin') || cleanEmail === 'owner@shopeasy.com') {
      const demoProfile: AdminProfile = {
        ...MOCK_SUPER_ADMIN,
        email: cleanEmail,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(demoProfile));
      }
      return { profile: demoProfile };
    }

    return { profile: null as any, error: 'Invalid admin credentials. Use admin@shopeasy.com for demo.' };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
    }
  },
};
