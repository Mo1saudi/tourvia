import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { VerificationBanner } from './components/VerificationBanner';
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { TripsListView } from './views/TripsListView';
import { TripBuilderView } from './views/TripBuilderView';
import { PublicTripView } from './views/PublicTripView';
import { PresentationView } from './views/PresentationView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { AnalyticsView } from './views/AnalyticsView';
import { AdminView } from './views/AdminView';
import { ProfileView } from './views/ProfileView';

type AppTab =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'trips'
  | 'builder'
  | 'analytics'
  | 'subscriptions'
  | 'profile'
  | 'admin';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isRtl } = useLanguage();

  const [currentTab, setCurrentTab] = useState<AppTab>('landing');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'recover'>('login');
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [presentingTripId, setPresentingTripId] = useState<string | null>(null);

  // Check URL query parameters or hash on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tripToken = urlParams.get('trip') || urlParams.get('token') || urlParams.get('publicToken');
    if (tripToken) {
      setPublicToken(tripToken);
    }
  }, []);

  // Update default tab based on authentication
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (currentTab === 'landing' || currentTab === 'auth') {
          setCurrentTab('dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading]);

  // Central Navigation Handler
  const handleNavigate = (view: string, targetId?: string) => {
    if (view === 'public_preview' || view === 'public' || view === 'public_trip') {
      if (targetId) setPublicToken(targetId);
      return;
    }
    if (view === 'presentation') {
      if (targetId) setPresentingTripId(targetId);
      return;
    }
    if (view === 'builder') {
      setEditingTripId(targetId || null);
      setCurrentTab('builder');
      return;
    }
    if (view === 'auth_register') {
      setAuthInitialMode('register');
      setCurrentTab('auth');
      return;
    }
    if (view === 'auth_login' || view === 'auth') {
      setAuthInitialMode('login');
      setCurrentTab('auth');
      return;
    }
    if (view === 'pricing') {
      setCurrentTab('subscriptions');
      return;
    }

    const validTabs: AppTab[] = [
      'landing',
      'auth',
      'dashboard',
      'trips',
      'builder',
      'analytics',
      'subscriptions',
      'profile',
      'admin',
    ];

    if (validTabs.includes(view as AppTab)) {
      if (view === 'builder') {
        setEditingTripId(targetId || null);
      }
      setCurrentTab(view as AppTab);
    } else {
      setCurrentTab('dashboard');
    }
  };

  // Handle Public Trip View directly
  if (publicToken) {
    return (
      <PublicTripView
        token={publicToken}
        onBackToApp={() => {
          setPublicToken(null);
          // clear query string from browser URL
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  // Handle Presentation Mode
  if (presentingTripId) {
    return (
      <PresentationView
        tripId={presentingTripId}
        onExit={() => setPresentingTripId(null)}
      />
    );
  }

  return (
    <div
      id="tourvia-app-root"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans"
    >
      {/* Top Main Navigation */}
      <Navbar
        currentView={currentTab}
        onNavigate={handleNavigate}
      />

      {/* Main Container */}
      <main className="flex-1">
        {/* Verification Alert Banner if logged in */}
        {isAuthenticated && currentTab !== 'landing' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
            <VerificationBanner onNavigateToProfile={() => setCurrentTab('profile')} />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Landing / Marketing Page */}
          {currentTab === 'landing' && (
            <LandingView onNavigate={handleNavigate} />
          )}

          {/* Authentication View (Login / Register / 2FA) */}
          {currentTab === 'auth' && (
            <AuthView initialMode={authInitialMode} onNavigate={handleNavigate} />
          )}

          {/* Dashboard Overview */}
          {currentTab === 'dashboard' && isAuthenticated && (
            <DashboardView onNavigate={handleNavigate} />
          )}

          {/* Trips Library / List */}
          {currentTab === 'trips' && isAuthenticated && (
            <TripsListView onNavigate={handleNavigate} />
          )}

          {/* 7-Step Trip Builder Wizard */}
          {currentTab === 'builder' && isAuthenticated && (
            <TripBuilderView
              tripId={editingTripId}
              onNavigate={handleNavigate}
              onFinish={() => setCurrentTab('trips')}
              onCancel={() => setCurrentTab('trips')}
            />
          )}

          {/* Subscriptions & Pricing */}
          {currentTab === 'subscriptions' && (
            <SubscriptionsView />
          )}

          {/* Analytics & Inquiries */}
          {currentTab === 'analytics' && isAuthenticated && (
            <AnalyticsView />
          )}

          {/* Guide Profile & Settings */}
          {currentTab === 'profile' && isAuthenticated && (
            <ProfileView />
          )}

          {/* Master Admin Panel */}
          {currentTab === 'admin' && isAuthenticated && user?.role === 'admin' && (
            <AdminView />
          )}
        </div>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white">TOURVIA</span>
            <span>— المنصة السحابية المتكاملة للمرشدين السياحيين ووكالات السفر</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>نسخة الإنتاج v1.0.0</span>
            <span>•</span>
            <span>مدعوم بالذكاء الاصطناعي من Google DeepMind Gemini</span>
            <span>•</span>
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
