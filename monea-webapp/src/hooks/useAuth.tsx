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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const userObj = data?.user || (data?.id ? data : null);
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

      // For other errors, try once more after a brief delay
      if (res.status >= 500) {
        await new Promise(r => setTimeout(r, 1000));
        try {
          const res2 = await fetch('/api/auth/me', { 
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
            }
          });
          if (res2.ok) {
            const data2 = await res2.json();
            const userObj2 = data2?.user || (data2?.id ? data2 : null);
            if (userObj2) { 
              setUser(userObj2); 
              setIsLoading(false); 
              return; 
            }
          }
          if (res2.status === 401) {
            setUser(null);
            setIsLoading(false);
            return;
          }
        } catch (_) { 
          console.warn('Auth retry failed');
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
