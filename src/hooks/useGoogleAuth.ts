import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth as copy } from '../copy/es'
import { signInWithGoogle } from '../services/authService'
import { useToast } from '../contexts/ToastContext'

export function useGoogleAuth() {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const signIn = async () => {
		setLoading(true)
		setError(null)
		try {
			const { needsUsername } = await signInWithGoogle()
			if (!needsUsername) showToast('¡Conectado con Google! Bienvenido.', 'success')
			navigate(needsUsername ? '/username-setup' : '/dashboard', { replace: true })
		} catch (err: unknown) {
			if (err instanceof Error && err.message === 'POPUP_CLOSED') return
			setError(copy.google.error)
		} finally {
			setLoading(false)
		}
	}

	return { signIn, loading, error }
}
