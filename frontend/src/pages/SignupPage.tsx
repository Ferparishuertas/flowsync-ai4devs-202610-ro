import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { ApiError } from '@/lib/api'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from './AuthLayout'

export default function SignupPage() {
  const { signup, token } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  if (token) return <Navigate to="/profile" replace />

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const fullName = String(form.get('fullName')).trim()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      await signup({
        fullName: fullName || null,
        email: String(form.get('email')),
        password: String(form.get('password')),
        passwordConfirmation: String(form.get('passwordConfirmation')),
      })
      navigate('/profile', { replace: true })
    } catch (e) {
      if (e instanceof ApiError) {
        setError(Object.keys(e.fieldErrors).length ? null : e.message)
        setFieldErrors(e.fieldErrors)
      } else {
        setError('Ha ocurrido un error inesperado. Inténtalo de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (name: string) =>
    fieldErrors[name] && (
      <p className="text-sm text-destructive">{fieldErrors[name]}</p>
    )

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>Regístrate en FlowSync.</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} noValidate>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre (opcional)</Label>
              <Input id="fullName" name="fullName" autoComplete="name" />
              {fieldError('fullName')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
              {fieldError('email')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={32}
                required
              />
              {fieldError('password')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirmar contraseña</Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                required
              />
              {fieldError('passwordConfirmation')}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creando cuenta…' : 'Registrarse'}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="underline">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  )
}
