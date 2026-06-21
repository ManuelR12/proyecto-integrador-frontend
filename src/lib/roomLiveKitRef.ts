import type { Room } from "livekit-client";

let activeLiveKitRoom: Room | null = null;

export function setActiveLiveKitRoom(room: Room | null): void {
	activeLiveKitRoom = room;
}

export function getActiveLiveKitRoom(): Room | null {
	return activeLiveKitRoom;
}
