import type { ReactNode } from 'react'

interface AuthShellProps {
	children: ReactNode
}

const AuthShell = ({ children }: AuthShellProps) => (
	<div className='flex min-h-screen items-center justify-center bg-[#f6f7f8] px-4 py-10'>
		{children}
	</div>
)

export default AuthShell
