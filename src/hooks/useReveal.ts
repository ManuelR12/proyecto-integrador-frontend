import { useRef, useState, useEffect } from 'react'

export function useReveal(threshold = 0.12) {
	const ref = useRef<HTMLDivElement>(null)
	const [inView, setInView] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) return

		// Keep observing (no disconnect) so animation reverses on scroll up
		const observer = new IntersectionObserver(
			([entry]) => {
				setInView(entry.isIntersecting)
			},
			{ threshold },
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [threshold])

	return { ref, inView }
}
