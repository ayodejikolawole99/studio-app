'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); 
  const router = useRouter();

  // Mock login function for future implementation
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    console.log(`Login attempt with ${email}`);
    // In a real app, you would authenticate here and set the user.
    // For now, we'll simulate a failed login.
    setLoading(false);
    // On successful login, you would call:
    // setUser({ id: '...', name: '...', email: '...', role: 'ADMIN' });
    // router.push('/admin');
  };

  // Mock logout function
  const logout = async (): Promise<void> => {
    setUser(null);
    console.log('User logged out');
    router.push('/login');
  };

  // Simulate initial auth check
  useState(() => {
    setLoading(false);
  });

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
