import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserSubscription, AiUsageData } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  subscription: UserSubscription | null;
  aiUsage: AiUsageData | null;
  unreadNotificationsCount: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: { user: User; token: string; subscription: UserSubscription; aiUsage: AiUsageData }) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserLocal: (updated: Partial<User>) => void;
  updateAiUsageLocal: (updated: Partial<AiUsageData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [aiUsage, setAiUsage] = useState<AiUsageData | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    if (!api.getToken()) {
      setUser(null);
      setSubscription(null);
      setAiUsage(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
      setSubscription(res.subscription);
      setAiUsage(res.aiUsage);
      setUnreadNotificationsCount(res.unreadNotificationsCount || 0);
    } catch (err) {
      console.warn('Session verification failed:', err);
      setUser(null);
      setSubscription(null);
      setAiUsage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = (data: { user: User; token: string; subscription: UserSubscription; aiUsage: AiUsageData }) => {
    api.setToken(data.token);
    setUser(data.user);
    setSubscription(data.subscription);
    setAiUsage(data.aiUsage);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setSubscription(null);
    setAiUsage(null);
  };

  const updateUserLocal = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const updateAiUsageLocal = (updated: Partial<AiUsageData>) => {
    if (aiUsage) {
      setAiUsage({ ...aiUsage, ...updated });
    }
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin' || user?.accountType === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        aiUsage,
        unreadNotificationsCount,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        refreshProfile,
        updateUserLocal,
        updateAiUsageLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
