import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password?: string) => Promise<UserProfile>;
  signUp: (data: { fullName: string; email: string; phoneNumber?: string; password?: string }) => Promise<UserProfile>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const [onboarded, currentUser] = await Promise.all([
        AuthService.hasCompletedOnboarding(),
        AuthService.getCurrentUser(),
      ]);
      setHasCompletedOnboarding(onboarded);
      setUser(currentUser);
    } catch (e) {
      console.error('Error loading auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const profile = await AuthService.login(email, password);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password?: string;
  }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const profile = await AuthService.signUp(data);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    return await AuthService.resetPassword(email);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: UserRole): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const updated = await AuthService.switchRole(targetRole);
      setUser(updated);
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const updated = await AuthService.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const completeOnboarding = async () => {
    await AuthService.setOnboardingCompleted(true);
    setHasCompletedOnboarding(true);
  };

  const role = user?.role || 'customer';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        hasCompletedOnboarding,
        login,
        signUp,
        resetPassword,
        logout,
        switchRole,
        updateProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
