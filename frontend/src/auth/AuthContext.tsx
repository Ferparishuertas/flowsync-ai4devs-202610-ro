import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, ApiError, type User } from '@/lib/api'

const TOKEN_KEY = 'flowsync.token'

type SignupInput = Parameters<typeof api.signup>[0]

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (input: SignupInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // sin almacenamiento disponible: la sesión dura lo que la pestaña
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => readToken() !== null)

  const start = useCallback((result: { user: User; token: string }) => {
    writeToken(result.token)
    setToken(result.token)
    setUser(result.user)
  }, [])

  // Restaura la sesión al recargar: valida el token guardado con el perfil.
  useEffect(() => {
    const stored = readToken()
    if (!stored) return
    let cancelled = false
    api
      .profile(stored)
      .then((profile) => {
        if (!cancelled) setUser(profile)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          writeToken(null)
          setToken(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (email, password) => start(await api.login(email, password)),
      signup: async (input) => start(await api.signup(input)),
      logout: async () => {
        const current = token
        writeToken(null)
        setToken(null)
        setUser(null)
        if (current) await api.logout(current).catch(() => undefined)
      },
    }),
    [user, token, loading, start],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
