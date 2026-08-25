import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import RootLayout from './layouts/RootLayout'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'
import LoadingScreen from './components/ui/LoadingScreen'

// --- Landing & Public Pages ---
const LandingPage = lazy(() => import('./pages/LandingPage'))
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// --- Auth Pages ---
const SignInPage = lazy(() => import('./pages/auth/SignInPage'))
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const AuthCallbackPage = lazy(() => import('./pages/auth/AuthCallbackPage'))

// --- Wedding Public Pages ---
const WeddingPage = lazy(() => import('./pages/wedding/WeddingPage'))
const WeddingGalleryPage = lazy(() => import('./pages/wedding/WeddingGalleryPage'))
const WeddingGalleryLivePage = lazy(() => import('./pages/wedding/WeddingGalleryLivePage'))
const WeddingGalleryUploadPage = lazy(() => import('./pages/wedding/WeddingGalleryUploadPage'))
const WeddingGuestbookPage = lazy(() => import('./pages/wedding/WeddingGuestbookPage'))
const WeddingSchedulePage = lazy(() => import('./pages/wedding/WeddingSchedulePage'))
const InvitePage = lazy(() => import('./pages/wedding/InvitePage'))

// --- Dashboard Pages ---
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const DashboardCreatePage = lazy(() => import('./pages/dashboard/CreatePage'))
const DashboardDesignPage = lazy(() => import('./pages/dashboard/DesignPage'))
const DashboardDisplayPage = lazy(() => import('./pages/dashboard/DisplayPage'))
const DashboardGuestsPage = lazy(() => import('./pages/dashboard/GuestsPage'))
const DashboardGiftsPage = lazy(() => import('./pages/dashboard/GiftsPage'))
const DashboardGiftsLivePage = lazy(() => import('./pages/dashboard/GiftsLivePage'))
const DashboardSchedulePage = lazy(() => import('./pages/dashboard/SchedulePage'))
const DashboardNotesPage = lazy(() => import('./pages/dashboard/NotesPage'))
const DashboardReportsPage = lazy(() => import('./pages/dashboard/ReportsPage'))
const DashboardScannerPage = lazy(() => import('./pages/dashboard/ScannerPage'))
const DashboardAccountPage = lazy(() => import('./pages/dashboard/AccountPage'))
const DashboardSettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'))
const DashboardSupportPage = lazy(() => import('./pages/dashboard/SupportPage'))
const DashboardUpgradePage = lazy(() => import('./pages/dashboard/UpgradePage'))
const DashboardGuidePage = lazy(() => import('./pages/dashboard/GuidePage'))
const DashboardStaffPage = lazy(() => import('./pages/dashboard/StaffPage'))
const PreviewPage = lazy(() => import('./pages/dashboard/PreviewPage'))

// --- Staff Pages ---
const StaffDashboardPage = lazy(() => import('./pages/staff/StaffDashboardPage'))

// --- Admin Pages ---
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminUserDetailPage = lazy(() => import('./pages/admin/AdminUserDetailPage'))
const AdminWeddingsPage = lazy(() => import('./pages/admin/AdminWeddingsPage'))
const AdminWeddingDetailPage = lazy(() => import('./pages/admin/AdminWeddingDetailPage'))
const AdminGovernancePage = lazy(() => import('./pages/admin/AdminGovernancePage'))
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'))
const AdminMasterPage = lazy(() => import('./pages/admin/master/AdminMasterPage'))
const AdminMasterAnalyticsPage = lazy(() => import('./pages/admin/master/AnalyticsPage'))
const AdminMasterAuditPage = lazy(() => import('./pages/admin/master/AuditPage'))
const AdminMasterBroadcastPage = lazy(() => import('./pages/admin/master/BroadcastPage'))
const AdminMasterMaintenancePage = lazy(() => import('./pages/admin/master/MaintenancePage'))
const AdminMasterPaymentsPage = lazy(() => import('./pages/admin/master/PaymentsPage'))
const AdminMasterSecurityPage = lazy(() => import('./pages/admin/master/SecurityPage'))
const AdminMasterSettingsPage = lazy(() => import('./pages/admin/master/SettingsPage'))
const AdminMasterSupportPage = lazy(() => import('./pages/admin/master/SupportPage'))
const AdminMasterUsersPage = lazy(() => import('./pages/admin/master/UsersPage'))
const AdminMasterWeddingsPage = lazy(() => import('./pages/admin/master/WeddingsPage'))

const fallback = <LoadingScreen />

export default function Router() {
  return (
    <Routes>
        <Route element={<RootLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Suspense fallback={fallback}><LandingPage /></Suspense>} />
          <Route path="/templates" element={<Navigate to="/" replace />} />
          <Route path="/privacy-policy" element={<Suspense fallback={fallback}><PrivacyPolicyPage /></Suspense>} />
          <Route path="/terms-and-conditions" element={<Suspense fallback={fallback}><TermsPage /></Suspense>} />
          <Route path="/maintenance" element={<Suspense fallback={fallback}><MaintenancePage /></Suspense>} />

          {/* Wedding Public Routes */}
          <Route path="/w/:id" element={<Suspense fallback={fallback}><WeddingPage /></Suspense>} />
          <Route path="/w/:id/gallery" element={<Suspense fallback={fallback}><WeddingGalleryPage /></Suspense>} />
          <Route path="/w/:id/gallery/live" element={<Suspense fallback={fallback}><WeddingGalleryLivePage /></Suspense>} />
          <Route path="/w/:id/gallery/upload" element={<Suspense fallback={fallback}><WeddingGalleryUploadPage /></Suspense>} />
          <Route path="/w/:id/guestbook" element={<Suspense fallback={fallback}><WeddingGuestbookPage /></Suspense>} />
          <Route path="/w/:id/schedule" element={<Suspense fallback={fallback}><WeddingSchedulePage /></Suspense>} />
          <Route path="/invite/:id" element={<Suspense fallback={fallback}><InvitePage /></Suspense>} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<Suspense fallback={fallback}><SignInPage /></Suspense>} />
            <Route path="/sign-up" element={<Suspense fallback={fallback}><SignUpPage /></Suspense>} />
            <Route path="/login" element={<Navigate to="/sign-in" replace />} />
            <Route path="/register" element={<Navigate to="/sign-up" replace />} />
            <Route path="/forgot-password" element={<Suspense fallback={fallback}><ForgotPasswordPage /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={fallback}><ResetPasswordPage /></Suspense>} />
          </Route>

          {/* SSO Auth Callback — outside AuthLayout so it shows just a loader */}
          <Route path="/auth/callback" element={<Suspense fallback={fallback}><AuthCallbackPage /></Suspense>} />

          {/* Preview Route (Rendered inside iframe, no layout) */}
          <Route path="/preview" element={<Suspense fallback={fallback}><PreviewPage /></Suspense>} />
          
          {/* Dashboard Routes (protected) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Suspense fallback={fallback}><DashboardPage /></Suspense>} />
            <Route path="/dashboard/create" element={<Suspense fallback={fallback}><DashboardCreatePage /></Suspense>} />
            <Route path="/dashboard/design" element={<Suspense fallback={fallback}><DashboardDesignPage /></Suspense>} />
            <Route path="/dashboard/display" element={<Suspense fallback={fallback}><DashboardDisplayPage /></Suspense>} />
            <Route path="/dashboard/guests" element={<Suspense fallback={fallback}><DashboardGuestsPage /></Suspense>} />
            <Route path="/dashboard/gifts" element={<Suspense fallback={fallback}><DashboardGiftsPage /></Suspense>} />
            <Route path="/dashboard/gifts/live" element={<Suspense fallback={fallback}><DashboardGiftsLivePage /></Suspense>} />
            <Route path="/dashboard/schedule" element={<Suspense fallback={fallback}><DashboardSchedulePage /></Suspense>} />
            <Route path="/dashboard/notes" element={<Suspense fallback={fallback}><DashboardNotesPage /></Suspense>} />
            <Route path="/dashboard/reports" element={<Suspense fallback={fallback}><DashboardReportsPage /></Suspense>} />
            <Route path="/dashboard/scanner" element={<Suspense fallback={fallback}><DashboardScannerPage /></Suspense>} />
            <Route path="/dashboard/account" element={<Suspense fallback={fallback}><DashboardAccountPage /></Suspense>} />
            <Route path="/dashboard/settings" element={<Suspense fallback={fallback}><DashboardSettingsPage /></Suspense>} />
            <Route path="/dashboard/support" element={<Suspense fallback={fallback}><DashboardSupportPage /></Suspense>} />
            <Route path="/dashboard/upgrade" element={<Suspense fallback={fallback}><DashboardUpgradePage /></Suspense>} />
            <Route path="/dashboard/guide" element={<Suspense fallback={fallback}><DashboardGuidePage /></Suspense>} />
            <Route path="/dashboard/staff" element={<Suspense fallback={fallback}><DashboardStaffPage /></Suspense>} />
          </Route>

          {/* Staff Routes (protected) */}
          <Route path="/staff/dashboard" element={<Suspense fallback={fallback}><StaffDashboardPage /></Suspense>} />

          {/* Admin Login — Hidden / Stealth Mode (Redirected to 404 for attackers) */}
          <Route path="/admin/login" element={<Suspense fallback={fallback}><NotFoundPage /></Suspense>} />

          {/* Admin Routes (protected) */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Suspense fallback={fallback}><AdminPage /></Suspense>} />
            <Route path="/admin/users" element={<Suspense fallback={fallback}><AdminUsersPage /></Suspense>} />
            <Route path="/admin/users/:id" element={<Suspense fallback={fallback}><AdminUserDetailPage /></Suspense>} />
            <Route path="/admin/weddings" element={<Suspense fallback={fallback}><AdminWeddingsPage /></Suspense>} />
            <Route path="/admin/weddings/:id" element={<Suspense fallback={fallback}><AdminWeddingDetailPage /></Suspense>} />
            <Route path="/admin/governance" element={<Suspense fallback={fallback}><AdminGovernancePage /></Suspense>} />
            <Route path="/admin/logs" element={<Suspense fallback={fallback}><AdminLogsPage /></Suspense>} />
            <Route path="/admin/master" element={<Suspense fallback={fallback}><AdminMasterPage /></Suspense>} />
            <Route path="/admin/master/analytics" element={<Suspense fallback={fallback}><AdminMasterAnalyticsPage /></Suspense>} />
            <Route path="/admin/master/audit" element={<Suspense fallback={fallback}><AdminMasterAuditPage /></Suspense>} />
            <Route path="/admin/master/broadcast" element={<Suspense fallback={fallback}><AdminMasterBroadcastPage /></Suspense>} />
            <Route path="/admin/master/maintenance" element={<Suspense fallback={fallback}><AdminMasterMaintenancePage /></Suspense>} />
            <Route path="/admin/master/payments" element={<Suspense fallback={fallback}><AdminMasterPaymentsPage /></Suspense>} />
            <Route path="/admin/master/security" element={<Suspense fallback={fallback}><AdminMasterSecurityPage /></Suspense>} />
            <Route path="/admin/master/settings" element={<Suspense fallback={fallback}><AdminMasterSettingsPage /></Suspense>} />
            <Route path="/admin/master/support" element={<Suspense fallback={fallback}><AdminMasterSupportPage /></Suspense>} />
            <Route path="/admin/master/users" element={<Suspense fallback={fallback}><AdminMasterUsersPage /></Suspense>} />
            <Route path="/admin/master/weddings" element={<Suspense fallback={fallback}><AdminMasterWeddingsPage /></Suspense>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Suspense fallback={fallback}><NotFoundPage /></Suspense>} />
        </Route>
      </Routes>
  )
}
