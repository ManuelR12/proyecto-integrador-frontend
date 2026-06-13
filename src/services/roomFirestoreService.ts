import { collection, doc, getDoc, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { ChatMessage, Room } from "../types/room";

function parseFirestoreTimestamp(value: unknown): Date | null {
	if (!value || typeof value !== "object") return null;

	const ts = value as { seconds?: number; _seconds?: number };
	const seconds = ts.seconds ?? ts._seconds;
	if (typeof seconds !== "number") return null;

	return new Date(seconds * 1000);
}

function normalizeFirestoreRoom(id: string, data: Record<string, unknown>): Room {
	const memberIds = Array.isArray(data.members)
		? data.members.filter((member): member is string => typeof member === "string")
		: [];

	return {
		id,
		title: typeof data.name === "string" ? data.name : "Sala sin nombre",
		ownerId: typeof data.created_by === "string" ? data.created_by : "",
		memberIds,
		participants: [],
		isLive: false,
		createdAt: parseFirestoreTimestamp(data.created_at),
	};
}

/**
 * Reads a room document directly from Firestore.
 * Used for join validation and room page loading.
 */
function parseMessageTimestamp(value: unknown): string | null {
	if (!value) return null;
	if (value instanceof Timestamp) return value.toDate().toISOString();
	if (typeof value === "string") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
	}
	if (typeof value === "object") {
		const ts = value as { seconds?: number; _seconds?: number };
		const seconds = ts.seconds ?? ts._seconds;
		if (typeof seconds === "number") return new Date(seconds * 1000).toISOString();
	}
	return null;
}

function normalizeFirestoreMessage(
	roomId: string,
	id: string,
	data: Record<string, unknown>,
): ChatMessage {
	return {
		id,
		room_id: typeof data.room_id === "string" ? data.room_id : roomId,
		sender_id: typeof data.sender_id === "string" ? data.sender_id : "",
		username: typeof data.username === "string" ? data.username : "",
		text: typeof data.text === "string" ? data.text : "",
		timestamp: parseMessageTimestamp(data.timestamp),
	};
}

/**
 * Subscribes to a room's messages subcollection in real time.
 * Replaces one-off history fetches for live chat updates.
 */
export function subscribeRoomMessages(
	roomId: string,
	onUpdate: (messages: ChatMessage[]) => void,
	onError?: (error: Error) => void,
): () => void {
	const trimmedId = roomId.trim();
	const messagesQuery = query(
		collection(db, "rooms", trimmedId, "messages"),
		orderBy("timestamp", "asc"),
	);

	return onSnapshot(
		messagesQuery,
		(snapshot) => {
			const messages = snapshot.docs.map((docSnap) =>
				normalizeFirestoreMessage(trimmedId, docSnap.id, docSnap.data() as Record<string, unknown>),
			);
			onUpdate(messages);
		},
		(error) => onError?.(error),
	);
}

export async function fetchRoomById(roomId: string): Promise<Room | null> {
	const trimmedId = roomId.trim();
	if (!trimmedId) return null;

	const snap = await getDoc(doc(db, "rooms", trimmedId));
	if (!snap.exists()) return null;

	return normalizeFirestoreRoom(snap.id, snap.data() as Record<string, unknown>);
}
