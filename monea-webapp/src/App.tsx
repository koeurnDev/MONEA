import Router from './router'
import { BrowserRouter } from 'react-router-dom'
import { AnimationProvider } from './components/providers/AnimationProvider'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { SWRProvider } from './components/providers/SWRProvider'
import { LoadingProvider } from './components/providers/LoadingProvider'
import { LanguageProvider } from './i18n/LanguageProvider'
import { AuthProvider } from './hooks/useAuth'

import { ToastProvider } from './components/ui/Toast'

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SWRProvider>
        <BrowserRouter>
          <LoadingProvider>
            <AnimationProvider>
              <AuthProvider>
                <LanguageProvider initialLocale="km">
                  <ToastProvider>
                    <Router />
                  </ToastProvider>
                </LanguageProvider>
              </AuthProvider>
            </AnimationProvider>
          </LoadingProvider>
        </BrowserRouter>
      </SWRProvider>
    </ThemeProvider>
  )
}
