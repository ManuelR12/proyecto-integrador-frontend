/** Public STUN servers used for ICE discovery in peer-to-peer sessions. */
export const WEBRTC_ICE_SERVERS: RTCConfiguration = {
	iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
};
