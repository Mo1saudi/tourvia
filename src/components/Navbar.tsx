import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Sparkles,
  Globe,
  Bell,
  User as UserIcon,
  ShieldCheck,
  CreditCard,
  BarChart3,
  MapPin,
  LogOut,
  Settings,
  PlusCircle,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { NotificationItem, WorkingLanguage } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, subscription, aiUsage, unreadNotificationsCount, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, isRtl, t, availableLanguages } = useLanguage();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(unreadNotificationsCount);

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  const handleToggleNotif = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) {
      loadNotifications();
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn(err);
    }
  };

  // Calculate remaining AI credits
  const isUnlimitedAi = subscription?.planCode === 'PREMIUM' || aiUsage?.isUnlimited;
  const remainingAi = aiUsage
    ? Math.max(0, (aiUsage.currentPlanAiLimit || aiUsage.lifetimeLimit || 3) - aiUsage.lifetimeUsed)
    : 3;
  const totalLimit = aiUsage?.currentPlanAiLimit || aiUsage?.lifetimeLimit || 3;

  return (
    <nav id="app-main-navbar" className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20">
              <Compass className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-sans text-xl font-black tracking-tight text-slate-950 dark:text-white">
                TOUR<span className="text-amber-500">VIA</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                AI TOUR GUIDE SaaS
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex md:items-center md:gap-1">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {t('navDashboard')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('trips')}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  currentView === 'trips'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {t('navTrips')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('builder')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  currentView === 'builder'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5 text-amber-500" />
                <span>{t('navBuilder')}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  currentView === 'analytics'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {t('navAnalytics')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('subscriptions')}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  currentView === 'subscriptions'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {t('navSubscriptions')}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-black transition-colors ${
                    currentView === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{t('navAdmin')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* AI Quota Pill (if logged in) */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => onNavigate('subscriptions')}
              className="hidden items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/80 px-3 py-1 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300 sm:flex"
              title="رصيد الذكاء الاصطناعي"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>
                {isUnlimitedAi ? 'AI غير محدود' : `AI: ${remainingAi}/${totalLimit}`}
              </span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="تغيير اللغة"
            >
              <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="uppercase">{language}</span>
            </button>

            {isLangOpen && (
              <div
                className={`absolute mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 ${
                  isRtl ? 'left-0' : 'right-0'
                }`}
              >
                {availableLanguages.map(langItem => (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => {
                      setLanguage(langItem.code);
                      setIsLangOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors ${
                      language === langItem.code
                        ? 'bg-amber-50 font-bold text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{langItem.nativeName}</span>
                    <span className="text-[10px] uppercase text-slate-400">{langItem.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Popover (if logged in) */}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={handleToggleNotif}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                title={t('navNotifications')}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div
                  className={`absolute mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:w-96 ${
                    isRtl ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('navNotifications')}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotifsRead}
                        className="text-[11px] font-semibold text-amber-600 hover:underline dark:text-amber-400"
                      >
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto pt-1 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        لا توجد إشعارات حالية
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-2.5 text-xs transition-colors rounded-lg ${
                            !n.isRead ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <div className="font-bold text-slate-900 dark:text-white">
                            {n.title}
                          </div>
                          <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                            {n.message}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                            {n.actionUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigate(n.actionUrl!.replace('/', ''));
                                  setIsNotifOpen(false);
                                }}
                                className="font-bold text-amber-600 hover:underline dark:text-amber-400"
                              >
                                عرض
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile or Login CTA */}
          {isAuthenticated ? (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 font-bold text-slate-950 text-xs">
                  {user?.name.charAt(0) || 'U'}
                </div>
                <div className="hidden text-left md:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {user?.name.split(' ')[0]}
                    </span>
                    {user?.verificationStatus === 'VERIFIED' && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                  </div>
                </div>
              </button>

              {isUserMenuOpen && (
                <div
                  className={`absolute mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${
                    isRtl ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email}
                    </p>
                    <span className="mt-1 inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {subscription?.planCode || 'FREE'} PLAN
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      <span>{t('navProfile')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('subscriptions');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      <span>{t('navSubscriptions')}</span>
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-slate-800"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>{t('navAdmin')}</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        setIsUserMenuOpen(false);
                        onNavigate('landing');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('navLogout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('auth_login')}
                className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t('ctaGuideLogin')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('auth_register')}
                className="flex items-center gap-1 rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-md transition-transform hover:scale-102 hover:bg-amber-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('ctaRegister')}</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden dark:border-slate-700 dark:text-slate-300"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          {isAuthenticated ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onNavigate('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {t('navDashboard')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('trips');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {t('navTrips')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('builder');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-amber-600 dark:text-amber-400"
              >
                + {t('navBuilder')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('analytics');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {t('navAnalytics')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('subscriptions');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {t('navSubscriptions')}
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-purple-600 dark:text-purple-400"
                >
                  {t('navAdmin')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onNavigate('auth_login');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full rounded-lg bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-900 dark:bg-slate-800 dark:text-white"
              >
                {t('ctaGuideLogin')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('auth_register');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full rounded-lg bg-amber-500 py-2.5 text-center text-xs font-bold text-slate-950"
              >
                {t('ctaRegister')}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
