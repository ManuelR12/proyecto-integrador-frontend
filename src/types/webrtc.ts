/** Payload relayed by the server when a peer sends an SDP offer. */
export interface IncomingOfferPayload {
	fromUid: string;
	fromUsername: string;
	roomId: string;
	sdp: RTCSessionDescriptionInit;
}

/** Payload relayed by the server when a peer sends an SDP answer. */
export interface IncomingAnswerPayload {
	fromUid: string;
	roomId: string;
	sdp: RTCSessionDescriptionInit;
}

/** Payload relayed by the server when a peer shares an ICE candidate. */
export interface IncomingIceCandidatePayload {
	fromUid: string;
	roomId?: string;
	candidate: RTCIceCandidateInit;
}

export interface CallEndedPayload {
	fromUid: string;
}

/** Client → server: minimal mic/camera snapshot (no user object; uid comes from socket auth). */
export interface MediaStateChangedPayload {
	room_id: string;
	isMuted: boolean;
	isVideoOff: boolean;
}

/** Server → client when a remote peer changes mic/camera state. */
export interface PeerMediaStateChangedPayload {
	room_id: string;
	uid: string;
	socket_id: string;
	isMuted: boolean;
	isVideoOff: boolean;
}

/** @deprecated Use PeerMediaStateChangedPayload via peer_media_state_changed. */
export interface PeerMediaToggledPayload {
	uid: string;
	mic: boolean;
	camera: boolean;
}

/** Emitted when a peer disconnects abruptly (signaling server notification). */
export interface UserDisconnectedPayload {
	uid: string;
}

/** Client → server when requesting exclusive screen share in a room. */
export interface ScreenShareStartedPayload {
	roomId: string;
}

/** Client → server when releasing the room screen-share lock. */
export interface ScreenShareEndedPayload {
	roomId: string;
}

/** Server → client when a participant starts or stops sharing. */
export interface PeerScreenShareChangedPayload {
	roomId: string;
	activeScreenShareUid: string | null;
}

/** Server → client when screen share is rejected (another peer is sharing). */
export interface ScreenShareDeniedPayload {
	roomId: string;
	activeScreenShareUid: string;
}
