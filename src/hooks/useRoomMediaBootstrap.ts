import { useEffect } from "react";
import { acquireLocalMedia } from "../lib/localMediaStream";
import { emitMediaStateNow } from "../lib/debouncedMediaStateEmitter";
import { useRoomStore } from "../stores/useRoomStore";

/** Acquires local media and writes stream state into the room store only. */
export function useRoomMediaBootstrap(enabled: boolean) {
	useEffect(() => {
		if (!enabled) return;

		const roomStore = useRoomStore.getState();
		if (roomStore.localStream) {
			roomStore.setLocalStatus("connected");
			return;
		}

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
				emitMediaStateNow(true);
			})
			.catch(() => {
				if (!cancelled) {
					const nextStore = useRoomStore.getState();
					nextStore.setLocalStream(null);
					// Connected without media so the tile shows the avatar, not the skeleton.
					nextStore.setLocalStatus("connected");
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
