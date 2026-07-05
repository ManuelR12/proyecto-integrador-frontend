import { useLayoutEffect, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
	children: ReactNode;
}

const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = "0.45s";

const PageTransition = ({ children }: PageTransitionProps) => {
	const { pathname } = useLocation();
	const ref = useRef<HTMLDivElement>(null);
	const prevPathnameRef = useRef(pathname);
	const isInitialMount = useRef(true);
	const willChangeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Focus management for SPA navigation
	useEffect(() => {
		if (prevPathnameRef.current !== pathname) {
			prevPathnameRef.current = pathname;

			// Focus on main h1 after route change
			const timer = setTimeout(() => {
				const mainHeading = document.querySelector("#main-content h1") as HTMLElement;
				if (mainHeading) {
					mainHeading.setAttribute("tabIndex", "-1");
					mainHeading.focus();
					// Remove tabIndex after focus for cleaner DOM
					setTimeout(() => mainHeading.removeAttribute("tabIndex"), 100);
				}
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [pathname]);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;

		// Clear any pending will-change timer from previous transition
		if (willChangeTimerRef.current) {
			clearTimeout(willChangeTimerRef.current);
			willChangeTimerRef.current = null;
		}

		// Skip animation on initial mount for FCP performance
		if (isInitialMount.current) {
			isInitialMount.current = false;
			el.style.opacity = "1";
			el.style.transform = "none";
			// Clear will-change after initial render to avoid compositing cost
			el.style.willChange = "auto";
			return;
		}

		// Check for reduced motion preference
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (prefersReducedMotion) {
			// Skip animation for users who prefer reduced motion
			el.style.opacity = "1";
			el.style.transform = "none";
			return;
		}

		// Re-enable will-change for animation
		el.style.willChange = "opacity, transform";

		// Snap to initial hidden state (no transition, before browser paints)
		el.style.transition = "none";
		el.style.opacity = "0";
		el.style.transform = "translateX(32px) scale(0.97)";

		// On next animation frame: apply transition and reveal
		const raf = requestAnimationFrame(() => {
			el.style.transition = `opacity ${DURATION} ${EASING}, transform ${DURATION} ${EASING}`;
			el.style.opacity = "1";
			el.style.transform = "translateX(0) scale(1)";

			// Clear will-change after transition completes
			willChangeTimerRef.current = setTimeout(() => {
				if (el) el.style.willChange = "auto";
				willChangeTimerRef.current = null;
			}, 450); // Match DURATION
		});

		return () => {
			cancelAnimationFrame(raf);
			if (willChangeTimerRef.current) {
				clearTimeout(willChangeTimerRef.current);
				willChangeTimerRef.current = null;
			}
		};
	}, [pathname]);

	return <div ref={ref}>{children}</div>;
};

export default PageTransition;
