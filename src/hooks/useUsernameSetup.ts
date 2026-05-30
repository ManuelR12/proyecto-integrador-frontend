import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth as copy } from '../copy/es'
import { isUsernameTaken, saveGoogleUserProfile } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
const DEBOUNCE_MS = 450
const SETUP = copy.google.usernameSetup

export function useUsernameSetup() {
	const navigate = useNavigate()
	const { user, loading: authLoading } = useAuth()
	const [username, setUsername] = useState('')
	const [fieldError, setFieldError] = useState<string | undefined>()
	const [serverStatus, setServerStatus] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [checking, setChecking] = useState(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Guard: if auth resolves with no user, send home
	useEffect(() => {
		if (!authLoading && !user) {
			navigate('/', { replace: true })
		}
	}, [user, authLoading, navigate])

	// Cancel debounce on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current !== null) clearTimeout(timerRef.current)
		}
	}, [])

	const handleUsernameChange = (value: string) => {
		setUsername(value)
		setFieldError(undefined)
		setServerStatus(null)

		if (timerRef.current !== null) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}

		if (!USERNAME_REGEX.test(value)) {
			setChecking(false)
			return
		}

		setChecking(true)
		timerRef.current = setTimeout(async () => {
			try {
				const taken = await isUsernameTaken(value)
				if (taken) setFieldError(SETUP.errors.usernameTaken)
			} catch {
				// silently ignore; submit will re-validate
			} finally {
				setChecking(false)
				timerRef.current = null
			}
		}, DEBOUNCE_MS)
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (checking || loading) return

		setFieldError(undefined)
		setServerStatus(null)

		if (!USERNAME_REGEX.test(username)) {
			setFieldError(SETUP.errors.usernameInvalid)
			return
		}

		setLoading(true)
		setServerStatus(SETUP.statusLoading)
		try {
			await saveGoogleUserProfile(username)
			navigate('/dashboard', { replace: true })
		} catch (err: unknown) {
			if (err instanceof Error && err.message === 'USERNAME_TAKEN') {
				setFieldError(SETUP.errors.usernameTaken)
			} else {
				setFieldError('Ocurrió un error inesperado. Intenta de nuevo.')
			}
		} finally {
			setLoading(false)
			setServerStatus(null)
		}
	}

	return {
		user,
		username,
		fieldError,
		serverStatus,
		loading,
		checking,
		handleUsernameChange,
		handleSubmit,
	}
}
