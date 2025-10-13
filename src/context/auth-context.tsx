
'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';

// Mock users
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
  { id: '2', name: 'Canteen Operator', email: 'operator@example.com', role: 'OPERATOR' },
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in localStorage
    try {
      const storedUser = localStorage.getItem('canteen-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('canteen-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      // Mock authentication logic
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email === email);
        // In a real app, you'd also check the password hash.
        // For this demo, we'll use a simple password check.
        if (foundUser && password === 'password') {
          setUser(foundUser);
          localStorage.setItem('canteen-user', JSON.stringify(foundUser));
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password.'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('canteen-user');
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
