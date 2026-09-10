'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load current user profile on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  // Authentication routing guard
  useEffect(() => {
    if (loading) return;

    const publicPages = ['/login', '/register', '/verify'];
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));

    if (!user && !isPublicPage && pathname !== '/') {
      router.push('/login');
    } else if (user && isPublicPage) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setUser(response.data.data.user);
        router.push('/dashboard');
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password, role, organization) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        organization,
      });
      if (response.data.success) {
        setUser(response.data.data.user);
        router.push('/dashboard');
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
