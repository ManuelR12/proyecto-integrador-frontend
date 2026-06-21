function buildIceServers(): RTCIceServer[] {
	const servers: RTCIceServer[] = [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:stun1.l.google.com:19302" },
	];

	const turnUrl = import.meta.env.VITE_TURN_URL;
	const username = import.meta.env.VITE_TURN_USERNAME;
	const credential = import.meta.env.VITE_TURN_CREDENTIAL;

	if (turnUrl && username && credential) {
		servers.push({
			urls: [`${turnUrl}?transport=udp`, `${turnUrl}?transport=tcp`],
			username,
			credential,
		});
	}

	return servers;
}

/** STUN + optional TURN (Express TURN) for ICE in peer-to-peer room sessions. */
export const WEBRTC_ICE_SERVERS: RTCConfiguration = {
	iceServers: buildIceServers(),
};
