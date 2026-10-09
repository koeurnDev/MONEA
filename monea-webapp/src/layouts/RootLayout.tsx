import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import { LoadingBar } from '@/components/ui/LoadingBar'
import SystemStatusListener from '@/components/layout/SystemStatusListener'

/**
 * Root layout — wraps every page.
 * Replaces src/app/layout.tsx (the body/html wrapper is now in index.html).
 */
export default function RootLayout() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'auto'

    return () => {
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useLayoutEffect(() => {
    if (navigationType === 'POP') return

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }, [navigationType, pathname])

  return (
    <>
      <SystemStatusListener />
      <LoadingBar />
      <Outlet />
    </>
  )
}
