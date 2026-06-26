import { useEffect } from "react";
import { formatChatConnectionError } from "./useRoomChatSync";
import { emitMediaStateNow, flushMediaStateEmit } from "../lib/debouncedMediaStateEmitter";
import { getActivePeerManager } from "../lib/roomWebRtcRef";
import {
	abortPendingScreenShare,
	emitScreenShareStateNow,
	stopScreenShareSession,
} from "../lib/screenShareSession";
import { createRoomSocket } from "../services/roomSocketService";
import { getActiveRoomSocket, setActiveRoomSocket } from "../lib/roomSessionSocketRef";
import { useChatStore } from "../stores/useChatStore";
import { useRoomStore } from "../stores/useRoomStore";

function forceRemoveParticipant(uid: string): void {
	getActivePeerManager()?.removePeer(uid);
	useRoomStore.getState().removeParticipant(uid);
}

/**
 * Maintains the room socket and routes chat events to useChatStore and
 * participant/WebRTC roster events to useRoomStore.
 */
export function useRoomSocketBridge(roomId: string | undefined) {
	useEffect(() => {
		if (!roomId) return;

		const chatStore = useChatStore.getState();
		const roomStore = useRoomStore.getState();

		chatStore.setConnected(false);
		chatStore.setConnectionError(null);

		const socket = createRoomSocket(roomId, {
			onRoomJoined: (payload) => {
				chatStore.setConnectionError(null);
				chatStore.setConnected(true);
				roomStore.setParticipants(payload.participants ?? []);
				roomStore.setActiveScreenShareUid(payload.activeScreenShareUid ?? null);
				getActivePeerManager()?.connectToExistingParticipants(payload.participants ?? []);
				emitMediaStateNow(true);
			},
			onDisconnect: () => {
				chatStore.setConnected(false);
			},
			onError: (message) => {
				chatStore.setConnectionError(formatChatConnectionError(message));
				chatStore.setConnected(false);
			},
			onParticipantJoined: (participant) => {
				roomStore.addParticipant(participant);
				emitMediaStateNow(true);
				emitScreenShareStateNow();
			},
			onParticipantLeft: (participant) => {
				forceRemoveParticipant(participant.uid);
			},
			onUserDisconnected: (payload) => {
				forceRemoveParticipant(payload.uid);
			},
			onIncomingOffer: (payload) => {
				void getActivePeerManager()?.handleIncomingOffer(payload.fromUid, payload.sdp);
			},
			onIncomingAnswer: (payload) => {
				void getActivePeerManager()?.handleIncomingAnswer(payload.fromUid, payload.sdp);
			},
			onIncomingIceCandidate: (payload) => {
				void getActivePeerManager()?.handleIncomingIceCandidate(payload.fromUid, payload.candidate);
			},
			onCallEnded: (payload) => {
				forceRemoveParticipant(payload.fromUid);
			},
			onPeerMediaStateChanged: (payload) => {
				roomStore.registerParticipantSocket(payload.uid, payload.socket_id);
				roomStore.setRemoteMediaState(payload.uid, {
					mic: !payload.isMuted,
					camera: !payload.isVideoOff,
				});
			},
			onPeerMediaToggled: (payload) => {
				roomStore.setRemoteMediaState(payload.uid, {
					mic: payload.mic,
					camera: payload.camera,
				});
			},
			onPeerScreenShareChanged: (payload) => {
				roomStore.setActiveScreenShareUid(payload.activeScreenShareUid);
			},
			onScreenShareDenied: (payload) => {
				abortPendingScreenShare();
				roomStore.setActiveScreenShareUid(payload.activeScreenShareUid);
				if (roomStore.localScreenSharing) {
					void stopScreenShareSession();
				}
			},
		});

		setActiveRoomSocket(socket);

		return () => {
			flushMediaStateEmit();
			if (getActiveRoomSocket() === socket) {
				setActiveRoomSocket(null);
			}
			socket.disconnect();
			chatStore.setConnected(false);
		};
	}, [roomId]);
}
