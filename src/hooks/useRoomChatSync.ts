import { useEffect } from "react";
import { sala as copy } from "../copy/es";
import { subscribeRoomMessages } from "../services/roomFirestoreService";
import { useChatStore } from "../stores/useChatStore";

/** Subscribes Firestore chat history into the isolated chat store. */
export function useRoomChatSync(roomId: string | undefined) {
	useEffect(() => {
		if (!roomId) return;

		let active = true;
		const { setMessages, markRoomLoaded } = useChatStore.getState();

		const unsubscribe = subscribeRoomMessages(
			roomId,
			(incoming) => {
				if (!active) return;
				setMessages(roomId, incoming);
				markRoomLoaded(roomId);
			},
			() => {
				if (!active) return;
				markRoomLoaded(roomId);
			},
		);

		return () => {
			active = false;
			unsubscribe();
		};
	}, [roomId]);
}

export function formatChatConnectionError(message: string): string {
	if (message.toLowerCase().includes("already connected")) {
		return copy.chatAlreadyConnected;
	}
	return message;
}
