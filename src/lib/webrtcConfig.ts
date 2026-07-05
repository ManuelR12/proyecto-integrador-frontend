function buildIceServers(): RTCIceServer[] {
	const servers: RTCIceServer[] = [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:stun1.l.google.com:19302" },
	];

	const turnHost = import.meta.env.VITE_TURN_HOST;
	const username = import.meta.env.VITE_TURN_USERNAME;
	const credential = import.meta.env.VITE_TURN_CREDENTIAL;

	if (turnHost && username && credential) {
		servers.push(
			{ urls: "stun:stun.relay.metered.ca:80" },
			{ urls: `turn:${turnHost}:80`, username, credential },
			{ urls: `turn:${turnHost}:80?transport=tcp`, username, credential },
			{ urls: `turn:${turnHost}:443`, username, credential },
			{ urls: `turns:${turnHost}:443?transport=tcp`, username, credential },
		);
	}

	return servers;
}

/** STUN + optional TURN (Metered) for ICE in peer-to-peer room sessions. */
export const WEBRTC_ICE_SERVERS: RTCConfiguration = {
	iceServers: buildIceServers(),
};
