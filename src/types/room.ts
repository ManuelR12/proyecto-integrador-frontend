import type { Timestamp } from "firebase/firestore";

export interface RoomParticipant {
	uid: string;
	displayName: string;
	initials: string;
}

export interface FirestoreRoomDocument {
	title: string;
	code: string;
	ownerId: string;
	memberIds: string[];
	participants: RoomParticipant[];
	isLive: boolean;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export interface Room {
	id: string;
	title: string;
	code: string;
	ownerId: string;
	memberIds: string[];
	participants: RoomParticipant[];
	isLive: boolean;
	createdAt: Date | null;
}

export interface CreateRoomPayload {
	title: string;
	code: string;
}

export interface JoinRoomPayload {
	code: string;
}
