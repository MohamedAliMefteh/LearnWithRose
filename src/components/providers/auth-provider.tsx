"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Check for stored authentication on mount
  useEffect(() => {
    setIsClient(true);

    try {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
        // Token is now stored in httpOnly cookie, so we'll verify with backend
        verifyAuthentication();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error parsing stored auth data:', error);
      localStorage.removeItem('user');
      setIsLoading(false);
    }
  }, []);

  // Verify authentication with backend using httpOnly cookie
  const verifyAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        }
      } else {
        // If verification fails, clear user data
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error verifying authentication:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Authenticate only with the backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Include cookies for secure authentication
      });

      if (response.ok) {
        const data = await response.json();

        // The backend returns JWT token as "jwt" property, no user object
        const token = data.jwt || data.token || data.accessToken || data.access_token;

        if (token) {
          // Decode JWT to extract user information (basic decode, no verification needed here)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Create user object from JWT payload
            const user = {
              id: payload.sub || payload.userId || '1',
              name: payload.sub || payload.name || payload.username || 'User',
              email: payload.email || ''
            };


            // Update state immediately
            setUser(user);
            setToken(token);

            // Store user data in localStorage (token will be in httpOnly cookie)
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(user));
              // Also store token as fallback for debugging cookie issues
              localStorage.setItem('fallback_auth_token', token);
            }
            return true;
          } catch (jwtError) {
            console.error('Error decoding JWT:', jwtError);

            // Fallback: create minimal user object without JWT decoding
            const minimalUser = {
              id: '1',
              name: username || 'User', // Use the username that was entered
              email: ''
            };

            setUser(minimalUser);
            setToken(token);

            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(minimalUser));
              // Also store token as fallback for debugging cookie issues
              localStorage.setItem('fallback_auth_token', token);
            }
            return true;
          }
        } else {
          console.error('No JWT token found in response:', data);
          return false;
        }
      } else {
        console.error('Authentication failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear httpOnly cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }

    // Clear client-side state
    setUser(null);
    setToken(null);

    // Clear localStorage if available
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  };

  const getAuthToken = () => {
    return token;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading: isLoading || !isClient,
    login,
    logout,
    isAuthenticated: !!user && isClient,
    getAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
