import { useState } from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { ToastProvider } from '@/components/ui/Toast'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Menu, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

/**
 * Protected Admin layout — renders Super Admin Sidebar & Shell.
 */
export default function AdminLayout() {
  const { user, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/sign-in" replace />
  if (user.type !== 'admin' && user.role !== 'PLATFORM_OWNER' && user.role !== 'EVENT_MANAGER' && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-kantumruy">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:block h-full shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Navigation Drawer Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border text-foreground z-[100]">
            <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Super Admin operations menu</SheetDescription>
            <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Mobile Top Header */}
          <header className="lg:hidden h-16 bg-card text-foreground border-b border-border/80 px-4 flex items-center justify-between shrink-0 z-40">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="h-10 w-10 text-foreground hover:bg-muted rounded-xl"
              >
                <Menu size={20} />
              </Button>
              <Link to="/admin/master" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldCheck size={18} />
                </div>
                <span className="font-bold text-sm">Super Admin</span>
              </Link>
            </div>
            <ThemeToggle />
          </header>

          {/* Page Content Scroll Container */}
          <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
