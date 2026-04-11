import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from '@components/auth/ProtectedRoute';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import { AnimatedTradingBackground } from '@components/common/AnimatedTradingBackground';
import { ToastContainer } from '@hooks/useToast';
// RouteErrorBoundary is tiny — keep it eager so it can catch Suspense errors too
import RouteErrorBoundary from '@components/common/RouteErrorBoundary';

// ─── Lazily-loaded pages (each becomes its own JS chunk) ──────────────────────
const Landing         = lazy(() => import('@pages/Landing'));
const Login           = lazy(() => import('@pages/Login'));
const Register        = lazy(() => import('@pages/Register'));
const Dashboard       = lazy(() => import('@pages/Dashboard'));
const Settings        = lazy(() => import('@pages/Settings'));
const AlertHistory    = lazy(() => import('@pages/AlertHistory'));
const News            = lazy(() => import('@pages/News'));
const EconomicEvents  = lazy(() => import('@pages/EconomicEvents'));
const NotFound        = lazy(() => import('@pages/NotFound'));
const Admin           = lazy(() => import('@pages/Admin'));
const ErrorPage       = lazy(() => import('@pages/ErrorPage'));

// ─── Page-level loading skeleton shown during code-split chunk fetch ───────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin" />
      </div>
      <p className="text-xs text-slate-600 tracking-widest uppercase">Loading</p>
    </div>
  </div>
);

function GlobalLoadingOverlay() {
  const [networkLoading, setNetworkLoading] = useState(false);

  useEffect(() => {
    const handleLoading = (event) => {
      setNetworkLoading(Boolean(event?.detail?.loading));
    };

    window.addEventListener('app:network-loading', handleLoading);
    return () => window.removeEventListener('app:network-loading', handleLoading);
  }, []);

  if (!networkLoading) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[99997] h-0.5 bg-emerald-500/70 animate-pulse" />
      <div className="fixed bottom-5 right-5 z-[99997] w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </>
  );
}

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AnimatedTradingBackground />
          <GlobalLoadingOverlay />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 animate-fadeIn">
              {/* Single Suspense boundary for all lazy-loaded pages */}
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<RouteErrorBoundary><Landing /></RouteErrorBoundary>} />
                  <Route
                    path="/login"
                    element={
                      <RouteErrorBoundary>
                        <PublicRoute><Login /></PublicRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <RouteErrorBoundary>
                        <PublicRoute><Register /></PublicRoute>
                      </RouteErrorBoundary>
                    }
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/news"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute><News /></ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/economic-events"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute><EconomicEvents /></ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute><Settings /></ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/alerts"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute><AlertHistory /></ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />

                  {/* Utility Routes */}
                  <Route path="/error" element={<ErrorPage />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
