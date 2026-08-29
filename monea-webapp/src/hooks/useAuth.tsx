import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useRef,
} from 'react'
import type { AuthUser } from '@/types/auth'
import { moneaClient } from '@/lib/api-client'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  refetch: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refetch: async () => { },
  logout: async () => { },
})

/**
 * Optimized AuthProvider for mobile performance
 */
// ─── DEV-ONLY Auth Bypass ───────────────────────────────────────────────────
// Set VITE_DEV_BYPASS_AUTH=true in .env.local to skip login during UI development.
const DEV_MOCK_USER: AuthUser = {
  id: 'dev-user-001',
  userId: 'dev-user-001',
  email: 'dev@monea.test',
  name: 'Dev User',
  role: 'USER',
  weddingId: undefined,
  type: 'user',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const isBypassMode = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

  const [user, setUser] = useState<AuthUser | null>(isBypassMode ? DEV_MOCK_USER : null)
  const [isLoading, setIsLoading] = useState(isBypassMode ? false : true)
  const fetchingRef = useRef(false)
  const retryCountRef = useRef(0)

  const fetchUser = useCallback(async () => {
    // In bypass mode, always use mock user
    if (isBypassMode) {
      setUser(DEV_MOCK_USER);
      setIsLoading(false);
      return;
    }

    // Prevent concurrent fetches
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      setIsLoading(true);
      const res = await moneaClient.get<{ user?: AuthUser } | AuthUser>('/api/auth/me');

      // Handle successful response
      if (res.data && res.status === 200) {
        const userObj = (res.data as any)?.user || ((res.data as any)?.id ? (res.data as AuthUser) : null);
        if (userObj) {
          setUser(userObj);
          retryCountRef.current = 0;
          return;
        }
      }

      // Handle 401 - user not authenticated (normal case)  
      if (res.status === 401) {
        setUser(null);
        return;
      }

      // Simplified server error handling
      if (res.status >= 500 && retryCountRef.current < 1) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchingRef.current = false;
          fetchUser();
        }, 2000);
        return;
      }

      // Default: clear user
      setUser(null);
    } catch (error) {
      console.warn('[Auth] Auth fetch failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [isBypassMode])

  useEffect(() => {
    if (isBypassMode) return; // Skip fetch in bypass mode
    // Debounce initial fetch for mobile
    const timer = setTimeout(fetchUser, 100);
    return () => clearTimeout(timer);
  }, []) // Remove fetchUser from deps to prevent loops

  const logout = useCallback(async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    try {
      await moneaClient.post('/api/auth/logout');
    } catch (e) {
      console.warn('[Auth] Logout error:', e);
    }
    window.location.href = '/sign-in';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
