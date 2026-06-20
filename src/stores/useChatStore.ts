import { create } from "zustand";
import type { ChatMessage } from "../types/room";

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
	return [...messages].sort((a, b) => {
		const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
		const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
		return aTime - bTime;
	});
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
		set((state) => ({
			messagesByRoom: { ...state.messagesByRoom, [roomId]: sortMessages(messages) },
		})),
	markRoomLoaded: (roomId) =>
		set((state) => ({
			loadedRooms: { ...state.loadedRooms, [roomId]: true },
		})),
	setConnected: (connected) => set({ connected }),
	setConnectionError: (connectionError) => set({ connectionError }),
	setDraft: (draft) => set({ draft }),
	clearDraft: () => set({ draft: "" }),
	reset: () => set(initialState),
}));

export function selectRoomMessages(roomId: string | undefined) {
	return (state: ChatState) => (roomId ? (state.messagesByRoom[roomId] ?? []) : []);
}

export function selectRoomHistoryLoaded(roomId: string | undefined) {
	return (state: ChatState) => (roomId ? Boolean(state.loadedRooms[roomId]) : false);
}
