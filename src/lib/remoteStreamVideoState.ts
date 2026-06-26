/** Whether a remote MediaStream currently carries renderable video frames. */
export function remoteStreamHasActiveVideo(stream: MediaStream | null): boolean {
	const track = stream?.getVideoTracks()[0];
	if (!track || track.readyState !== "live") return false;
	return track.enabled && !track.muted;
}

/** Whether a remote MediaStream currently carries audible audio. */
export function remoteStreamHasActiveAudio(stream: MediaStream | null): boolean {
	const track = stream?.getAudioTracks()[0];
	if (!track || track.readyState !== "live") return false;
	return track.enabled && !track.muted;
}

const cleanups = new Map<string, () => void>();

function bindTrackList(tracks: MediaStreamTrack[], sync: () => void): () => void {
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

export function bindRemoteStreamVideoState(
	uid: string,
	stream: MediaStream,
	onChange: (videoEnabled: boolean) => void,
): void {
	cleanups.get(uid)?.();

	const sync = () => {
		onChange(remoteStreamHasActiveVideo(stream));
	};

	sync();

	const unbind = bindTrackList(stream.getVideoTracks(), sync);
	cleanups.set(uid, unbind);
}

export function bindRemoteStreamAudioState(
	uid: string,
	stream: MediaStream,
	onChange: (audioEnabled: boolean) => void,
): void {
	const cleanupKey = `${uid}:audio`;
	cleanups.get(cleanupKey)?.();

	const sync = () => {
		onChange(remoteStreamHasActiveAudio(stream));
	};

	sync();

	const unbind = bindTrackList(stream.getAudioTracks(), sync);
	cleanups.set(cleanupKey, unbind);
}

export function unbindRemoteStreamVideoState(uid: string): void {
	cleanups.get(uid)?.();
	cleanups.delete(uid);
}

export function unbindRemoteStreamAudioState(uid: string): void {
	const cleanupKey = `${uid}:audio`;
	cleanups.get(cleanupKey)?.();
	cleanups.delete(cleanupKey);
}

export function unbindRemoteStreamMediaState(uid: string): void {
	unbindRemoteStreamVideoState(uid);
	unbindRemoteStreamAudioState(uid);
}
