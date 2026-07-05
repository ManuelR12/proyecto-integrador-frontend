import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface LoadingStateProps {
	text?: string;
	size?: "sm" | "md" | "lg";
}

const LoadingState = ({ text = "Cargando...", size = "md" }: LoadingStateProps) => {
	const prefersReducedMotion = usePrefersReducedMotion();

	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-5 w-5",
		lg: "h-6 w-6",
	};

	if (prefersReducedMotion) {
		// Static loading indicator for users who prefer reduced motion
		return (
			<div className="flex items-center gap-2" role="status" aria-live="polite">
				<div
					className={`${sizeClasses[size]} rounded-full border-2 border-blue-600 border-t-transparent`}
					aria-hidden="true"
				/>
				<span className="text-sm text-slate-600">{text}</span>
			</div>
		);
	}

	// Animated spinner for users without motion preference
	return (
		<div className="flex items-center gap-2" role="status" aria-live="polite">
			<svg
				className={`${sizeClasses[size]} animate-spin text-blue-600`}
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
			>
				<circle
					className="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="4"
				/>
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
			<span className="text-sm text-slate-600">{text}</span>
		</div>
	);
};

export default LoadingState;
