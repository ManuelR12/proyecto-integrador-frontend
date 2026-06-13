import { useEffect, useMemo, useRef, useState } from "react";
import { sala as copy } from "../copy/es";
import { subscribeRoomMessages } from "../services/roomFirestoreService";
import { createRoomSocket, type RoomSocketController } from "../services/roomSocketService";
import type { ChatMessage } from "../types/room";

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
	return [...messages].sort((a, b) => {
		const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
		const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
		return aTime - bTime;
	});
}

function formatConnectionError(message: string): string {
	if (message.toLowerCase().includes("already connected")) {
		return copy.chatAlreadyConnected;
	}
	return message;
}

export function useRoomChat(roomId: string | undefined) {
	const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({});
	const [loadedRooms, setLoadedRooms] = useState<Record<string, true>>({});
	const [connected, setConnected] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const [draft, setDraft] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const socketRef = useRef<RoomSocketController | null>(null);

	const messages = useMemo(
		() => (roomId ? (messagesByRoom[roomId] ?? []) : []),
		[roomId, messagesByRoom],
	);
	const loadingHistory = roomId ? !loadedRooms[roomId] : true;

	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
		});
	};

	useEffect(() => {
		if (!roomId) return;

		let active = true;

		const unsubscribe = subscribeRoomMessages(
			roomId,
			(incoming) => {
				if (!active) return;
				setMessagesByRoom((prev) => ({ ...prev, [roomId]: sortMessages(incoming) }));
				setLoadedRooms((prev) => ({ ...prev, [roomId]: true }));
			},
			() => {
				if (!active) return;
				setLoadedRooms((prev) => ({ ...prev, [roomId]: true }));
			},
		);

		return () => {
			active = false;
			unsubscribe();
		};
	}, [roomId]);

	useEffect(() => {
		if (!loadingHistory) scrollToBottom();
	}, [loadingHistory, messages]);

	useEffect(() => {
		if (!roomId) return;

		const socket = createRoomSocket(roomId, {
			onRoomJoined: () => {
				setConnectionError(null);
				setConnected(true);
			},
			onDisconnect: () => {
				setConnected(false);
			},
			onError: (message) => {
				setConnectionError(formatConnectionError(message));
				setConnected(false);
			},
		});

		socketRef.current = socket;

		return () => {
			socket.disconnect();
			socketRef.current = null;
			setConnected(false);
		};
	}, [roomId]);

	const sendMessage = () => {
		const text = draft.trim();
		if (!text || !connected) return;

		socketRef.current?.sendMessage(text);
		setDraft("");
	};

	const handleDraftChange = (value: string) => {
		setDraft(value);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	};

	return {
		messages,
		loadingHistory,
		connected,
		connectionError,
		draft,
		messagesEndRef,
		sendMessage,
		handleDraftChange,
		handleKeyDown,
	};
}
