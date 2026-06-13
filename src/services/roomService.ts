import { isAxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { authHeaders, getIdToken } from "../lib/authToken";
import type { ApiRoomDocument, ChatMessage, Room } from "../types/room";

function parseCreatedAt(value: ApiRoomDocument["created_at"]): Date | null {
	if (!value) return null;

	if (typeof value === "string") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	const seconds = value.seconds ?? value._seconds;
	if (typeof seconds === "number") {
		return new Date(seconds * 1000);
	}

	return null;
}

function normalizeApiRoom(doc: ApiRoomDocument): Room {
	const memberIds = Array.isArray(doc.members)
		? doc.members.filter((member): member is string => typeof member === "string")
		: [];

	return {
		id: doc.id,
		title: doc.name,
		ownerId: doc.created_by,
		memberIds,
		participants: [],
		isLive: false,
		createdAt: parseCreatedAt(doc.created_at),
	};
}

function mapRoomApiError(error: unknown): Error {
	if (!isAxiosError(error)) return new Error("UNKNOWN_ERROR");

	const status = error.response?.status;
	if (!error.response) return new Error("NETWORK_ERROR");
	if (status === 400) return new Error("VALIDATION_ERROR");
	if (status === 401) return new Error("UNAUTHENTICATED");
	if (status === 403) return new Error("FORBIDDEN");
	if (status === 404) return new Error("ROOM_NOT_FOUND");
	return new Error("UNKNOWN_ERROR");
}

/**
 * Creates a room via POST /rooms.
 *
 * @throws `Error('UNAUTHENTICATED')`
 * @throws `Error('VALIDATION_ERROR')`
 * @throws `Error('NETWORK_ERROR')`
 */
export async function createRoom(name: string): Promise<Room> {
	const token = await getIdToken();

	try {
		const { data } = await apiClient.post<ApiRoomDocument>(
			"/rooms",
			{ name: name.trim() },
			{ headers: authHeaders(token) },
		);
		return normalizeApiRoom(data);
	} catch (error: unknown) {
		throw mapRoomApiError(error);
	}
}

/**
 * Lists rooms owned by the authenticated user via GET /rooms.
 *
 * @throws `Error('UNAUTHENTICATED')`
 * @throws `Error('NETWORK_ERROR')`
 */
export async function fetchOwnedRooms(): Promise<Room[]> {
	const token = await getIdToken();

	try {
		const { data } = await apiClient.get<ApiRoomDocument[]>("/rooms", {
			headers: authHeaders(token),
		});
		return data.map(normalizeApiRoom);
	} catch (error: unknown) {
		throw mapRoomApiError(error);
	}
}

/**
 * Fetches chat history for a room via GET /rooms/:roomId/messages.
 *
 * @throws `Error('UNAUTHENTICATED')`
 * @throws `Error('NETWORK_ERROR')`
 */
export async function fetchRoomMessages(roomId: string): Promise<ChatMessage[]> {
	const token = await getIdToken();

	try {
		const { data } = await apiClient.get<ChatMessage[]>(`/rooms/${roomId}/messages`, {
			headers: authHeaders(token),
		});
		return data;
	} catch (error: unknown) {
		throw mapRoomApiError(error);
	}
}

/**
 * Renames a room via PATCH /rooms/:roomId.
 *
 * @throws `Error('UNAUTHENTICATED')`
 * @throws `Error('VALIDATION_ERROR')`
 * @throws `Error('FORBIDDEN')`
 * @throws `Error('ROOM_NOT_FOUND')`
 * @throws `Error('NETWORK_ERROR')`
 */
export async function updateRoomName(
	roomId: string,
	name: string,
): Promise<{ id: string; name: string }> {
	const token = await getIdToken();

	try {
		const { data } = await apiClient.patch<{ id: string; name: string }>(
			`/rooms/${roomId}`,
			{ name: name.trim() },
			{ headers: authHeaders(token) },
		);
		return data;
	} catch (error: unknown) {
		throw mapRoomApiError(error);
	}
}

/**
 * Deletes a room via DELETE /rooms/:roomId.
 *
 * @throws `Error('UNAUTHENTICATED')`
 * @throws `Error('FORBIDDEN')`
 * @throws `Error('ROOM_NOT_FOUND')`
 * @throws `Error('NETWORK_ERROR')`
 */
export async function deleteRoom(roomId: string): Promise<void> {
	const token = await getIdToken();

	try {
		await apiClient.delete(`/rooms/${roomId}`, {
			headers: authHeaders(token),
		});
	} catch (error: unknown) {
		throw mapRoomApiError(error);
	}
}
