/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";

interface UseServerWakeupReturn {
	isWakingUp: boolean;
	wakingUpMessage: string | null;
}

const COLD_START_THRESHOLD = 5000; // 5 seconds
const WAKEUP_MESSAGE = "Despertando servidor, por favor espera...";

export const useServerWakeup = (isLoading: boolean): UseServerWakeupReturn => {
	const [showMessage, setShowMessage] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		// Clear any existing timer
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		// Start new timer if loading
		if (isLoading) {
			timerRef.current = setTimeout(() => {
				setShowMessage(true);
			}, COLD_START_THRESHOLD);
		} else {
			// Reset message when loading stops - this is intentional and safe
			setShowMessage(false);
		}

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [isLoading]);

	const isWakingUp = isLoading && showMessage;
	const wakingUpMessage = isWakingUp ? WAKEUP_MESSAGE : null;

	return { isWakingUp, wakingUpMessage };
};
