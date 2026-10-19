const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1'

export type User = {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string | null
}

type AuthResult = { user: User; token: string }

type ApiErrorItem = { message: string; rule?: string; field?: string }

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const FIELD_LABELS: Record<string, string> = {
  email: 'El email',
  password: 'La contraseña',
  passwordConfirmation: 'La confirmación de contraseña',
  fullName: 'El nombre',
}

function translateFieldError(item: ApiErrorItem): string {
  const label = FIELD_LABELS[item.field ?? ''] ?? 'El campo'
  switch (item.rule) {
    case 'email':
      return 'Introduce un email válido.'
    case 'database.unique':
      return 'Este email ya está registrado.'
    case 'minLength':
      return `${label} debe tener al menos 8 caracteres.`
    case 'maxLength':
      return `${label} es demasiado largo.`
    case 'sameAs':
      return 'Las contraseñas no coinciden.'
    case 'required':
      return `${label} es obligatorio.`
    default:
      return item.message
  }
}

function toApiError(status: number, body: unknown): ApiError {
  const errors: ApiErrorItem[] =
    body && typeof body === 'object' && 'errors' in body
      ? ((body as { errors: ApiErrorItem[] }).errors ?? [])
      : []

  if (status === 422) {
    const fieldErrors: Record<string, string> = {}
    for (const item of errors) {
      if (item.field && !fieldErrors[item.field]) {
        fieldErrors[item.field] = translateFieldError(item)
      }
    }
    return new ApiError(
      status,
      Object.values(fieldErrors)[0] ?? 'Revisa los datos del formulario.',
      fieldErrors,
    )
  }
  if (status === 400 && errors[0]?.message === 'Invalid user credentials') {
    return new ApiError(status, 'Email o contraseña incorrectos.')
  }
  if (status === 401) {
    return new ApiError(
      status,
      'Tu sesión no es válida. Inicia sesión de nuevo.',
    )
  }
  return new ApiError(
    status,
    'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
  )
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No se puede conectar con el servidor.')
  }

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) throw toApiError(response.status, body)
  return (body as { data: T }).data
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResult>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  signup: (input: {
    fullName: string | null
    email: string
    password: string
    passwordConfirmation: string
  }) => request<AuthResult>('/auth/signup', { method: 'POST', body: input }),
  profile: (token: string) => request<User>('/account/profile', { token }),
  logout: (token: string) =>
    request<unknown>('/account/logout', { method: 'POST', token }),
}
