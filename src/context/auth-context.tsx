'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import type { User } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  const { auth, firestore } = useFirebase();

  useEffect(() => {
    if (!auth || !firestore) {
      // Firebase services might not be available on initial render.
      // The loading state will remain true until services are available.
      setLoading(true);
      return;
    }

    // Bootstrap default users if they don't exist
    const createDefaultUsers = async () => {
      try {
        const adminCredential = await createUserWithEmailAndPassword(auth, 'admin@example.com', 'password').catch(e => {
          if (e.code !== 'auth/email-already-in-use') console.error("Error creating admin:", e);
          return null;
        });

        if (adminCredential) {
          const userDocRef = doc(firestore, 'users', adminCredential.user.uid);
          await setDoc(userDocRef, { name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' });
        }

        const operatorCredential = await createUserWithEmailAndPassword(auth, 'operator@example.com', 'password').catch(e => {
          if (e.code !== 'auth/email-already-in-use') console.error("Error creating operator:", e);
          return null;
        });
        
        if (operatorCredential) {
          const userDocRef = doc(firestore, 'users', operatorCredential.user.uid);
          await setDoc(userDocRef, { name: 'Canteen Operator', email: 'operator@example.com', role: 'OPERATOR' });
        }
      } catch (error) {
        console.error("Error bootstrapping default users:", error);
      }
    };
    
    createDefaultUsers();
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // User is signed in, fetch their role from Firestore
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: fbUser.uid, ...userDoc.data() } as User);
        } else {
          // This case might happen if the user doc wasn't created properly
          console.warn(`User document not found for uid: ${fbUser.uid}`);
          setUser(null);
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
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async (): Promise<void> => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await signOut(auth);
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
