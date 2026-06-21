const LOG_PREFIX = "[WebRTC ICE]";

export function summarizeIceCandidate(candidate: RTCIceCandidateInit): Record<string, unknown> {
	if (!candidate.candidate) {
		return { endOfCandidates: true };
	}

	try {
		const parsed = new RTCIceCandidate(candidate);
		return {
			type: parsed.type,
			protocol: parsed.protocol,
			address: parsed.address,
			port: parsed.port,
			tcpType: parsed.tcpType,
			sdpMid: parsed.sdpMid,
			sdpMLineIndex: parsed.sdpMLineIndex,
		};
	} catch {
		return {
			sdpMid: candidate.sdpMid,
			sdpMLineIndex: candidate.sdpMLineIndex,
			candidate: candidate.candidate.slice(0, 120),
		};
	}
}

export function logIce(remoteUid: string, event: string, details?: Record<string, unknown>): void {
	if (details) {
		console.info(LOG_PREFIX, remoteUid, event, details);
		return;
	}
	console.info(LOG_PREFIX, remoteUid, event);
}
