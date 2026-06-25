/** Whether a remote MediaStream currently carries renderable video frames. */
export function remoteStreamHasActiveVideo(stream: MediaStream | null): boolean {
	const track = stream?.getVideoTracks()[0];
	if (!track || track.readyState !== "live") return false;
	return track.enabled && !track.muted && track.readyState === "live";
}

const cleanups = new Map<string, () => void>();

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

	const tracks = stream.getVideoTracks();
	for (const track of tracks) {
		track.addEventListener("mute", sync);
		track.addEventListener("unmute", sync);
		track.addEventListener("ended", sync);
	}

	cleanups.set(uid, () => {
		for (const track of tracks) {
			track.removeEventListener("mute", sync);
			track.removeEventListener("unmute", sync);
			track.removeEventListener("ended", sync);
		}
	});
}

export function unbindRemoteStreamVideoState(uid: string): void {
	cleanups.get(uid)?.();
	cleanups.delete(uid);
}
