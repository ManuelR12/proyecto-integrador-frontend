import { useCallback, useEffect, useRef, useState } from "react";
import type {
	IncomingAnswerPayload,
	IncomingIceCandidatePayload,
	IncomingOfferPayload,
	SocketParticipant,
	WebRTCAnswerPayload,
	WebRTCIceCandidatePayload,
	WebRTCOfferPayload,
} from "../types/room";

const ICE_SERVERS: RTCConfiguration = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:stun1.l.google.com:19302" },
		{
			urls: "turn:free.expressturn.com:3478",
			username: "000000002097293363",
			credential: "UnAsPsgY1epkClZLtz5kz+fG4pw=",
		},
	],
};

export interface WebRTCEmit {
	sendOffer: (payload: WebRTCOfferPayload) => void;
	sendAnswer: (payload: WebRTCAnswerPayload) => void;
	sendIceCandidate: (payload: WebRTCIceCandidatePayload) => void;
	endCall: (roomId: string) => void;
}

export function useWebRTC(roomId: string | undefined, emit: WebRTCEmit) {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
	const [callActive, setCallActive] = useState(false);
	const [micEnabled, setMicEnabled] = useState(true);
	const [cameraEnabled, setCameraEnabled] = useState(true);
	const [mediaError, setMediaError] = useState<string | null>(null);

	const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
	const localStreamRef = useRef<MediaStream | null>(null);
	const pendingStreamRef = useRef<Promise<MediaStream | null> | null>(null);

	const removeRemoteStream = useCallback((uid: string) => {
		setRemoteStreams((prev) => {
			const next = new Map(prev);
			next.delete(uid);
			return next;
		});
	}, []);

	const closePeer = useCallback(
		(uid: string) => {
			const pc = peerConnections.current.get(uid);
			if (pc) {
				pc.close();
				peerConnections.current.delete(uid);
			}
			removeRemoteStream(uid);
		},
		[removeRemoteStream],
	);

	const createPC = useCallback(
		(targetUid: string): RTCPeerConnection => {
			closePeer(targetUid);

			const pc = new RTCPeerConnection(ICE_SERVERS);

			pc.onicecandidate = ({ candidate }) => {
				if (candidate && roomId) {
					emit.sendIceCandidate({ targetUid, roomId, candidate: candidate.toJSON() });
				}
			};

			pc.ontrack = ({ streams }) => {
				if (streams[0]) {
					setRemoteStreams((prev) => new Map(prev).set(targetUid, streams[0]));
				}
			};

			pc.onconnectionstatechange = () => {
				if (pc.connectionState === "failed" || pc.connectionState === "closed") {
					peerConnections.current.delete(targetUid);
					removeRemoteStream(targetUid);
				}
			};

			peerConnections.current.set(targetUid, pc);
			return pc;
		},
		[closePeer, emit, removeRemoteStream, roomId],
	);

	const getLocalStream = useCallback(async (): Promise<MediaStream | null> => {
		if (localStreamRef.current) return localStreamRef.current;

		if (pendingStreamRef.current) return pendingStreamRef.current;

		pendingStreamRef.current = navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				localStreamRef.current = stream;
				setLocalStream(stream);
				setMediaError(null);
				return stream;
			})
			.catch(() => {
				setMediaError(
					"No se pudo acceder a la cámara o micrófono. Verifica los permisos del navegador.",
				);
				return null;
			})
			.finally(() => {
				pendingStreamRef.current = null;
			});

		return pendingStreamRef.current;
	}, []);

	const startCall = useCallback(
		async (participants: SocketParticipant[]) => {
			if (!roomId || callActive) return;

			const stream = await getLocalStream();
			if (!stream) return;

			setCallActive(true);

			for (const { uid } of participants) {
				const pc = createPC(uid);
				stream.getTracks().forEach((track) => pc.addTrack(track, stream));

				try {
					const offer = await pc.createOffer();
					await pc.setLocalDescription(offer);
					emit.sendOffer({ targetUid: uid, roomId, sdp: offer });
				} catch {
					closePeer(uid);
				}
			}
		},
		[roomId, callActive, getLocalStream, createPC, emit, closePeer],
	);

	const callPeer = useCallback(
		async (uid: string) => {
			if (!callActive || !roomId || peerConnections.current.has(uid)) return;

			const stream = localStreamRef.current;
			if (!stream) return;

			const pc = createPC(uid);
			stream.getTracks().forEach((track) => pc.addTrack(track, stream));

			try {
				const offer = await pc.createOffer();
				await pc.setLocalDescription(offer);
				emit.sendOffer({ targetUid: uid, roomId, sdp: offer });
			} catch {
				closePeer(uid);
			}
		},
		[callActive, roomId, createPC, emit, closePeer],
	);

	const handleIncomingOffer = useCallback(
		async (payload: IncomingOfferPayload) => {
			if (!roomId) return;

			let stream = localStreamRef.current;
			if (!stream) {
				stream = await getLocalStream();
				if (!stream) return;
				setCallActive(true);
			}

			const pc = createPC(payload.fromUid);
			stream.getTracks().forEach((track) => pc.addTrack(track, stream!));

			try {
				await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				emit.sendAnswer({ targetUid: payload.fromUid, roomId, sdp: answer });
			} catch {
				closePeer(payload.fromUid);
			}
		},
		[roomId, getLocalStream, createPC, emit, closePeer],
	);

	const handleIncomingAnswer = useCallback(async (payload: IncomingAnswerPayload) => {
		const pc = peerConnections.current.get(payload.fromUid);
		if (!pc) return;
		try {
			await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
		} catch {
			// safe to ignore - negotiation will retry if needed
		}
	}, []);

	const handleIncomingIceCandidate = useCallback(async (payload: IncomingIceCandidatePayload) => {
		const pc = peerConnections.current.get(payload.fromUid);
		if (!pc) return;
		try {
			await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
		} catch {
			// common during signaling race conditions - safe to ignore
		}
	}, []);

	const handleCallEnded = useCallback(
		(payload: { fromUid: string }) => {
			closePeer(payload.fromUid);
		},
		[closePeer],
	);

	const handleParticipantLeft = useCallback(
		(uid: string) => {
			closePeer(uid);
		},
		[closePeer],
	);

	const endCall = useCallback(() => {
		if (roomId) emit.endCall(roomId);

		for (const [, pc] of peerConnections.current) pc.close();
		peerConnections.current.clear();
		setRemoteStreams(new Map());

		localStreamRef.current?.getTracks().forEach((t) => t.stop());
		localStreamRef.current = null;
		setLocalStream(null);
		setCallActive(false);
		setMicEnabled(true);
		setCameraEnabled(true);
	}, [roomId, emit]);

	const toggleMic = useCallback(() => {
		if (!localStreamRef.current) return;
		const next = !micEnabled;
		localStreamRef.current.getAudioTracks().forEach((t) => {
			t.enabled = next;
		});
		setMicEnabled(next);
	}, [micEnabled]);

	const toggleCamera = useCallback(() => {
		if (!localStreamRef.current) return;
		const next = !cameraEnabled;
		localStreamRef.current.getVideoTracks().forEach((t) => {
			t.enabled = next;
		});
		setCameraEnabled(next);
	}, [cameraEnabled]);

	useEffect(() => {
		const pcs = peerConnections.current;
		const streamRef = localStreamRef;
		return () => {
			for (const [, pc] of pcs) pc.close();
			pcs.clear();
			streamRef.current?.getTracks().forEach((t) => t.stop());
		};
	}, []);

	return {
		localStream,
		remoteStreams,
		callActive,
		micEnabled,
		cameraEnabled,
		mediaError,
		startCall,
		callPeer,
		endCall,
		toggleMic,
		toggleCamera,
		handleIncomingOffer,
		handleIncomingAnswer,
		handleIncomingIceCandidate,
		handleCallEnded,
		handleParticipantLeft,
	};
}
