import { createContext, useContext, type ReactNode } from "react";

interface MediaPlaybackContextValue {
	/** True after the user clicked "Entrar a sala" in the lobby. */
	playbackUnlocked: boolean;
}

const MediaPlaybackContext = createContext<MediaPlaybackContextValue | null>(null);

interface MediaPlaybackProviderProps {
	playbackUnlocked: boolean;
	children: ReactNode;
}

export function MediaPlaybackProvider({ playbackUnlocked, children }: MediaPlaybackProviderProps) {
	return (
		<MediaPlaybackContext.Provider value={{ playbackUnlocked }}>
			{children}
		</MediaPlaybackContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMediaPlayback(): MediaPlaybackContextValue {
	const ctx = useContext(MediaPlaybackContext);
	if (!ctx) {
		throw new Error("useMediaPlayback must be used within MediaPlaybackProvider");
	}
	return ctx;
}
