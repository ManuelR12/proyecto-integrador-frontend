import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Room } from "../types/room";

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
export async function fetchRoomById(roomId: string): Promise<Room | null> {
	const trimmedId = roomId.trim();
	if (!trimmedId) return null;

	const snap = await getDoc(doc(db, "rooms", trimmedId));
	if (!snap.exists()) return null;

	return normalizeFirestoreRoom(snap.id, snap.data() as Record<string, unknown>);
}
