'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Mock user roles are now stored in Firestore, but we can keep this for fallback/initial structure idea
const mockUsers: Omit<User, 'id'>[] = [
  { name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
  { name: 'Canteen Operator', email: 'operator@example.com', role: 'OPERATOR' },
];

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { auth, firestore } = useFirebase();

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUser({ id: fbUser.uid, ...userDoc.data() } as User);
        } else {
          // Handle case where user exists in Auth but not Firestore
          // This could be a new user, or a data consistency issue
          // For now, we'll treat them as a basic user without a role
           const matchedMockUser = mockUsers.find(u => u.email === fbUser.email);
            if (matchedMockUser) {
              const userData: Omit<User, 'id'> = {
                name: matchedMockUser.name,
                email: matchedMockUser.email,
                role: matchedMockUser.role,
              };
              // This is a temporary solution to get user data.
              // In a real app, you would have a user creation flow.
              setUser({ id: fbUser.uid, ...userData });
            } else {
               setUser(null);
            }
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const login = async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle setting the user state
    } finally {
        setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
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
