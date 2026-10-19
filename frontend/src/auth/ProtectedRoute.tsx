import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { token, loading } = useAuth()
  if (loading) return <p className="p-8 text-center">Cargando…</p>
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}
