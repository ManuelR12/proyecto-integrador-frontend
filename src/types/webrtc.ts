/** Payload when a participant ends the call for the room. */
export interface CallEndedPayload {
	fromUid: string;
}

/** Payload when a participant disconnects unexpectedly. */
export interface UserDisconnectedPayload {
	uid: string;
}
