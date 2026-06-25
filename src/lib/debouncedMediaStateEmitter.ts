import { getActiveRoomSocket } from "./roomSessionSocketRef";
import { useRoomStore } from "../stores/useRoomStore";

export const MEDIA_STATE_EMIT_DEBOUNCE_MS = 450;

let timerId: ReturnType<typeof setTimeout> | null = null;
let pending = false;
let lastEmitted: { isMuted: boolean; isVideoOff: boolean } | null = null;

function emitSnapshotNow(): void {
	const socket = getActiveRoomSocket();
	if (!socket) {
		pending = false;
		return;
	}

	const { localAudioEnabled, localVideoEnabled } = useRoomStore.getState();
	const isMuted = !localAudioEnabled;
	const isVideoOff = !localVideoEnabled;

	if (lastEmitted && lastEmitted.isMuted === isMuted && lastEmitted.isVideoOff === isVideoOff) {
		pending = false;
		return;
	}

	socket.sendMediaStateChanged(isMuted, isVideoOff);
	lastEmitted = { isMuted, isVideoOff };
	pending = false;
}

/** Schedules a trailing debounced emit of the latest local mic/camera snapshot. */
export function scheduleMediaStateEmit(): void {
	pending = true;
	if (timerId !== null) {
		clearTimeout(timerId);
	}
	timerId = setTimeout(() => {
		timerId = null;
		emitSnapshotNow();
	}, MEDIA_STATE_EMIT_DEBOUNCE_MS);
}

/** Emits immediately when a debounced update is still pending (e.g. before leaving the room). */
export function flushMediaStateEmit(): void {
	if (timerId !== null) {
		clearTimeout(timerId);
		timerId = null;
	}
	if (!pending) return;
	emitSnapshotNow();
}

/** Clears any pending emit without sending (e.g. on room reset). */
export function cancelMediaStateEmit(): void {
	if (timerId !== null) {
		clearTimeout(timerId);
		timerId = null;
	}
	pending = false;
	lastEmitted = null;
}
