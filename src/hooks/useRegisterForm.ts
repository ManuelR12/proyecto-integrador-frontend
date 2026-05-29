import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth as copy } from '../copy/es'
import { registerWithEmail } from '../services/authService'
import type { RegisterFieldErrors, RegisterPayload } from '../types/auth'

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FormState {
  nombres: string
  apellidos: string
  username: string
  email: string
  password: string
  avatarDataUrl: string | null
}

const INITIAL_FORM: FormState = {
  nombres: '',
  apellidos: '',
  username: '',
  email: '',
  password: '',
  avatarDataUrl: null,
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useRegisterForm() {
  const navigate = useNavigate()

  const [fields, setFields] = useState<FormState>(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ---- field updaters ----
  const setField = (name: keyof FormState, value: string | null) => {
    setFields((prev) => ({ ...prev, [name]: value }))
    // Clear the specific error when the user edits the field
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    setServerError(null)
  }

  const setAvatarError = (error: string | undefined) => {
    setFieldErrors((prev) => ({ ...prev, avatar: error }))
  }

  // ---- client-side validation ----
  function validate(data: FormState): RegisterFieldErrors {
    const errors: RegisterFieldErrors = {}

    if (!data.nombres.trim()) {
      errors.nombres = copy.register.errors.nombresRequired
    }
    if (!data.apellidos.trim()) {
      errors.apellidos = copy.register.errors.apellidosRequired
    }
    if (!USERNAME_REGEX.test(data.username)) {
      errors.username = copy.register.errors.usernameInvalid
    }
    if (!EMAIL_REGEX.test(data.email)) {
      errors.email = copy.register.errors.emailInvalid
    }
    if (data.password.length < 8) {
      errors.password = copy.register.errors.passwordWeak
    }

    return errors
  }

  // ---- submit ----
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError(null)

    const errors = validate(fields)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    const payload: RegisterPayload = {
      nombres: fields.nombres.trim(),
      apellidos: fields.apellidos.trim(),
      username: fields.username.trim(),
      email: fields.email.trim(),
      password: fields.password,
      avatarDataUrl: fields.avatarDataUrl,
    }

    setLoading(true)
    try {
      await registerWithEmail(payload)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setServerError(resolveServerError(err))
    } finally {
      setLoading(false)
    }
  }

  return {
    fields,
    fieldErrors,
    serverError,
    loading,
    setField,
    setAvatarError,
    handleSubmit,
  }
}

// ---------------------------------------------------------------------------
// Map service error codes → user-facing copy
// ---------------------------------------------------------------------------
function resolveServerError(err: unknown): string {
  if (!(err instanceof Error)) return copy.register.errors.emailInvalid

  switch (err.message) {
    case 'USERNAME_TAKEN':
      return copy.register.errors.usernameTaken
    case 'EMAIL_TAKEN':
      return copy.register.errors.emailInvalid
    case 'EMAIL_INVALID':
      return copy.register.errors.emailInvalid
    case 'PASSWORD_WEAK':
      return copy.register.errors.passwordWeak
    case 'NETWORK_ERROR':
      return 'Sin conexión. Verifica tu red e intenta de nuevo.'
    default:
      return 'Ocurrió un error inesperado. Intenta de nuevo.'
  }
}
