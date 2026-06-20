import type { RoomSocketController } from "../services/roomSocketService";

let activeSocket: RoomSocketController | null = null;

export function setActiveRoomSocket(socket: RoomSocketController | null): void {
	activeSocket = socket;
}

export function getActiveRoomSocket(): RoomSocketController | null {
	return activeSocket;
}

export function sendRoomChatMessage(text: string): void {
	const trimmed = text.trim();
	if (!trimmed) return;
	activeSocket?.sendMessage(trimmed);
}
