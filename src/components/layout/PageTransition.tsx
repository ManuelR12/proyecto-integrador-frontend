import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
	children: ReactNode
}

const PageTransition = ({ children }: PageTransitionProps) => {
	const { pathname } = useLocation()

	// key change forces React to unmount + remount the div,
	// which restarts the CSS animation on every navigation.
	return (
		<div key={pathname} className='animate-page-in'>
			{children}
		</div>
	)
}

export default PageTransition
