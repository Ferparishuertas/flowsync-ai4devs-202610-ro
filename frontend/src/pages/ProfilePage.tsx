import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { api, ApiError, type User } from '@/lib/api'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from './AuthLayout'

export default function ProfilePage() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    api
      .profile(token)
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch(async (e: unknown) => {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 401) {
          await logout()
          navigate('/login', { replace: true })
        } else {
          setError(
            e instanceof ApiError ? e.message : 'No se pudo cargar el perfil.',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [token, logout, navigate])

  async function onLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Tu perfil</CardTitle>
          <CardDescription>Datos de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!profile && !error && <p>Cargando…</p>}
          {profile && (
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Nombre</dt>
                <dd>{profile.fullName ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Iniciales</dt>
                <dd>{profile.initials}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Alta</dt>
                <dd>{new Date(profile.createdAt).toLocaleString('es-ES')}</dd>
              </div>
            </dl>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
