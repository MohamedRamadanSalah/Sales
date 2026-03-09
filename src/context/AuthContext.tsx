'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  getUser,
  getToken,
  setToken,
  setRefreshToken,
  setUser,
  clearAuth,
  getLanguage,
  setLanguage,
  type StoredUser,
} from '@/lib/auth';
import { authApi } from '@/lib/api';

type Lang = 'ar' | 'en';

interface AuthContextValue {
  user: StoredUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  lang: Lang;
  setLang: (lang: Lang) => void;
  login: (user: StoredUser, token: string, refresh: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [lang, setLangState] = useState<Lang>('ar');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUserState(getUser());
    setLangState(getLanguage());
    setIsLoading(false);
  }, []);

  const setLang = (l: Lang) => {
    setLanguage(l);
    setLangState(l);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      window.location.reload();
    }
  };

  const login = (u: StoredUser, token: string, refresh: string) => {
    setToken(token);
    setRefreshToken(refresh);
    setUser(u);
    setUserState(u);
  };

  const logout = async () => {
    try {
      if (getToken()) await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      setUserState(null);
    }
  };

  const refreshUser = async () => {
    if (!getToken()) return;
    try {
      const res = await authApi.getProfile();
      if (res.data?.user) {
        const u = res.data.user as unknown as StoredUser;
        setUser(u);
        setUserState(u);
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        lang,
        setLang,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
