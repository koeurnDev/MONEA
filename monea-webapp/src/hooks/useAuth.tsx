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
      
      if (res.data) {
        const userObj = (res.data as any)?.user || ((res.data as any)?.id ? (res.data as AuthUser) : null);
        if (userObj) {
          setUser(userObj);
          setIsLoading(false);
          return;
        }
      }

      if (res.status === 401) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Retry once if server error
      if (res.status >= 500) {
        await new Promise(r => setTimeout(r, 1000));
        const retryRes = await moneaClient.get<{ user?: AuthUser } | AuthUser>('/api/auth/me');
        if (retryRes.data) {
          const userObj2 = (retryRes.data as any)?.user || ((retryRes.data as any)?.id ? (retryRes.data as AuthUser) : null);
          if (userObj2) {
            setUser(userObj2);
            setIsLoading(false);
            return;
          }
        }
      }
    } catch (error) {
      console.warn('Auth fetch failed:', error);
    }
    
    setUser(null);
    setIsLoading(false);
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
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
