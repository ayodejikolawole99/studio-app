'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import type { User } from '@/lib/types';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
    
    // Function to create default users if they don't exist
    const createDefaultUsers = async () => {
        try {
            // Try to create admin user
            const adminCredential = await createUserWithEmailAndPassword(auth, 'admin@example.com', 'password').catch(e => {
                if (e.code !== 'auth/email-already-in-use') throw e;
                return null;
            });

            if (adminCredential) {
                const userDocRef = doc(firestore, 'users', adminCredential.user.uid);
                await setDoc(userDocRef, {
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'ADMIN'
                });
            }

            // Try to create operator user
            const operatorCredential = await createUserWithEmailAndPassword(auth, 'operator@example.com', 'password').catch(e => {
                if (e.code !== 'auth/email-already-in-use') throw e;
                return null;
            });
            
             if (operatorCredential) {
                const userDocRef = doc(firestore, 'users', operatorCredential.user.uid);
                await setDoc(userDocRef, {
                    name: 'Canteen Operator',
                    email: 'operator@example.com',
                    role: 'OPERATOR'
                });
            }
        } catch (error) {
            console.error("Error creating default users:", error);
        }
    };

    createDefaultUsers();


    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUser({ id: fbUser.uid, ...userDoc.data() } as User);
        } else {
           const matchedMockUser = mockUsers.find(u => u.email === fbUser.email);
            if (matchedMockUser) {
              const userData: Omit<User, 'id'> = {
                name: matchedMockUser.name,
                email: matchedMockUser.email,
                role: matchedMockUser.role,
              };
              setUser({ id: fbUser.uid, ...userData });
            } else {
               setUser(null);
            }
        }
      } else {
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
