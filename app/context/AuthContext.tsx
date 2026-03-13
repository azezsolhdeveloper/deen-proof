'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from '../../i18n/routing';
import { login as apiLogin } from '../services/api';
import { LoginPayload, User, ApiError } from '../services/types';
import { setAuthToken, clearAuthToken } from '../services/authToken';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub?: string;
  unique_name?: string;
  name?: string;
  email?: string;
  role?: string;
  is_owner?: string;
  exp: number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    clearAuthToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  const updateUserFromToken = useCallback((token: string) => {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);

      if (decodedToken.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      const role = decodedToken.role || 
                   decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const email = decodedToken.email || 
                    decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      const sub = decodedToken.sub || 
                  decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      const name = decodedToken.unique_name || 
                   decodedToken.name || 
                   decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

      const userPayload: User = {
        id: sub ? parseInt(sub) : 0,
        name: name || "Unknown",
        email: email || "",
        role: (role as User['role']) || 'Researcher', 
        isOwner: decodedToken.is_owner === 'true',
        createdAt: '' 
      };

      setUser(userPayload);
    } catch (err) {
      logout();
    }
  }, [logout]);

 useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      // إيقاف التحذير لأننا نحتاج لتحديث حالة المستخدم عند التحميل الأولي فقط
      // eslint-disable-next-line react-hooks/set-state-in-effect
      updateUserFromToken(token);
    }
    setIsLoading(false);
  }, [updateUserFromToken]);

  const login = async (credentials: LoginPayload) => {
    setError(null);
    try {
      const { token } = await apiLogin(credentials);
      localStorage.setItem('token', token);
      setAuthToken(token);
      updateUserFromToken(token);
      router.push('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = typeof apiError.response?.data === 'string' 
        ? apiError.response.data 
        : 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}