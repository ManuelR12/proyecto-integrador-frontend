import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	limit,
	query,
	updateDoc,
	writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Room } from "../types/room";

const DELETE_BATCH_SIZE = 500;

export class RoomNotFoundError extends Error {
	constructor() {
		super("ROOM_NOT_FOUND");
		this.name = "RoomNotFoundError";
	}
}

export class RoomForbiddenError extends Error {
	constructor() {
		super("FORBIDDEN");
		this.name = "RoomForbiddenError";
	}
}

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
 * Used for join validation and room page loading (FE-09).
 */
export async function fetchRoomById(roomId: string): Promise<Room | null> {
	const trimmedId = roomId.trim();
	if (!trimmedId) return null;

	const snap = await getDoc(doc(db, "rooms", trimmedId));
	if (!snap.exists()) return null;

	return normalizeFirestoreRoom(snap.id, snap.data() as Record<string, unknown>);
}

/**
 * Renames a room if the caller is the creator.
 */
export async function updateRoomName(roomId: string, uid: string, name: string): Promise<void> {
	const trimmedName = name.trim();
	if (!trimmedName) throw new Error("VALIDATION_ERROR");

	const ref = doc(db, "rooms", roomId);
	const snap = await getDoc(ref);
	if (!snap.exists()) throw new RoomNotFoundError();

	const createdBy = snap.data()?.created_by;
	if (createdBy !== uid) throw new RoomForbiddenError();

	await updateDoc(ref, { name: trimmedName });
}

/**
 * Deletes a room and its messages if the caller is the creator.
 */
export async function deleteRoomDocument(roomId: string, uid: string): Promise<void> {
	const ref = doc(db, "rooms", roomId);
	const snap = await getDoc(ref);
	if (!snap.exists()) throw new RoomNotFoundError();

	const createdBy = snap.data()?.created_by;
	if (createdBy !== uid) throw new RoomForbiddenError();

	const messagesRef = collection(db, "rooms", roomId, "messages");
	let chunk = await getDocs(query(messagesRef, limit(DELETE_BATCH_SIZE)));

	while (!chunk.empty) {
		const batch = writeBatch(db);
		chunk.docs.forEach((messageDoc) => batch.delete(messageDoc.ref));
		await batch.commit();
		chunk = await getDocs(query(messagesRef, limit(DELETE_BATCH_SIZE)));
	}

	await deleteDoc(ref);
}
