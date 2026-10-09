import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { getApiUrl } from '@/lib/api-url';

/**
 * AuthCallbackPage — exchanges a short-lived SSO ticket for an HttpOnly session cookie,
 * then redirects to the dashboard.
 */
export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    window.history.replaceState(null, "", window.location.pathname);

    if (error) {
      navigate(`/sign-in?error=${error}`, { replace: true });
      return;
    }

    if (searchParams.has('token')) {
      navigate('/sign-in?error=invalid_sso_session', { replace: true });
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
        const text = await res.text();
        
        if (res.ok) {
          let data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (e) {
            console.error('[Auth Callback] JSON parse error:', e);
            navigate('/sign-in?error=invalid_response', { replace: true });
            return;
          }
          if (data?.success) {
            window.location.href = '/dashboard';
          } else {
            console.error('[Auth Callback] Session exchange response was incomplete');
            navigate('/sign-in?error=invalid_response', { replace: true });
          }
        } else {
          console.error('[Auth Callback] Session exchange failed:', res.status);
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
