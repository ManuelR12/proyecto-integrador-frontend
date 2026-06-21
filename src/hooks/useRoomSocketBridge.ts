import { useEffect } from "react";
import { formatChatConnectionError } from "./useRoomChatSync";
import { createRoomSocket } from "../services/roomSocketService";
import { getActiveRoomSocket, setActiveRoomSocket } from "../lib/roomSessionSocketRef";
import { useChatStore } from "../stores/useChatStore";
import { useRoomStore } from "../stores/useRoomStore";

function forceRemoveParticipant(uid: string): void {
	useRoomStore.getState().removeParticipant(uid);
}

/**
 * Maintains the room socket and routes chat events to useChatStore and
 * participant roster events to useRoomStore.
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
			onCallEnded: (payload) => {
				forceRemoveParticipant(payload.fromUid);
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
