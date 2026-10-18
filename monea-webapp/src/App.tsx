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
import DotMatrixLoader from './components/ui/DotMatrixLoader'
import { Suspense, lazy } from 'react'

// Mobile-optimized loading component
function MobileLoader() {
  return (
    <div
      aria-live="polite"
      className="fixed inset-0 flex items-center justify-center bg-background"
      role="status"
    >
      <DotMatrixLoader className="h-12 w-12" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function AppContent() {
  return (
    <AnimationProvider>
      <AuthProvider>
        <LanguageProvider initialLocale="km">
          <ToastProvider>
            <Suspense fallback={<MobileLoader />}>
              <Router />
            </Suspense>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </AnimationProvider>
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
