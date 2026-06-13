import { useEffect, useState } from "react";

/**
 * Starts a countdown once `isReady` becomes true.
 * Resets when `isReady` goes back to false.
 */
export function useConfirmCountdown(isReady: boolean, delaySeconds = 3) {
	const [remaining, setRemaining] = useState(delaySeconds);

	useEffect(() => {
		if (!isReady) return;

		const timeout = window.setTimeout(() => {
			setRemaining(delaySeconds);
		}, 0);

		const interval = window.setInterval(() => {
			setRemaining((prev) => Math.max(prev - 1, 0));
		}, 1000);

		return () => {
			window.clearTimeout(timeout);
			window.clearInterval(interval);
		};
	}, [isReady, delaySeconds]);

	return {
		remaining: isReady ? remaining : delaySeconds,
		canProceed: isReady && remaining === 0,
	};
}
