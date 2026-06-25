import { useEffect } from "react";
import { formatChatConnectionError } from "./useRoomChatSync";
import { getActivePeerManager } from "../lib/roomWebRtcRef";
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
				getActivePeerManager()?.connectToExistingParticipants(payload.participants ?? []);
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
				let uid = payload.uid;
				if (uid && payload.socket_id) {
					roomStore.registerParticipantSocket(uid, payload.socket_id);
				}
				if (!uid) {
					uid = roomStore.resolveUidFromSocketId(payload.socket_id);
				}
				if (!uid) return;

				roomStore.setRemoteMediaState(uid, {
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
		});

		setActiveRoomSocket(socket);

		return () => {
			if (getActiveRoomSocket() === socket) {
				setActiveRoomSocket(null);
			}
			socket.disconnect();
			chatStore.setConnected(false);
		};
	}, [roomId]);
}
