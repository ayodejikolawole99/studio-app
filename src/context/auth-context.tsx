'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase'; // Using the hook from firebase/provider
import type { User as AuthUser } from 'firebase/auth'; // Renaming to avoid conflict

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading, userError } = useUser();
  const router = useRouter();

  // Mock logout function for now
  const logout = async (): Promise<void> => {
    // In a real app with password auth, you'd call signOut(auth)
    console.log('User logged out');
    router.push('/login');
  };

  // Effect to handle routing based on auth state
  useEffect(() => {
    if (!isUserLoading && !user) {
      // If loading is finished and there's no user, redirect to login
      // Note: with anonymous auth, a user should almost always exist.
      // This is a safeguard.
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  return (
    <AuthContext.Provider value={{ user, loading: isUserLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
