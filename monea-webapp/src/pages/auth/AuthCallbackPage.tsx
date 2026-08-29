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

    const token = searchParams.get('token');
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      navigate(`/sign-in?error=${error}`, { replace: true });
      return;
    }

    // Direct token support — fastest and most reliable
    if (token) {
      localStorage.setItem('auth_token', token);
      console.log('[Auth Callback] Direct token stored in localStorage');
      window.location.href = '/dashboard';
      return;
    }

    if (!code) {
      navigate('/sign-in?error=no_code', { replace: true });
      return;
    }

    // Fallback: Exchange the one-time code for a session cookie via the backend
    fetch(getApiUrl('api/auth/session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        console.log('[Auth Callback] Response status:', res.status);
        console.log('[Auth Callback] Response headers:', Object.fromEntries(res.headers.entries()));
        
        // Get raw response text first
        const text = await res.text();
        console.log('[Auth Callback] Raw response:', text);
        
        if (res.ok) {
          let data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (e) {
            console.error('[Auth Callback] JSON parse error:', e);
            navigate('/sign-in?error=invalid_response', { replace: true });
            return;
          }
          
          console.log('[Auth Callback] Parsed response:', data);
          
          if (data?.token) {
            // Store token in localStorage FIRST before redirecting
            localStorage.setItem('auth_token', data.token);
            console.log('[Auth Callback] Token stored in localStorage');
            
            // Clean redirect to dashboard
            window.location.href = '/dashboard';
          } else {
            console.error('[Auth Callback] No token in response, data:', data);
            navigate('/sign-in?error=no_token', { replace: true });
          }
        } else {
          console.error('[Auth Callback] Session failed:', res.status, text);
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
