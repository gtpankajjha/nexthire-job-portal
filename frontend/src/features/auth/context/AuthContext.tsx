import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../firebase';
import { User } from '../../../../types';
import { authService } from '../../../services/auth.service';

interface AuthContextType {
  user: User | null;
  authInitialized: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (data: any, password?: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const authRequestId = useRef(0);
  const hasResolvedInitialAuth = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const requestId = ++authRequestId.current;

      setUser(null);

      if (!firebaseUser) {
        if (!hasResolvedInitialAuth.current) {
          hasResolvedInitialAuth.current = true;
          setAuthInitialized(true);
        }
        return;
      }

      try {
        const userProfile = await authService.getCurrentUser(firebaseUser.uid);
        if (requestId !== authRequestId.current) return;
        setUser(userProfile);
      } catch (error) {
        if (requestId !== authRequestId.current) return;
        console.error("Error fetching user profile:", error);
        setUser(null);
      }

      if (requestId !== authRequestId.current) return;
      if (!hasResolvedInitialAuth.current) {
        hasResolvedInitialAuth.current = true;
        setAuthInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    const user = await authService.login(email, password);
    setUser(user);
    return user;
  };

  const register = async (data: any, password?: string) => {
    const user = await authService.register(data, password);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, authInitialized, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};