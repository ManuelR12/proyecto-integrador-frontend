const cleanups = new Map<MediaStream, () => void>();

/** Keeps store flags in sync when local track mute/end state changes. */
export function bindLocalStreamTrackState(stream: MediaStream, onChange: () => void): void {
	cleanups.get(stream)?.();

	const sync = () => {
		onChange();
	};

	const tracks = stream.getTracks();
	for (const track of tracks) {
		track.addEventListener("ended", sync);
		track.addEventListener("mute", sync);
		track.addEventListener("unmute", sync);
	}

	cleanups.set(stream, () => {
		for (const track of tracks) {
			track.removeEventListener("ended", sync);
			track.removeEventListener("mute", sync);
			track.removeEventListener("unmute", sync);
		}
		cleanups.delete(stream);
	});
}

export function unbindLocalStreamTrackState(stream: MediaStream | null): void {
	if (!stream) return;
	cleanups.get(stream)?.();
}
