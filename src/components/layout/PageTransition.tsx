import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
	children: ReactNode
}

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const DURATION = '0.45s'

const PageTransition = ({ children }: PageTransitionProps) => {
	const { pathname } = useLocation()
	const ref = useRef<HTMLDivElement>(null)

	useLayoutEffect(() => {
		const el = ref.current
		if (!el) return

		// Snap to initial hidden state (no transition, before browser paints)
		el.style.transition = 'none'
		el.style.opacity = '0'
		el.style.transform = 'translateX(32px) scale(0.97)'

		// On next animation frame: apply transition and reveal
		const raf = requestAnimationFrame(() => {
			el.style.transition = `opacity ${DURATION} ${EASING}, transform ${DURATION} ${EASING}`
			el.style.opacity = '1'
			el.style.transform = 'translateX(0) scale(1)'
		})

		return () => cancelAnimationFrame(raf)
	}, [pathname])

	return (
		<div ref={ref} style={{ willChange: 'opacity, transform' }}>
			{children}
		</div>
	)
}

export default PageTransition
