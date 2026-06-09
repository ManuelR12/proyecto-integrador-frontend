import {
	collection,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
	type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { FirestoreRoomDocument, Room, RoomParticipant } from "../types/room";

const ROOMS_COLLECTION = "rooms";
const CODE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateRoomCode(): string {
	const segment = (length: number) =>
		Array.from({ length }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(
			"",
		);

	return `agl-${segment(3)}-${segment(3)}`;
}

function toInitials(displayName: string): string {
	return displayName
		.split(" ")
		.filter(Boolean)
		.map((word) => word[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function normalizeRoom(id: string, data: DocumentData): Room {
	const doc = data as FirestoreRoomDocument;

	return {
		id,
		title: doc.title,
		code: doc.code ?? id,
		ownerId: doc.ownerId,
		memberIds: doc.memberIds ?? [],
		participants: doc.participants ?? [],
		isLive: doc.isLive ?? false,
		createdAt: doc.createdAt?.toDate?.() ?? null,
	};
}

function buildParticipant(uid: string, displayName: string): RoomParticipant {
	return {
		uid,
		displayName,
		initials: toInitials(displayName),
	};
}

export async function isRoomCodeAvailable(code: string): Promise<boolean> {
	const snap = await getDoc(doc(db, ROOMS_COLLECTION, code));
	return !snap.exists();
}

export async function generateUniqueRoomCode(maxAttempts = 8): Promise<string> {
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		const code = generateRoomCode();
		if (await isRoomCodeAvailable(code)) return code;
	}

	throw new Error("CODE_GENERATION_FAILED");
}

/**
 * Creates a room document keyed by its public invite code.
 *
 * @throws `Error('CODE_COLLISION')`
 */
export async function createRoom(
	code: string,
	title: string,
	owner: { uid: string; displayName: string },
): Promise<string> {
	const normalizedCode = code.trim().toLowerCase();
	const roomRef = doc(db, ROOMS_COLLECTION, normalizedCode);
	const existing = await getDoc(roomRef);
	if (existing.exists()) throw new Error("CODE_COLLISION");

	const ownerParticipant = buildParticipant(owner.uid, owner.displayName);

	await setDoc(roomRef, {
		title: title.trim(),
		code: normalizedCode,
		ownerId: owner.uid,
		memberIds: [owner.uid],
		participants: [ownerParticipant],
		isLive: false,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});

	return normalizedCode;
}

/**
 * Adds the current user to an existing room if they are not already a member.
 *
 * @throws `Error('ROOM_NOT_FOUND')`
 */
export async function joinRoom(
	code: string,
	user: { uid: string; displayName: string },
): Promise<string> {
	const normalizedCode = code.trim().toLowerCase();
	const roomRef = doc(db, ROOMS_COLLECTION, normalizedCode);
	const snap = await getDoc(roomRef);
	if (!snap.exists()) throw new Error("ROOM_NOT_FOUND");

	const data = snap.data() as FirestoreRoomDocument;
	const memberIds = data.memberIds ?? [];

	if (!memberIds.includes(user.uid)) {
		const participants = data.participants ?? [];
		await updateDoc(roomRef, {
			memberIds: [...memberIds, user.uid],
			participants: [...participants, buildParticipant(user.uid, user.displayName)],
			updatedAt: serverTimestamp(),
		});
	}

	return normalizedCode;
}

export async function fetchOwnedRooms(ownerId: string): Promise<Room[]> {
	const roomsQuery = query(collection(db, ROOMS_COLLECTION), where("ownerId", "==", ownerId));
	const snapshot = await getDocs(roomsQuery);

	return snapshot.docs
		.map((roomDoc) => normalizeRoom(roomDoc.id, roomDoc.data()))
		.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

export function subscribeOwnedRooms(
	ownerId: string,
	onData: (rooms: Room[]) => void,
	onError: (message: string) => void,
): () => void {
	const roomsQuery = query(collection(db, ROOMS_COLLECTION), where("ownerId", "==", ownerId));

	return onSnapshot(
		roomsQuery,
		(snapshot) => {
			const rooms = snapshot.docs
				.map((roomDoc) => normalizeRoom(roomDoc.id, roomDoc.data()))
				.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
			onData(rooms);
		},
		(error) => onError(error.message),
	);
}
