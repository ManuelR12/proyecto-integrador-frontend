import { getActivePeerManager } from "./roomWebRtcRef";

export function localMediaFlagsFromStream(stream: MediaStream | null) {
	const videoTrack = stream?.getVideoTracks()[0];
	const audioTrack = stream?.getAudioTracks()[0];

	return {
		hasLocalVideoTrack: Boolean(videoTrack),
		hasLocalAudioTrack: Boolean(audioTrack),
		localVideoEnabled: videoTrack?.enabled ?? false,
		localAudioEnabled: audioTrack?.enabled ?? false,
	};
}

export async function acquireLocalMedia(): Promise<MediaStream> {
	try {
		return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	} catch {
		return await navigator.mediaDevices.getUserMedia({ audio: true });
	}
}

export async function requestMediaTrack(kind: "audio" | "video"): Promise<MediaStreamTrack | null> {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ [kind]: true });
		const track = kind === "audio" ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
		for (const entry of stream.getTracks()) {
			if (entry !== track) entry.stop();
		}
		return track ?? null;
	} catch {
		return null;
	}
}

export function attachTrackToLocalStream(
	localStream: MediaStream | null,
	track: MediaStreamTrack,
): MediaStream {
	const stream = localStream ?? new MediaStream();
	const existing = track.kind === "video" ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];

	if (existing) {
		existing.stop();
		stream.removeTrack(existing);
	}

	stream.addTrack(track);
	return stream;
}

export function applyLocalStreamUpdate(localStream: MediaStream | null): void {
	getActivePeerManager()?.setLocalStream(localStream);
}
