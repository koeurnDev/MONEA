import { Navigate } from 'react-router-dom';

/**
 * `/dashboard/settings` used to render a title and a subtitle only - no controls
 * at all - so anyone who reached it (old link, bookmark, typed URL) hit a dead
 * end with nothing to do. Account settings are the single source of truth, so the
 * legacy route now forwards there instead of showing an empty screen.
 */
export default function SettingsPage() {
    return <Navigate to="/dashboard/account" replace />;
}
