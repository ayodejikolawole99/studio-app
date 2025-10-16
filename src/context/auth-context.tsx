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

// Mock user to bypass login
const mockUser: User = {
  id: 'mock-admin-id',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'ADMIN',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState(false); // Set loading to false
  const router = useRouter();

  const login = async (email: string, password: string): Promise<void> => {
    // Mock login success
    setLoading(true);
    console.log(`Mock login with ${email}`);
    setUser(mockUser);
    setLoading(false);
    router.push('/admin');
  };

  const logout = async (): Promise<void> => {
    // Mock logout
    setUser(null);
    console.log('Mock logout');
    router.push('/login');
  };

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
