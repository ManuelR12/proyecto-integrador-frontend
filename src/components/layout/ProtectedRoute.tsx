import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { auth } from '../../lib/firebase'

interface ProtectedRouteProps {
	children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const navigate = useNavigate()
	const [checking, setChecking] = useState(true)

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (!user) {
				navigate('/login', { replace: true })
			} else {
				setChecking(false)
			}
		})
		return unsubscribe
	}, [navigate])

	if (checking) {
		return (
			<div
				role='status'
				aria-label='Verificando sesión'
				className='flex min-h-screen items-center justify-center bg-[#f6f7f8]'
			>
				<svg
					className='h-6 w-6 animate-spin text-blue-600'
					viewBox='0 0 24 24'
					fill='none'
					aria-hidden='true'
				>
					<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
					<path
						className='opacity-75'
						fill='currentColor'
						d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
					/>
				</svg>
			</div>
		)
	}

	return <>{children}</>
}

export default ProtectedRoute
