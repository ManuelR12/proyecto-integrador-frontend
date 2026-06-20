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

export interface RemotePeerMediaState {
	micEnabled: boolean;
	cameraEnabled: boolean;
}

export function useWebRTC(roomId: string | undefined, emit: WebRTCEmit) {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
	const [remoteMediaStates, setRemoteMediaStates] = useState<Map<string, RemotePeerMediaState>>(
		new Map(),
	);
	const [callActive, setCallActive] = useState(false);
	const [micEnabled, setMicEnabled] = useState(false);
	const [cameraEnabled, setCameraEnabled] = useState(false);
	const [mediaError, setMediaError] = useState<string | null>(null);

	const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
	const dataChannels = useRef<Map<string, RTCDataChannel>>(new Map());
	// ICE candidates that arrive before the PC exists are buffered here
	const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
	const localStreamRef = useRef<MediaStream | null>(null);
	const pendingStreamRef = useRef<Promise<MediaStream | null> | null>(null);
	// Refs mirror state so callbacks created once can read latest values
	const micEnabledRef = useRef(false);
	const cameraEnabledRef = useRef(false);

	const removeRemoteStream = useCallback((uid: string) => {
		setRemoteStreams((prev) => {
			const next = new Map(prev);
			next.delete(uid);
			return next;
		});
	}, []);

	// Wire a data channel (offerer-created or answerer-received) to state updates
	const setupDataChannel = useCallback((uid: string, dc: RTCDataChannel) => {
		dataChannels.current.set(uid, dc);

		dc.onopen = () => {
			try {
				dc.send(
					JSON.stringify({
						micEnabled: micEnabledRef.current,
						cameraEnabled: cameraEnabledRef.current,
					}),
				);
			} catch {
				// channel may close before send completes
			}
		};

		dc.onmessage = ({ data }) => {
			try {
				const state = JSON.parse(data as string) as RemotePeerMediaState;
				setRemoteMediaStates((prev) => new Map(prev).set(uid, state));
			} catch {
				// ignore malformed message
			}
		};
	}, []);

	const closePeer = useCallback(
		(uid: string) => {
			const pc = peerConnections.current.get(uid);
			if (pc) {
				pc.close();
				peerConnections.current.delete(uid);
			}
			const dc = dataChannels.current.get(uid);
			if (dc) {
				try {
					dc.close();
				} catch {
					// ignore
				}
				dataChannels.current.delete(uid);
			}
			pendingCandidates.current.delete(uid);
			setRemoteMediaStates((prev) => {
				const next = new Map(prev);
				next.delete(uid);
				return next;
			});
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

			// Answerer receives the offerer's data channel here
			pc.ondatachannel = ({ channel }) => {
				setupDataChannel(targetUid, channel);
			};

			peerConnections.current.set(targetUid, pc);
			return pc;
		},
		[closePeer, emit, removeRemoteStream, roomId, setupDataChannel],
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

	const applyMutedState = (stream: MediaStream) => {
		stream.getAudioTracks().forEach((t) => {
			t.enabled = false;
		});
		stream.getVideoTracks().forEach((t) => {
			t.enabled = false;
		});
		micEnabledRef.current = false;
		cameraEnabledRef.current = false;
		setMicEnabled(false);
		setCameraEnabled(false);
	};

	const broadcastMediaState = useCallback((mic: boolean, cam: boolean) => {
		const msg = JSON.stringify({ micEnabled: mic, cameraEnabled: cam });
		for (const [, dc] of dataChannels.current) {
			if (dc.readyState === "open") {
				try {
					dc.send(msg);
				} catch {
					// ignore
				}
			}
		}
	}, []);

	// Called on room_joined. New joiner offers to everyone already present.
	// Existing peers answer — they do NOT send back an offer — preventing glare.
	const startCallMuted = useCallback(
		async (participants: SocketParticipant[]) => {
			if (!roomId || callActive) return;

			const stream = await getLocalStream();
			if (!stream) return;

			applyMutedState(stream);
			setCallActive(true);

			for (const { uid } of participants) {
				const pc = createPC(uid);
				stream.getTracks().forEach((track) => pc.addTrack(track, stream));

				// Data channel must be created before createOffer so it's included in the SDP
				const dc = pc.createDataChannel("media-state", { ordered: true });
				setupDataChannel(uid, dc);

				try {
					const offer = await pc.createOffer();
					await pc.setLocalDescription(offer);
					emit.sendOffer({ targetUid: uid, roomId, sdp: offer });
				} catch {
					closePeer(uid);
				}
			}
		},
		[roomId, callActive, getLocalStream, createPC, setupDataChannel, emit, closePeer],
	);

	const flushCandidates = useCallback(async (uid: string, pc: RTCPeerConnection) => {
		const buffered = pendingCandidates.current.get(uid);
		if (!buffered?.length) return;
		pendingCandidates.current.delete(uid);
		for (const candidate of buffered) {
			try {
				await pc.addIceCandidate(new RTCIceCandidate(candidate));
			} catch {
				// ignore stale candidates
			}
		}
	}, []);

	const handleIncomingOffer = useCallback(
		async (payload: IncomingOfferPayload) => {
			if (!roomId) return;

			let stream = localStreamRef.current;
			if (!stream) {
				stream = await getLocalStream();
				if (!stream) return;
				applyMutedState(stream);
				setCallActive(true);
			}

			// createPC wires ondatachannel — answerer receives the data channel automatically
			const pc = createPC(payload.fromUid);
			stream.getTracks().forEach((track) => pc.addTrack(track, stream!));

			try {
				await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
				// Flush any ICE candidates that arrived before this PC was ready
				await flushCandidates(payload.fromUid, pc);
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				emit.sendAnswer({ targetUid: payload.fromUid, roomId, sdp: answer });
			} catch {
				closePeer(payload.fromUid);
			}
		},
		[roomId, getLocalStream, createPC, flushCandidates, emit, closePeer],
	);

	const handleIncomingAnswer = useCallback(
		async (payload: IncomingAnswerPayload) => {
			const pc = peerConnections.current.get(payload.fromUid);
			if (!pc) return;
			try {
				await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
				// Flush any ICE candidates that arrived before the answer was processed
				await flushCandidates(payload.fromUid, pc);
			} catch {
				// safe to ignore
			}
		},
		[flushCandidates],
	);

	const handleIncomingIceCandidate = useCallback(async (payload: IncomingIceCandidatePayload) => {
		const pc = peerConnections.current.get(payload.fromUid);
		if (!pc) {
			// PC not created yet — buffer until offer/answer processing creates it
			const buf = pendingCandidates.current.get(payload.fromUid) ?? [];
			buf.push(payload.candidate);
			pendingCandidates.current.set(payload.fromUid, buf);
			return;
		}
		try {
			await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
		} catch {
			// ignore stale candidates during renegotiation
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

		for (const [, dc] of dataChannels.current) {
			try {
				dc.close();
			} catch {
				// ignore
			}
		}
		dataChannels.current.clear();
		pendingCandidates.current.clear();

		setRemoteStreams(new Map());
		setRemoteMediaStates(new Map());

		localStreamRef.current?.getTracks().forEach((t) => t.stop());
		localStreamRef.current = null;
		setLocalStream(null);
		setCallActive(false);
		micEnabledRef.current = false;
		cameraEnabledRef.current = false;
		setMicEnabled(false);
		setCameraEnabled(false);
	}, [roomId, emit]);

	const toggleMic = useCallback(() => {
		if (!localStreamRef.current) return;
		const next = !micEnabled;
		localStreamRef.current.getAudioTracks().forEach((t) => {
			t.enabled = next;
		});
		micEnabledRef.current = next;
		setMicEnabled(next);
		broadcastMediaState(next, cameraEnabledRef.current);
	}, [micEnabled, broadcastMediaState]);

	const toggleCamera = useCallback(() => {
		if (!localStreamRef.current) return;
		const next = !cameraEnabled;
		localStreamRef.current.getVideoTracks().forEach((t) => {
			t.enabled = next;
		});
		cameraEnabledRef.current = next;
		setCameraEnabled(next);
		broadcastMediaState(micEnabledRef.current, next);
	}, [cameraEnabled, broadcastMediaState]);

	useEffect(() => {
		const pcs = peerConnections.current;
		const dcs = dataChannels.current;
		const pending = pendingCandidates.current;
		const streamRef = localStreamRef;
		return () => {
			for (const [, pc] of pcs) pc.close();
			pcs.clear();
			for (const [, dc] of dcs) {
				try {
					dc.close();
				} catch {
					// ignore
				}
			}
			dcs.clear();
			pending.clear();
			streamRef.current?.getTracks().forEach((t) => t.stop());
		};
	}, []);

	return {
		localStream,
		remoteStreams,
		remoteMediaStates,
		callActive,
		micEnabled,
		cameraEnabled,
		mediaError,
		startCallMuted,
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
