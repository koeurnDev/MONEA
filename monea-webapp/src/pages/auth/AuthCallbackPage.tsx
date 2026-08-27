import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { getApiUrl } from '@/lib/api-url';

/**
 * AuthCallbackPage — receives the JWT token from SSO callback URL params,
 * stores it via the backend /api/auth/session endpoint (which sets the HttpOnly cookie
 * on the correct origin), then redirects to the dashboard.
 *
 * This solves the cross-port cookie issue in development:
 * Worker (8787) cannot set cookies that persist for Vite (3001).
 * Instead, the frontend receives the token and calls a proxied endpoint to set the cookie.
 */
export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      navigate(`/sign-in?error=${error || 'no_code'}`, { replace: true });
      return;
    }

    // Exchange the one-time code for a session cookie via the backend
    fetch(getApiUrl('api/auth/session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json().catch(() => null);
          console.log('[Auth Callback] Session response:', data);
          
          if (data?.token) {
            // Store token in localStorage FIRST before refetching
            localStorage.setItem('auth_token', data.token);
            console.log('[Auth Callback] Token stored in localStorage');
            
            // Small delay to ensure localStorage is written
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Refetch user to update auth context
            await refetch();
            console.log('[Auth Callback] User refetched successfully');
            
            // Use navigate instead of hard redirect
            navigate('/dashboard', { replace: true });
          } else {
            console.error('[Auth Callback] No token in response');
            navigate('/sign-in?error=no_token', { replace: true });
          }
        } else {
          console.error('[Auth Callback] Session failed:', res.status);
          navigate('/sign-in?error=session_failed', { replace: true });
        }
      })
      .catch((err) => {
        console.error('[Auth Callback] Network error:', err);
        navigate('/sign-in?error=network_error', { replace: true });
      });
  }, [searchParams, navigate]);

  return <LoadingScreen />;
}
