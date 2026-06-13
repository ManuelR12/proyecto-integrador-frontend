import { useCallback, useEffect, useRef, useState } from "react";
import { createRoomSocket, type RoomSocketController } from "../services/roomSocketService";
import type { ChatMessage } from "../types/room";

function appendUniqueMessage(prev: ChatMessage[], message: ChatMessage): ChatMessage[] {
	if (prev.some((item) => item.id === message.id)) return prev;
	return [...prev, message];
}

export function useRoomChat(roomId: string | undefined) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [connected, setConnected] = useState(false);
	const [draft, setDraft] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const socketRef = useRef<RoomSocketController | null>(null);

	const scrollToBottom = useCallback(() => {
		requestAnimationFrame(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
		});
	}, []);

	useEffect(() => {
		if (!roomId) return;

		const socket = createRoomSocket(roomId, {
			onConnect: () => setConnected(true),
			onDisconnect: () => setConnected(false),
			onMessage: (message) => {
				setMessages((prev) => appendUniqueMessage(prev, message));
			},
		});

		socketRef.current = socket;

		return () => {
			socket.disconnect();
			socketRef.current = null;
		};
	}, [roomId]);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	const sendMessage = useCallback(() => {
		const text = draft.trim();
		if (!text || !connected) return;

		socketRef.current?.sendMessage(text);
		setDraft("");
	}, [connected, draft]);

	const handleDraftChange = useCallback((value: string) => {
		setDraft(value);
	}, []);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				sendMessage();
			}
		},
		[sendMessage],
	);

	return {
		messages,
		connected,
		draft,
		messagesEndRef,
		sendMessage,
		handleDraftChange,
		handleKeyDown,
	};
}
