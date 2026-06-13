import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRoomMessages } from "../services/roomService";
import { createRoomSocket, type RoomSocketController } from "../services/roomSocketService";
import type { ChatMessage } from "../types/room";

function appendUniqueMessage(prev: ChatMessage[], message: ChatMessage): ChatMessage[] {
	if (prev.some((item) => item.id === message.id)) return prev;
	return [...prev, message];
}

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
	return [...messages].sort((a, b) => {
		const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
		const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
		return aTime - bTime;
	});
}

export function useRoomChat(roomId: string | undefined) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [loadingHistory, setLoadingHistory] = useState(true);
	const [historyLoaded, setHistoryLoaded] = useState(false);
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

		let active = true;

		const run = async () => {
			setLoadingHistory(true);
			setHistoryLoaded(false);
			setMessages([]);

			try {
				const history = await fetchRoomMessages(roomId);
				if (!active) return;
				setMessages(sortMessages(history));
			} catch {
				if (!active) return;
				setMessages([]);
			} finally {
				if (active) {
					setLoadingHistory(false);
					setHistoryLoaded(true);
				}
			}
		};

		void run();

		return () => {
			active = false;
		};
	}, [roomId]);

	useEffect(() => {
		if (loadingHistory) return;
		scrollToBottom();
	}, [loadingHistory, messages, scrollToBottom]);

	useEffect(() => {
		if (!roomId || !historyLoaded) return;

		const socket = createRoomSocket(roomId, {
			onConnect: () => setConnected(true),
			onDisconnect: () => setConnected(false),
			onMessage: (message) => {
				setMessages((prev) => sortMessages(appendUniqueMessage(prev, message)));
			},
		});

		socketRef.current = socket;

		return () => {
			socket.disconnect();
			socketRef.current = null;
			setConnected(false);
		};
	}, [roomId, historyLoaded]);

	useEffect(() => {
		if (!historyLoaded || loadingHistory) return;
		scrollToBottom();
	}, [historyLoaded, loadingHistory, scrollToBottom]);

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
		loadingHistory,
		connected,
		draft,
		messagesEndRef,
		sendMessage,
		handleDraftChange,
		handleKeyDown,
	};
}
