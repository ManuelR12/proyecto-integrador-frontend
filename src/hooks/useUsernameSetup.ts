import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth as firebaseAuth } from '../lib/firebase'
import { auth as copy } from '../copy/es'
import { saveGoogleUserProfile } from '../services/authService'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export function useUsernameSetup() {
	const navigate = useNavigate()
	const [user, setUser] = useState<User | null>(firebaseAuth.currentUser)
	const [username, setUsername] = useState('')
	const [fieldError, setFieldError] = useState<string | undefined>()
	const [serverStatus, setServerStatus] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
			if (!firebaseUser) {
				navigate('/', { replace: true })
			} else {
				setUser(firebaseUser)
			}
		})
		return unsubscribe
	}, [navigate])

	const handleUsernameChange = (value: string) => {
		setUsername(value)
		setFieldError(undefined)
		setServerStatus(null)
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setFieldError(undefined)
		setServerStatus(null)

		const setup = copy.google.usernameSetup
		if (!USERNAME_REGEX.test(username)) {
			setFieldError(setup.errors.usernameInvalid)
			return
		}

		setLoading(true)
		setServerStatus(setup.statusLoading)
		try {
			await saveGoogleUserProfile(username)
			navigate('/dashboard', { replace: true })
		} catch (err: unknown) {
			if (err instanceof Error && err.message === 'USERNAME_TAKEN') {
				setFieldError(setup.errors.usernameTaken)
			} else {
				setFieldError('Ocurrió un error inesperado. Intenta de nuevo.')
			}
		} finally {
			setLoading(false)
			setServerStatus(null)
		}
	}

	return { user, username, fieldError, serverStatus, loading, handleUsernameChange, handleSubmit }
}
