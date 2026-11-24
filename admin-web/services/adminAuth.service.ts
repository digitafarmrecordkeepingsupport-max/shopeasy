import { AdminProfile } from '../types';

const LOCAL_ADMIN_KEY = 'shopeasy_admin_session';
const AUTHORIZED_ADMIN_EMAILS = [
  'qazeembasitoladimeji@gmsail.com',
  'qazeembasitoladimeji@gmail.com',
];
const AUTHORIZED_ADMIN_PASSWORD = 'qazeem99';

const AUTHORIZED_ADMIN_PROFILE: AdminProfile = {
  id: 'usr-admin-qazeem',
  email: 'qazeembasitoladimeji@gmsail.com',
  full_name: 'Qazeem Basit Oladimeji',
  phone_number: '+234 801 234 5678',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  role: 'super_admin',
  account_status: 'active',
  created_at: '2026-01-01T00:00:00Z',
};

export const AdminAuthService = {
  /**
   * Retrieves the current authenticated admin session
   * Verifies that the saved session belongs exclusively to the authorized admin
   */
  async getCurrentAdmin(): Promise<AdminProfile | null> {
    if (typeof window === 'undefined') return null;

    const saved = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (!saved) return null;

    try {
      const profile = JSON.parse(saved) as AdminProfile;
      const cleanEmail = (profile.email || '').toLowerCase().trim();

      if (AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
        return profile;
      }
      // If someone injected an unauthorized email, clear it immediately
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      return null;
    } catch {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      return null;
    }
  },

  /**
   * Authenticates the admin
   * STRICT ACCESS CONTROL: Only qazeembasitoladimeji@gmsail.com / qazeembasitoladimeji@gmail.com with password qazeem99
   */
  async login(
    email: string,
    password?: string
  ): Promise<{ profile: AdminProfile | null; error?: string }> {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    // 1. Email format validation
    if (!cleanEmail) {
      return { profile: null, error: 'Email address is required.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { profile: null, error: 'Please enter a valid email address.' };
    }

    // 2. Password validation
    if (!cleanPassword) {
      return { profile: null, error: 'Password is required.' };
    }

    // 3. Strict Admin Access Check
    const isAuthorizedEmail = AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail);
    const isAuthorizedPassword = cleanPassword === AUTHORIZED_ADMIN_PASSWORD;

    if (!isAuthorizedEmail || !isAuthorizedPassword) {
      return {
        profile: null,
        error:
          'Access denied. Only authorized administrator (qazeembasitoladimeji@gmsail.com) can sign in to this dashboard.',
      };
    }

    // 4. Successful login
    const adminData: AdminProfile = {
      ...AUTHORIZED_ADMIN_PROFILE,
      email: cleanEmail,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminData));
      document.cookie = `shopeasy_admin_session=${encodeURIComponent(cleanEmail)}; path=/; max-age=604800; SameSite=Lax`;
    }

    return { profile: adminData };
  },

  /**
   * Logs out the admin and clears session
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      document.cookie = 'shopeasy_admin_session=; path=/; max-age=0; SameSite=Lax';
    }
  },
};
