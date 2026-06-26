const SCREEN_SHARE_SURFACES = new Set(["monitor", "window", "browser"]);

const SCREEN_SHARE_LABEL_PATTERN = /screen|display|window|share|monitor|web-contents/i;

/** Whether a video track carries display-capture (screen share) content. */
export function isScreenShareVideoTrack(track: MediaStreamTrack | undefined): boolean {
	if (!track || track.kind !== "video" || track.readyState !== "live") return false;

	try {
		const displaySurface = track.getSettings().displaySurface;
		if (typeof displaySurface === "string" && SCREEN_SHARE_SURFACES.has(displaySurface)) {
			return true;
		}
	} catch {
		// Remote tracks often omit displaySurface; fall through to label heuristic.
	}

	return SCREEN_SHARE_LABEL_PATTERN.test(track.label);
}

/** Whether a remote MediaStream is currently sending screen share video. */
export function remoteStreamIsScreenSharing(stream: MediaStream): boolean {
	return stream.getVideoTracks().some(isScreenShareVideoTrack);
}

const cleanups = new Map<string, () => void>();

function bindVideoTrackEvents(tracks: MediaStreamTrack[], sync: () => void): () => void {
	for (const track of tracks) {
		track.addEventListener("mute", sync);
		track.addEventListener("unmute", sync);
		track.addEventListener("ended", sync);
	}

	return () => {
		for (const track of tracks) {
			track.removeEventListener("mute", sync);
			track.removeEventListener("unmute", sync);
			track.removeEventListener("ended", sync);
		}
	};
}

export function bindRemoteScreenShareDetection(
	uid: string,
	stream: MediaStream,
	onSharingChange: (sharing: boolean) => void,
): void {
	const cleanupKey = `${uid}:screenShare`;
	cleanups.get(cleanupKey)?.();

	const sync = () => {
		onSharingChange(remoteStreamIsScreenSharing(stream));
	};

	sync();

	const onAddTrack = () => sync();
	const onRemoveTrack = () => sync();
	stream.addEventListener("addtrack", onAddTrack);
	stream.addEventListener("removetrack", onRemoveTrack);

	const unbindTracks = bindVideoTrackEvents(stream.getVideoTracks(), sync);

	cleanups.set(cleanupKey, () => {
		stream.removeEventListener("addtrack", onAddTrack);
		stream.removeEventListener("removetrack", onRemoveTrack);
		unbindTracks();
	});
}

export function unbindRemoteScreenShareDetection(uid: string): void {
	const cleanupKey = `${uid}:screenShare`;
	cleanups.get(cleanupKey)?.();
	cleanups.delete(cleanupKey);
}
