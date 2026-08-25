import { Outlet } from 'react-router-dom'
import { LoadingBar } from '@/components/ui/LoadingBar'
import SystemStatusListener from '@/components/layout/SystemStatusListener'

/**
 * Root layout — wraps every page.
 * Replaces src/app/layout.tsx (the body/html wrapper is now in index.html).
 */
export default function RootLayout() {
  return (
    <>
      <SystemStatusListener />
      <LoadingBar />
      <Outlet />
    </>
  )
}
