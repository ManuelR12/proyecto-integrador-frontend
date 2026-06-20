import { useEffect } from "react";
import { useRoomStore } from "../stores/useRoomStore";

async function acquireLocalMedia(): Promise<MediaStream> {
	try {
		return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	} catch {
		return await navigator.mediaDevices.getUserMedia({ audio: true });
	}
}

/** Acquires local media and writes stream state into the room store only. */
export function useRoomMediaBootstrap(enabled: boolean) {
	useEffect(() => {
		if (!enabled) return;

		const roomStore = useRoomStore.getState();
		roomStore.setLocalStatus("connecting");

		let stream: MediaStream | null = null;
		let cancelled = false;

		void acquireLocalMedia()
			.then((mediaStream) => {
				if (cancelled) {
					mediaStream.getTracks().forEach((track) => track.stop());
					return;
				}
				stream = mediaStream;
				const nextStore = useRoomStore.getState();
				nextStore.setLocalStream(mediaStream);
				nextStore.setLocalStatus("connected");
			})
			.catch(() => {
				if (!cancelled) {
					const nextStore = useRoomStore.getState();
					nextStore.setLocalStream(null);
					nextStore.setLocalStatus("failed");
				}
			});

		return () => {
			cancelled = true;
			stream?.getTracks().forEach((track) => track.stop());
			const nextStore = useRoomStore.getState();
			nextStore.setLocalStream(null);
			nextStore.setLocalStatus("connecting");
		};
	}, [enabled]);
}
