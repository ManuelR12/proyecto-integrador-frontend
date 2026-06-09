import { io, type Socket } from "socket.io-client";
import { getIdToken } from "../lib/authToken";

const JOIN_ACK_MS = 2_000;

function socketBaseUrl(): string {
	return import.meta.env.VITE_API_BASE_URL ?? "";
}

/**
 * Joins a Socket.io room channel before navigating into /sala/:id.
 * Membership is managed over Socket.io — there is no REST join endpoint.
 *
 * @throws `Error('UNAUTHENTICATED')`
 * @throws `Error('ROOM_NOT_FOUND')`
 * @throws `Error('SOCKET_CONNECT_ERROR')`
 * @throws `Error('JOIN_TIMEOUT')`
 */
export function joinRoomViaSocket(roomId: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const baseUrl = socketBaseUrl();
		if (!baseUrl) {
			reject(new Error("SOCKET_URL_MISSING"));
			return;
		}

		let socket: Socket | null = null;
		let settled = false;
		let joinTimeout = 0;
		let ackTimeout = 0;

		const clearTimers = () => {
			window.clearTimeout(joinTimeout);
			window.clearTimeout(ackTimeout);
		};

		const finish = (callback: () => void) => {
			if (settled) return;
			settled = true;
			clearTimers();
			socket?.disconnect();
			callback();
		};

		const handleError = (payload: { message?: string }) => {
			const message = (payload?.message ?? "").toLowerCase();
			if (
				message.includes("not found") ||
				message.includes("no existe") ||
				message.includes("no encontr")
			) {
				finish(() => reject(new Error("ROOM_NOT_FOUND")));
				return;
			}
			finish(() => reject(new Error("JOIN_FAILED")));
		};

		void getIdToken()
			.then((token) => {
				socket = io(baseUrl, {
					auth: { token },
					transports: ["websocket", "polling"],
					reconnection: false,
					timeout: 10_000,
				});

				joinTimeout = window.setTimeout(() => {
					finish(() => reject(new Error("JOIN_TIMEOUT")));
				}, 10_000);

				socket.on("connect_error", () => {
					finish(() => reject(new Error("SOCKET_CONNECT_ERROR")));
				});

				socket.on("error", (payload: { message?: string }) => {
					handleError(payload);
				});

				socket.on("connect", () => {
					socket?.emit("join-room", roomId);

					ackTimeout = window.setTimeout(() => {
						finish(() => resolve());
					}, JOIN_ACK_MS);
				});
			})
			.catch(() => {
				finish(() => reject(new Error("UNAUTHENTICATED")));
			});
	});
}
