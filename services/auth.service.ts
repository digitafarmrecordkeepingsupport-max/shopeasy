import { UserProfile, UserRole } from '../types';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';

const DEFAULT_CUSTOMER: UserProfile = {
  id: 'usr-customer-jane',
  email: 'jane.doe@gmail.com',
  full_name: 'Jane Doe',
  phone_number: '+234 801 234 5678',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  role: 'customer',
  created_at: new Date().toISOString(),
};

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr-admin-owner',
  email: 'admin@shopeasy.com',
  full_name: 'Store Owner',
  phone_number: '+234 802 987 6543',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  role: 'admin',
  created_at: new Date().toISOString(),
};

export const AuthService = {
  /**
   * Check if user completed onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    return await StorageService.getItem<boolean>(StorageKeys.ONBOARDING_COMPLETED, false);
  },

  /**
   * Mark onboarding completed
   */
  async setOnboardingCompleted(completed = true): Promise<void> {
    await StorageService.setItem(StorageKeys.ONBOARDING_COMPLETED, completed);
  },

  /**
   * Get current authenticated user session
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    return await StorageService.getItem<UserProfile | null>(StorageKeys.USER_SESSION, DEFAULT_CUSTOMER);
  },

  /**
   * Log in user
   */
  async login(email: string, _password?: string): Promise<UserProfile> {
    const trimmed = email.toLowerCase().trim();

    // Check if logging in as admin
    const role: UserRole = trimmed.includes('admin') ? 'admin' : 'customer';
    const profile: UserProfile = role === 'admin'
      ? { ...DEFAULT_ADMIN, email: trimmed }
      : { ...DEFAULT_CUSTOMER, email: trimmed };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase.auth.signInWithPassword({
          email: trimmed,
          password: _password || 'password123',
        });
        if (data?.user) {
          profile.id = data.user.id;
          profile.email = data.user.email || profile.email;
        }
      } catch (e) {
        console.warn('Supabase login warning, continuing in demo mode:', e);
      }
    }

    await StorageService.setItem(StorageKeys.USER_SESSION, profile);
    return profile;
  },

  /**
   * Register a new account
   */
  async signUp(data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password?: string;
  }): Promise<UserProfile> {
    const profile: UserProfile = {
      id: 'usr-' + Date.now().toString(36),
      full_name: data.fullName,
      email: data.email.toLowerCase().trim(),
      phone_number: data.phoneNumber,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      role: data.email.toLowerCase().includes('admin') ? 'admin' : 'customer',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase && data.password) {
      try {
        await supabase.auth.signUp({
          email: profile.email,
          password: data.password,
          options: {
            data: {
              full_name: profile.full_name,
              phone_number: profile.phone_number,
              role: profile.role,
            },
          },
        });
      } catch (e) {
        console.warn('Supabase sign up warning, continuing locally:', e);
      }
    }

    await StorageService.setItem(StorageKeys.USER_SESSION, profile);
    return profile;
  },

  /**
   * Switch roles between Customer and Store Owner (admin) for demo testing
   */
  async switchRole(role: UserRole): Promise<UserProfile> {
    const target = role === 'admin' ? DEFAULT_ADMIN : DEFAULT_CUSTOMER;
    await StorageService.setItem(StorageKeys.USER_SESSION, target);
    return target;
  },

  /**
   * Update user profile information
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    const updated: UserProfile = {
      ...(current || DEFAULT_CUSTOMER),
      ...updates,
    };
    await StorageService.setItem(StorageKeys.USER_SESSION, updated);
    return updated;
  },

  /**
   * Log out
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }
    await StorageService.removeItem(StorageKeys.USER_SESSION);
  },
};
