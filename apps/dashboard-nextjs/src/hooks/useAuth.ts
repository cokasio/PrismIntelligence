/**
 * Authentication Hook
 * Manages authentication state and provides auth methods
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'viewer';
  companyId: string;
  isActive: boolean;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

interface ProfileUpdates {
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Store tokens securely
   */
  const storeTokens = (tokens: AuthTokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  /**
   * Get stored access token
   */
  const getAccessToken = (): string | null => {
    return localStorage.getItem('accessToken');
  };

  /**
   * Get stored refresh token
   */
  const getRefreshToken = (): string | null => {
    return localStorage.getItem('refreshToken');
  };

  /**
   * Clear stored tokens
   */
  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  /**
   * Make authenticated API request
   */
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAccessToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token might be expired, try to refresh
      const refreshed = await handleTokenRefresh();
      if (refreshed) {
        // Retry the request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${getAccessToken()}`,
        };
        return fetch(`${API_BASE_URL}${endpoint}`, config);
      } else {
        // Refresh failed, user needs to login again
        handleLogout();
        throw new Error('Authentication failed');
      }
    }

    return response;
  };

  /**
   * Handle token refresh
   */
  const handleTokenRefresh = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  };

  /**
   * Login user
   */
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      storeTokens(data.tokens);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      storeTokens(data.tokens);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      handleLogout();
    }
  };

  /**
   * Handle logout locally
   */
  const handleLogout = () => {
    clearTokens();
    setUser(null);
  };

  /**
   * Refresh token manually
   */
  const refreshToken = async () => {
    const success = await handleTokenRefresh();
    if (!success) {
      handleLogout();
      throw new Error('Token refresh failed');
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates: ProfileUpdates) => {
    try {
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Profile update failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get current user profile
   */
  const getCurrentUser = async () => {
    try {
      const response = await apiRequest('/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Get current user error:', error);
      handleLogout();
    }
  };

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        await getCurrentUser();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Use Auth Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Higher-order component to protect routes
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // In a real app, you'd redirect to login
      // For now, we'll show a message
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">Authentication Required</h1>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Role-based access control hook
 */
export function useRoleAccess(requiredRoles: string[]) {
  const { user } = useAuth();
  
  const hasAccess = user && requiredRoles.includes(user.role);
  
  return {
    hasAccess,
    userRole: user?.role,
    requiredRoles,
  };
}
 await tryRefreshToken();
      if (refreshed) {
        // Retry the request with new token
        const newToken = getAccessToken();
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return fetch(`${API_BASE_URL}${endpoint}`, config);
      } else {
        // Refresh failed, logout user
        handleLogout();
        throw new Error('Authentication expired');
      }
    }

    return response;
  };

  /**
   * Try to refresh the access token
   */
  const tryRefreshToken = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  };

  /**
   * Login user
   */
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      storeTokens(data.tokens);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      storeTokens(data.tokens);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call logout endpoint to invalidate server-side sessions
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue with local logout even if server logout fails
      console.error('Server logout failed:', error);
    }

    handleLogout();
  };

  /**
   * Handle logout (clear local state)
   */
  const handleLogout = () => {
    clearTokens();
    setUser(null);
  };

  /**
   * Refresh token manually
   */
  const refreshToken = async () => {
    const success = await tryRefreshToken();
    if (!success) {
      handleLogout();
      throw new Error('Token refresh failed');
    }
  };

  /**
   * Get current user profile
   */
  const getCurrentUser = async () => {
    try {
      const response = await apiRequest('/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data.user;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      handleLogout();
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates: ProfileUpdates) => {
    try {
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Profile update failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      
      if (token) {
        try {
          await getCurrentUser();
        } catch (error) {
          // Token is invalid, try to refresh
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            await getCurrentUser();
          } else {
            handleLogout();
          }
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Auto-refresh token before expiry
   */
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        await tryRefreshToken();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 20 * 60 * 1000); // Refresh every 20 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook to require authentication
 */
export function useRequireAuth(): AuthContextType {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [auth.loading, auth.isAuthenticated]);
  
  return auth;
}

/**
 * Hook to check user role
 */
export function useRole(): {
  isAdmin: boolean;
  isManager: boolean;
  isViewer: boolean;
  hasRole: (role: string) => boolean;
} {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    isViewer: !!user?.role,
    hasRole: (role: string) => user?.role === role || user?.role === 'admin',
  };
}
