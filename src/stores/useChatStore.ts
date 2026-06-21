import { create } from "zustand";
import type { ChatMessage } from "../types/room";

const EMPTY_MESSAGES: ChatMessage[] = [];

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
	return [...messages].sort((a, b) => {
		const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
		const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
		return aTime - bTime;
	});
}

function messagesEqual(a: ChatMessage[], b: ChatMessage[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (
			a[i].id !== b[i].id ||
			a[i].text !== b[i].text ||
			a[i].timestamp !== b[i].timestamp ||
			a[i].sender_id !== b[i].sender_id
		) {
			return false;
		}
	}
	return true;
}

interface ChatState {
	messagesByRoom: Record<string, ChatMessage[]>;
	loadedRooms: Record<string, true>;
	connected: boolean;
	connectionError: string | null;
	draft: string;
	setMessages: (roomId: string, messages: ChatMessage[]) => void;
	markRoomLoaded: (roomId: string) => void;
	setConnected: (connected: boolean) => void;
	setConnectionError: (error: string | null) => void;
	setDraft: (draft: string) => void;
	clearDraft: () => void;
	reset: () => void;
}

const initialState = {
	messagesByRoom: {},
	loadedRooms: {},
	connected: false,
	connectionError: null,
	draft: "",
};

export const useChatStore = create<ChatState>((set) => ({
	...initialState,
	setMessages: (roomId, messages) =>
		set((state) => {
			const sorted = sortMessages(messages);
			const existing = state.messagesByRoom[roomId];
			if (existing && messagesEqual(existing, sorted)) return state;
			return { messagesByRoom: { ...state.messagesByRoom, [roomId]: sorted } };
		}),
	markRoomLoaded: (roomId) =>
		set((state) => {
			if (state.loadedRooms[roomId]) return state;
			return { loadedRooms: { ...state.loadedRooms, [roomId]: true } };
		}),
	setConnected: (connected) => set({ connected }),
	setConnectionError: (connectionError) => set({ connectionError }),
	setDraft: (draft) => set({ draft }),
	clearDraft: () => set({ draft: "" }),
	reset: () => set(initialState),
}));

export function selectRoomMessages(roomId: string | undefined) {
	return (state: ChatState) =>
		roomId ? (state.messagesByRoom[roomId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES;
}

export function selectRoomHistoryLoaded(roomId: string | undefined) {
	return (state: ChatState) => (roomId ? Boolean(state.loadedRooms[roomId]) : false);
}
