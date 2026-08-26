import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
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
  refetch: async () => {},
  logout: async () => {},
})

/**
 * AuthProvider — fetches the current user from the backend /api/auth/me endpoint.
 * This replaces Next.js getServerUser() which read cookies server-side.
 * The token cookie (HttpOnly) is sent automatically by the browser with credentials: 'include'.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await moneaClient.get<{ user?: AuthUser } | AuthUser>('/api/auth/me');
      
      // Handle successful response
      if (res.data && res.status === 200) {
        const userObj = (res.data as any)?.user || ((res.data as any)?.id ? (res.data as AuthUser) : null);
        if (userObj) {
          setUser(userObj);
          setIsLoading(false);
          return;
        }
      }

      // Handle 401 - user not authenticated (normal case)
      if (res.status === 401) {
        console.log('[Auth] User not authenticated - clearing token');
        localStorage.removeItem('auth_token');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Handle server errors with retry
      if (res.status >= 500) {
        console.warn('[Auth] Server error, retrying once...', res.status);
        await new Promise(r => setTimeout(r, 1000));
        const retryRes = await moneaClient.get<{ user?: AuthUser } | AuthUser>('/api/auth/me');
        if (retryRes.data && retryRes.status === 200) {
          const userObj2 = (retryRes.data as any)?.user || ((retryRes.data as any)?.id ? (retryRes.data as AuthUser) : null);
          if (userObj2) {
            setUser(userObj2);
            setIsLoading(false);
            return;
          }
        }
      }

      // Handle other errors
      console.warn('[Auth] Auth check failed with status:', res.status, res.error);
    } catch (error) {
      console.warn('[Auth] Auth fetch failed:', error);
      // Clear token on persistent errors
      localStorage.removeItem('auth_token');
    }
    
    setUser(null);
    setIsLoading(false);
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
    localStorage.removeItem('auth_token');
    await moneaClient.post('/api/auth/logout');
    setUser(null);
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
