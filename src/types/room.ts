export interface RoomParticipant {
	uid: string;
	displayName: string;
	initials: string;
}

export interface SocketParticipant {
	uid: string;
	username: string;
	avatarUrl?: string | null;
}

export interface WebRTCOfferPayload {
	targetUid: string;
	roomId: string;
	sdp: RTCSessionDescriptionInit;
}

export interface WebRTCAnswerPayload {
	targetUid: string;
	roomId: string;
	sdp: RTCSessionDescriptionInit;
}

export interface WebRTCIceCandidatePayload {
	targetUid: string;
	roomId: string;
	candidate: RTCIceCandidateInit;
}

export interface IncomingOfferPayload {
	fromUid: string;
	fromUsername: string;
	roomId: string;
	sdp: RTCSessionDescriptionInit;
}

export interface IncomingAnswerPayload {
	fromUid: string;
	roomId: string;
	sdp: RTCSessionDescriptionInit;
}

export interface IncomingIceCandidatePayload {
	fromUid: string;
	candidate: RTCIceCandidateInit;
}

export interface WebRTCSocketHandlers {
	onIncomingOffer?: (payload: IncomingOfferPayload) => void;
	onIncomingAnswer?: (payload: IncomingAnswerPayload) => void;
	onIncomingIceCandidate?: (payload: IncomingIceCandidatePayload) => void;
	onCallEnded?: (payload: { fromUid: string }) => void;
	onParticipantLeftCall?: (uid: string) => void;
	onParticipantJoinedCall?: (uid: string) => void;
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

export interface ChatMessage {
	id: string;
	room_id: string;
	sender_id: string;
	username: string;
	text: string;
	timestamp: string | null;
}
