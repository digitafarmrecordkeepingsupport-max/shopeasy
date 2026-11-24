import { UserProfile, UserRole } from '../types';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';

const ADMIN_PROFILE: UserProfile = {
  id: 'usr-admin-qazeem',
  email: 'qazeembasitoladimeji@gmsail.com',
  full_name: 'Qazeem Basit Oladimeji',
  phone_number: '+234 801 234 5678',
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
    return await StorageService.getItem<UserProfile | null>(StorageKeys.USER_SESSION, null);
  },

  /**
   * Log in user
   */
  async login(email: string, _password?: string): Promise<UserProfile> {
    const trimmed = email.toLowerCase().trim();

    // Check if logging in as admin
    const isAdmin =
      trimmed === 'qazeembasitoladimeji@gmsail.com' ||
      trimmed === 'qazeembasitoladimeji@gmail.com' ||
      trimmed.includes('admin');

    const role: UserRole = isAdmin ? 'admin' : 'customer';

    const profile: UserProfile = isAdmin
      ? { ...ADMIN_PROFILE, email: trimmed }
      : {
          id: 'usr-' + Date.now().toString(36),
          email: trimmed,
          full_name: trimmed.split('@')[0],
          role: 'customer',
          created_at: new Date().toISOString(),
        };

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
        console.warn('Supabase login warning, continuing locally:', e);
      }
    }

    await StorageService.setItem(StorageKeys.USER_SESSION, profile);
    return profile;
  },

  /**
   * Register a new customer account
   * Note: Customers can never register themselves as administrators.
   */
  async signUp(data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password?: string;
  }): Promise<UserProfile> {
    const trimmedEmail = data.email.toLowerCase().trim();

    const profile: UserProfile = {
      id: 'usr-' + Date.now().toString(36),
      full_name: data.fullName,
      email: trimmedEmail,
      phone_number: data.phoneNumber,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      role: 'customer', // Strictly customer in mobile application
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
              role: 'customer',
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
   * Request password reset instructions
   */
  async resetPassword(email: string): Promise<boolean> {
    const trimmed = email.toLowerCase().trim();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(trimmed, {
          redirectTo: 'shopeasy://reset-password',
        });
      } catch (e) {
        console.warn('Supabase reset password warning:', e);
      }
    }
    return true;
  },

  /**
   * Switch roles between Customer and Admin
   */
  async switchRole(role: UserRole): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    const target: UserProfile =
      role === 'admin'
        ? ADMIN_PROFILE
        : current && current.role === 'customer'
        ? current
        : {
            id: 'usr-customer-user',
            email: 'customer@shopeasy.com',
            full_name: 'Customer User',
            role: 'customer',
            created_at: new Date().toISOString(),
          };

    await StorageService.setItem(StorageKeys.USER_SESSION, target);
    return target;
  },

  /**
   * Update user profile information
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    const updated: UserProfile = {
      ...(current || ADMIN_PROFILE),
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
