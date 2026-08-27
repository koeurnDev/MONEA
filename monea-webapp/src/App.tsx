import Router from './router'
import { BrowserRouter } from 'react-router-dom'
import { AnimationProvider } from './components/providers/AnimationProvider'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { SWRProvider } from './components/providers/SWRProvider'
import { LoadingProvider } from './components/providers/LoadingProvider'
import { LanguageProvider } from './i18n/LanguageProvider'
import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import { useMobilePerformance } from './hooks/useMobilePerformance'
import { Suspense, lazy } from 'react'

// Mobile-optimized loading component
function MobileLoader() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function AppContent() {
  const { isMobile } = useMobilePerformance();

  return (
    <>
      {isMobile ? (
        // Simplified provider stack for mobile - no AnimationProvider
        <AuthProvider>
          <LanguageProvider initialLocale="km">
            <ToastProvider>
              <Suspense fallback={<MobileLoader />}>
                <Router />
              </Suspense>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      ) : (
        // Full provider stack for desktop with animations
        <AnimationProvider>
          <AuthProvider>
            <LanguageProvider initialLocale="km">
              <ToastProvider>
                <Router />
              </ToastProvider>
            </LanguageProvider>
          </AuthProvider>
        </AnimationProvider>
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <BrowserRouter>
        <SWRProvider>
          <LoadingProvider>
            <AppContent />
          </LoadingProvider>
        </SWRProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
