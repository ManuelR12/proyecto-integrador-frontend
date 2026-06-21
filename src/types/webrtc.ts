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

/** Emitted when a peer disconnects abruptly (signaling server notification). */
export interface UserDisconnectedPayload {
	uid: string;
}
