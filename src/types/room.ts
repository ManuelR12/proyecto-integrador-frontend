export interface RoomParticipant {
	uid: string;
	displayName: string;
	initials: string;
}

/** Room shape returned by GET/POST /rooms */
export interface ApiRoomDocument {
	id: string;
	name: string;
	created_by: string;
	members: string[];
	created_at?: ApiTimestamp;
}

type ApiTimestamp =
	| string
	| { seconds?: number; _seconds?: number; nanoseconds?: number; _nanoseconds?: number };

export interface Room {
	id: string;
	title: string;
	ownerId: string;
	memberIds: string[];
	participants: RoomParticipant[];
	isLive: boolean;
	createdAt: Date | null;
}

export interface CreateRoomPayload {
	name: string;
}
