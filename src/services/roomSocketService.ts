import { io, type Socket } from "socket.io-client";
import { getIdToken } from "../lib/authToken";
import type { ChatMessage } from "../types/room";

function socketBaseUrl(): string {
	return import.meta.env.VITE_API_BASE_URL ?? "";
}

export interface RoomSocketHandlers {
	onConnect: () => void;
	onDisconnect: () => void;
	onMessage: (message: ChatMessage) => void;
}

export interface RoomSocketController {
	sendMessage: (text: string) => void;
	disconnect: () => void;
}

/**
 * Opens a persistent Socket.io connection for a study room.
 * Emits join_room on connect and leave_room on disconnect.
 */
export function createRoomSocket(
	roomId: string,
	handlers: RoomSocketHandlers,
): RoomSocketController {
	let socket: Socket | null = null;
	let active = true;

	void getIdToken()
		.then((token) => {
			if (!active) return;

			const baseUrl = socketBaseUrl();
			if (!baseUrl) {
				handlers.onDisconnect();
				return;
			}

			socket = io(baseUrl, {
				auth: { token },
				transports: ["websocket", "polling"],
				reconnection: true,
			});

			socket.on("connect", () => {
				socket?.emit("join_room", roomId);
				handlers.onConnect();
			});

			socket.on("disconnect", () => {
				handlers.onDisconnect();
			});

			socket.on("connect_error", () => {
				handlers.onDisconnect();
			});

			socket.on("receive_message", (message: ChatMessage) => {
				handlers.onMessage(message);
			});
		})
		.catch(() => {
			handlers.onDisconnect();
		});

	return {
		sendMessage(text: string) {
			const trimmed = text.trim();
			if (!trimmed || !socket?.connected) return;
			socket.emit("send_message", { room_id: roomId, text: trimmed });
		},
		disconnect() {
			active = false;
			if (socket?.connected) {
				socket.emit("leave_room", roomId);
			}
			socket?.disconnect();
			socket = null;
		},
	};
}
