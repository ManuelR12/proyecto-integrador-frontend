import { io, type Socket } from "socket.io-client";
import { getIdToken } from "../lib/authToken";
import type {
	ChatMessage,
	IncomingAnswerPayload,
	IncomingIceCandidatePayload,
	IncomingOfferPayload,
	SocketParticipant,
	WebRTCAnswerPayload,
	WebRTCIceCandidatePayload,
	WebRTCOfferPayload,
	WebRTCSocketHandlers,
} from "../types/room";

function socketBaseUrl(): string {
	return import.meta.env.VITE_API_BASE_URL ?? "";
}

export interface RoomJoinedPayload {
	roomId: string;
	isAdmin: boolean;
	participants: SocketParticipant[];
}

export interface RoomSocketHandlers {
	onRoomJoined: (payload: RoomJoinedPayload) => void;
	onDisconnect: () => void;
	onMessage?: (message: ChatMessage) => void;
	onError: (message: string) => void;
	onParticipantJoined?: (participant: SocketParticipant) => void;
	onParticipantLeft?: (participant: SocketParticipant) => void;
}

export interface RoomSocketController {
	sendMessage: (text: string) => void;
	sendOffer: (payload: WebRTCOfferPayload) => void;
	sendAnswer: (payload: WebRTCAnswerPayload) => void;
	sendIceCandidate: (payload: WebRTCIceCandidatePayload) => void;
	endCall: (roomId: string) => void;
	toggleMedia: (mic: boolean, camera: boolean) => void;
	disconnect: () => void;
}

/**
 * Opens a persistent Socket.io connection for a study room.
 * Waits for the server `room_joined` ack before reporting a live connection.
 */
export function createRoomSocket(
	roomId: string,
	handlers: RoomSocketHandlers,
	webrtcRef?: { current: WebRTCSocketHandlers | null },
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
					webrtcRef?.current?.onRoomJoined?.(payload.participants ?? []);
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

			socket.on("participant_joined", (p: SocketParticipant) => {
				handlers.onParticipantJoined?.(p);
			});

			socket.on("participant_left", (p: SocketParticipant) => {
				handlers.onParticipantLeft?.(p);
				webrtcRef?.current?.onParticipantLeftCall?.(p.uid);
			});

			socket.on("incoming_offer", (payload: IncomingOfferPayload) => {
				webrtcRef?.current?.onIncomingOffer?.(payload);
			});

			socket.on("incoming_answer", (payload: IncomingAnswerPayload) => {
				webrtcRef?.current?.onIncomingAnswer?.(payload);
			});

			socket.on("incoming_ice_candidate", (payload: IncomingIceCandidatePayload) => {
				webrtcRef?.current?.onIncomingIceCandidate?.(payload);
			});

			socket.on("call_ended", (payload: { fromUid: string }) => {
				webrtcRef?.current?.onCallEnded?.(payload);
			});

			socket.on(
				"peer_media_toggled",
				({ uid, mic, camera }: { uid: string; mic: boolean; camera: boolean }) => {
					webrtcRef?.current?.onPeerMediaToggled?.(uid, mic, camera);
				},
			);
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
		sendOffer(payload: WebRTCOfferPayload) {
			socket?.emit("webrtc_offer", payload);
		},
		sendAnswer(payload: WebRTCAnswerPayload) {
			socket?.emit("webrtc_answer", payload);
		},
		sendIceCandidate(payload: WebRTCIceCandidatePayload) {
			socket?.emit("webrtc_ice_candidate", payload);
		},
		endCall(id: string) {
			socket?.emit("end_call", { roomId: id });
		},
		toggleMedia(mic: boolean, camera: boolean) {
			socket?.emit("toggle_media", { mic, camera });
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
