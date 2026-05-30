import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth as copy } from '../copy/es'
import { registerWithEmail } from '../services/authService'
import { useToast } from '../contexts/ToastContext'
import type { RegisterFieldErrors, RegisterPayload } from '../types/auth'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

export function useRegisterForm() {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const [fields, setFields] = useState<FormState>(INITIAL_FORM)
	const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
	const [serverError, setServerError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const setField = (name: keyof FormState, value: string | null) => {
		setFields((prev) => ({ ...prev, [name]: value }))
		setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
		setServerError(null)
	}

	const setAvatarError = (error: string | undefined) => {
		setFieldErrors((prev) => ({ ...prev, avatar: error }))
	}

	function validate(data: FormState): RegisterFieldErrors {
		const errors: RegisterFieldErrors = {}
		if (!data.nombres.trim()) errors.nombres = copy.register.errors.nombresRequired
		if (!data.apellidos.trim()) errors.apellidos = copy.register.errors.apellidosRequired
		if (!USERNAME_REGEX.test(data.username)) errors.username = copy.register.errors.usernameInvalid
		if (!EMAIL_REGEX.test(data.email)) errors.email = copy.register.errors.emailInvalid
		if (data.password.length < 8) errors.password = copy.register.errors.passwordWeak
		return errors
	}

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
			showToast('¡Cuenta creada! Bienvenido a Agora.', 'success')
			navigate('/dashboard', { replace: true })
		} catch (err: unknown) {
			if (err instanceof Error && err.message === 'USERNAME_TAKEN') {
				setFieldErrors((prev) => ({
					...prev,
					username: copy.register.errors.usernameTaken,
				}))
			} else {
				const msg = resolveServerError(err)
				setServerError(msg)
				showToast('No se pudo crear la cuenta. Intenta de nuevo.', 'error')
			}
		} finally {
			setLoading(false)
		}
	}

	return { fields, fieldErrors, serverError, loading, setField, setAvatarError, handleSubmit }
}

function resolveServerError(err: unknown): string {
	if (!(err instanceof Error)) return 'Ocurrió un error inesperado. Intenta de nuevo.'
	switch (err.message) {
		case 'EMAIL_TAKEN':
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
