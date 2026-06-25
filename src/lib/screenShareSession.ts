import { localMediaFlagsFromStream } from "./localMediaStream";
import { getActiveRoomSocket } from "./roomSessionSocketRef";
import { getActivePeerManager } from "./roomWebRtcRef";
import { useRoomStore } from "../stores/useRoomStore";

let savedCameraTrack: MediaStreamTrack | null = null;
let savedMicTrack: MediaStreamTrack | null = null;
let micWasReplaced = false;
let screenStream: MediaStream | null = null;
let pendingStart = false;
let startAborted = false;

function isUserCancelledDisplayMedia(error: unknown): boolean {
	if (!(error instanceof DOMException)) return false;
	return (
		error.name === "NotAllowedError" ||
		error.name === "AbortError" ||
		error.name === "NotFoundError"
	);
}

function removeTrackFromStream(
	stream: MediaStream,
	kind: "audio" | "video",
): MediaStreamTrack | null {
	const track = kind === "video" ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
	if (!track) return null;
	stream.removeTrack(track);
	return track;
}

function addTrackToStream(stream: MediaStream, track: MediaStreamTrack): void {
	const existing = track.kind === "video" ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
	if (existing && existing !== track) {
		stream.removeTrack(existing);
	}
	if (!stream.getTracks().includes(track)) {
		stream.addTrack(track);
	}
}

/** Stops capture hardware and restores the local stream synchronously (no awaits). */
function syncTeardownScreenShare(): void {
	startAborted = true;
	pendingStart = false;

	screenStream?.getTracks().forEach((track) => track.stop());
	screenStream = null;

	const store = useRoomStore.getState();
	const localStream = store.localStream;

	if (localStream && savedCameraTrack) {
		removeTrackFromStream(localStream, "video");
		addTrackToStream(localStream, savedCameraTrack);
		if (savedCameraTrack.enabled !== store.localVideoEnabled) {
			savedCameraTrack.enabled = store.localVideoEnabled;
		}
	}

	if (localStream && micWasReplaced && savedMicTrack) {
		removeTrackFromStream(localStream, "audio");
		addTrackToStream(localStream, savedMicTrack);
		if (savedMicTrack.enabled !== store.localAudioEnabled) {
			savedMicTrack.enabled = store.localAudioEnabled;
		}
	}

	if (localStream) {
		useRoomStore.setState({
			localStream,
			localScreenSharing: false,
			activeScreenShareUid:
				store.activeScreenShareUid === store.currentUserId ? null : store.activeScreenShareUid,
			...localMediaFlagsFromStream(localStream),
		});
		getActivePeerManager()?.setLocalStream(localStream);
	} else {
		useRoomStore.setState({
			localScreenSharing: false,
			activeScreenShareUid:
				store.activeScreenShareUid === store.currentUserId ? null : store.activeScreenShareUid,
		});
	}

	savedCameraTrack = null;
	savedMicTrack = null;
	micWasReplaced = false;
}

export function abortPendingScreenShare(): void {
	startAborted = true;
}

export function isScreenSharePending(): boolean {
	return pendingStart;
}

export async function startScreenShareSession(): Promise<boolean> {
	const store = useRoomStore.getState();
	const socket = getActiveRoomSocket();
	const peerManager = getActivePeerManager();

	if (!socket || !peerManager || !store.localStream) return false;
	if (!selectCanStartScreenShare(store)) return false;

	pendingStart = true;
	startAborted = false;

	await Promise.resolve();
	if (startAborted) {
		pendingStart = false;
		return false;
	}

	try {
		const displayStream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
			audio: true,
		});

		if (startAborted) {
			displayStream.getTracks().forEach((track) => track.stop());
			return false;
		}

		const screenVideoTrack = displayStream.getVideoTracks()[0];
		if (!screenVideoTrack) {
			displayStream.getTracks().forEach((track) => track.stop());
			return false;
		}

		const screenAudioTrack = displayStream.getAudioTracks()[0] ?? null;
		const localStream = store.localStream;

		savedCameraTrack = removeTrackFromStream(localStream, "video");
		addTrackToStream(localStream, screenVideoTrack);

		micWasReplaced = false;
		if (screenAudioTrack) {
			savedMicTrack = removeTrackFromStream(localStream, "audio");
			addTrackToStream(localStream, screenAudioTrack);
			micWasReplaced = true;
			await peerManager.replaceOutboundAudioTrack(screenAudioTrack);
		}

		screenStream = displayStream;
		await peerManager.replaceOutboundVideoTrack(screenVideoTrack);
		socket.sendScreenShareStarted();

		screenVideoTrack.addEventListener(
			"ended",
			() => {
				void stopScreenShareSession();
			},
			{ once: true },
		);

		useRoomStore.setState({
			localStream,
			localScreenSharing: true,
			activeScreenShareUid: store.currentUserId,
			...localMediaFlagsFromStream(localStream),
		});

		peerManager.setLocalStream(localStream);
		return true;
	} catch (error) {
		if (isUserCancelledDisplayMedia(error)) {
			return false;
		}
		throw error;
	} finally {
		pendingStart = false;
	}
}

export async function stopScreenShareSession(): Promise<void> {
	const store = useRoomStore.getState();
	const socket = getActiveRoomSocket();
	const peerManager = getActivePeerManager();

	if (!store.localScreenSharing && !screenStream) return;

	const cameraTrack = savedCameraTrack;
	const micTrack = savedMicTrack;
	const hadMicReplacement = micWasReplaced;

	syncTeardownScreenShare();

	if (peerManager) {
		await peerManager.replaceOutboundVideoTrack(cameraTrack);
		if (hadMicReplacement) {
			await peerManager.replaceOutboundAudioTrack(micTrack);
		}
	}

	socket?.sendScreenShareStopped();
}

export function cleanupScreenShareSession(): void {
	const wasSharing = useRoomStore.getState().localScreenSharing || Boolean(screenStream);
	syncTeardownScreenShare();
	if (wasSharing) {
		getActiveRoomSocket()?.sendScreenShareStopped();
	}
}

export function selectCanStartScreenShare(state: {
	activeScreenShareUid: string | null;
	currentUserId: string;
}): boolean {
	return state.activeScreenShareUid === null || state.activeScreenShareUid === state.currentUserId;
}
