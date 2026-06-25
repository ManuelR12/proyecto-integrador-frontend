import { io, type Socket } from "socket.io-client";
import { getIdToken } from "../lib/authToken";
import { logIce, summarizeIceCandidate } from "../lib/webrtcIceLogger";
import type { ChatMessage, SocketParticipant } from "../types/room";
import type {
	CallEndedPayload,
	IncomingAnswerPayload,
	IncomingIceCandidatePayload,
	IncomingOfferPayload,
	PeerMediaStateChangedPayload,
	PeerMediaToggledPayload,
	PeerScreenShareChangedPayload,
	ScreenShareDeniedPayload,
	UserDisconnectedPayload,
} from "../types/webrtc";

function socketBaseUrl(): string {
	return import.meta.env.VITE_API_BASE_URL ?? "";
}

export interface RoomJoinedPayload {
	roomId: string;
	isAdmin: boolean;
	participants: SocketParticipant[];
	activeScreenShareUid?: string | null;
}

export interface RoomSocketHandlers {
	onRoomJoined: (payload: RoomJoinedPayload) => void;
	onDisconnect: () => void;
	onMessage?: (message: ChatMessage) => void;
	onError: (message: string) => void;
	onParticipantJoined?: (participant: SocketParticipant) => void;
	onParticipantLeft?: (participant: SocketParticipant) => void;
	onUserDisconnected?: (payload: UserDisconnectedPayload) => void;
	onIncomingOffer?: (payload: IncomingOfferPayload) => void;
	onIncomingAnswer?: (payload: IncomingAnswerPayload) => void;
	onIncomingIceCandidate?: (payload: IncomingIceCandidatePayload) => void;
	onCallEnded?: (payload: CallEndedPayload) => void;
	onPeerMediaStateChanged?: (payload: PeerMediaStateChangedPayload) => void;
	/** @deprecated Fallback while older servers still emit peer_media_toggled. */
	onPeerMediaToggled?: (payload: PeerMediaToggledPayload) => void;
	onPeerScreenShareChanged?: (payload: PeerScreenShareChangedPayload) => void;
	onScreenShareDenied?: (payload: ScreenShareDeniedPayload) => void;
}

export interface RoomSocketController {
	sendMessage: (text: string) => void;
	sendWebRtcOffer: (targetUid: string, sdp: RTCSessionDescriptionInit) => void;
	sendWebRtcAnswer: (targetUid: string, sdp: RTCSessionDescriptionInit) => void;
	sendWebRtcIceCandidate: (targetUid: string, candidate: RTCIceCandidateInit) => void;
	sendMediaStateChanged: (isMuted: boolean, isVideoOff: boolean) => void;
	sendScreenShareStarted: () => void;
	sendScreenShareStopped: () => void;
	endCall: () => void;
	disconnect: () => void;
}

function toSocketParticipant(payload: {
	uid: string;
	username: string;
	avatarUrl?: string | null;
	socketId?: string | null;
}): SocketParticipant {
	return {
		uid: payload.uid,
		username: payload.username,
		avatarUrl: payload.avatarUrl ?? null,
		socketId: payload.socketId ?? null,
	};
}

function isPeerMediaStateChangedPayload(payload: unknown): payload is PeerMediaStateChangedPayload {
	if (!payload || typeof payload !== "object") return false;
	const entry = payload as PeerMediaStateChangedPayload;
	return (
		typeof entry.room_id === "string" &&
		typeof entry.uid === "string" &&
		typeof entry.socket_id === "string" &&
		typeof entry.isMuted === "boolean" &&
		typeof entry.isVideoOff === "boolean"
	);
}

/**
 * Opens a persistent Socket.io connection for a study room.
 * Waits for the server `room_joined` ack before reporting a live connection.
 */
export function createRoomSocket(
	roomId: string,
	handlers: RoomSocketHandlers,
): RoomSocketController {
	let socket: Socket | null = null;
	let active = true;

	void getIdToken()
		.then((token) => {
			if (!active) return;

			const baseUrl = socketBaseUrl();
			if (!baseUrl) {
				handlers.onError("Missing API base URL");
				handlers.onDisconnect();
				return;
			}

			socket = io(baseUrl, {
				auth: { token },
				transports: ["websocket", "polling"],
				reconnection: true,
			});

			socket.on("connect", () => {
				socket?.emit("join_room", roomId);
			});

			socket.on("room_joined", (payload: RoomJoinedPayload) => {
				if (payload.roomId === roomId) {
					handlers.onRoomJoined(payload);
				}
			});

			socket.on("disconnect", () => {
				handlers.onDisconnect();
			});

			socket.on("connect_error", (err: Error) => {
				handlers.onError(err.message || "Connection failed");
				handlers.onDisconnect();
			});

			socket.on("error", (payload: { message?: string }) => {
				handlers.onError(payload?.message ?? "Socket error");
				handlers.onDisconnect();
			});

			socket.on("receive_message", (message: ChatMessage) => {
				handlers.onMessage?.(message);
			});

			socket.on(
				"participant_joined",
				(payload: {
					uid: string;
					username: string;
					avatarUrl?: string | null;
					socketId?: string | null;
				}) => {
					handlers.onParticipantJoined?.(toSocketParticipant(payload));
				},
			);

			socket.on(
				"participant_left",
				(payload: { uid: string; username: string; avatarUrl?: string | null }) => {
					handlers.onParticipantLeft?.(toSocketParticipant(payload));
				},
			);

			const relayUserDisconnected = (payload: UserDisconnectedPayload) => {
				handlers.onUserDisconnected?.(payload);
			};

			socket.on("user-disconnected", relayUserDisconnected);
			socket.on("user_disconnected", relayUserDisconnected);

			socket.on("incoming_offer", (payload: IncomingOfferPayload) => {
				if (payload.roomId === roomId) {
					handlers.onIncomingOffer?.(payload);
				}
			});

			socket.on("incoming_answer", (payload: IncomingAnswerPayload) => {
				if (payload.roomId === roomId) {
					handlers.onIncomingAnswer?.(payload);
				}
			});

			socket.on("incoming_ice_candidate", (payload: IncomingIceCandidatePayload) => {
				if (payload.roomId === undefined || payload.roomId === roomId) {
					logIce(
						payload.fromUid,
						"signaling candidate received",
						summarizeIceCandidate(payload.candidate),
					);
					handlers.onIncomingIceCandidate?.(payload);
				}
			});

			socket.on("call_ended", (payload: CallEndedPayload) => {
				handlers.onCallEnded?.(payload);
			});

			socket.on("peer_media_state_changed", (payload: unknown) => {
				if (!isPeerMediaStateChangedPayload(payload)) return;
				if (payload.room_id !== roomId) return;
				handlers.onPeerMediaStateChanged?.(payload);
			});

			socket.on("peer_media_toggled", (payload: PeerMediaToggledPayload) => {
				if (typeof payload.uid !== "string") return;
				if (typeof payload.mic !== "boolean" || typeof payload.camera !== "boolean") return;
				handlers.onPeerMediaToggled?.(payload);
			});

			socket.on("peer_screen_share_changed", (payload: PeerScreenShareChangedPayload) => {
				if (payload.room_id === roomId) {
					handlers.onPeerScreenShareChanged?.(payload);
				}
			});

			socket.on("screen_share_denied", (payload: ScreenShareDeniedPayload) => {
				if (payload.room_id === roomId) {
					handlers.onScreenShareDenied?.(payload);
				}
			});
		})
		.catch(() => {
			handlers.onError("Authentication failed");
			handlers.onDisconnect();
		});

	return {
		sendMessage(text: string) {
			const trimmed = text.trim();
			if (!trimmed || !socket?.connected) return;
			socket.emit("send_message", { room_id: roomId, text: trimmed });
		},
		sendWebRtcOffer(targetUid: string, sdp: RTCSessionDescriptionInit) {
			if (!socket?.connected) return;
			socket.emit("webrtc_offer", { targetUid, roomId, sdp });
		},
		sendWebRtcAnswer(targetUid: string, sdp: RTCSessionDescriptionInit) {
			if (!socket?.connected) return;
			socket.emit("webrtc_answer", { targetUid, roomId, sdp });
		},
		sendWebRtcIceCandidate(targetUid: string, candidate: RTCIceCandidateInit) {
			if (!socket?.connected) return;
			logIce(targetUid, "signaling candidate sent", summarizeIceCandidate(candidate));
			socket.emit("webrtc_ice_candidate", { targetUid, roomId, candidate });
		},
		sendMediaStateChanged(isMuted: boolean, isVideoOff: boolean) {
			if (!socket?.connected) return;
			socket.emit("media_state_changed", { room_id: roomId, isMuted, isVideoOff });
		},
		sendScreenShareStarted() {
			if (!socket?.connected) return;
			socket.emit("screen_share_started", { room_id: roomId });
		},
		sendScreenShareStopped() {
			if (!socket?.connected) return;
			socket.emit("screen_share_stopped", { room_id: roomId });
		},
		endCall() {
			if (!socket?.connected) return;
			socket.emit("end_call", { roomId });
		},
		disconnect() {
			active = false;
			if (socket?.connected) {
				socket.emit("leave_room", roomId);
			}
			socket?.disconnect();
			socket = null;
		},
	};
}
