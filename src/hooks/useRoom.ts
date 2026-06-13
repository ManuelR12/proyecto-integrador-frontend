import { useCallback, useEffect, useState } from "react";
import { fetchRoomById } from "../services/roomFirestoreService";
import type { Room } from "../types/room";

export function useRoom(roomId: string | undefined, userId: string | undefined) {
	const [room, setRoom] = useState<Room | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const reload = useCallback(async () => {
		if (!roomId) return;

		setLoading(true);
		setError(null);

		try {
			const nextRoom = await fetchRoomById(roomId);
			if (!nextRoom) {
				setRoom(null);
				setError("ROOM_NOT_FOUND");
				return;
			}
			setRoom(nextRoom);
		} catch {
			setRoom(null);
			setError("LOAD_FAILED");
		} finally {
			setLoading(false);
		}
	}, [roomId]);

	useEffect(() => {
		if (!roomId) return;

		let active = true;

		const run = async () => {
			setLoading(true);
			setError(null);

			try {
				const nextRoom = await fetchRoomById(roomId);
				if (!active) return;

				if (!nextRoom) {
					setRoom(null);
					setError("ROOM_NOT_FOUND");
					return;
				}
				setRoom(nextRoom);
			} catch {
				if (!active) return;
				setRoom(null);
				setError("LOAD_FAILED");
			} finally {
				if (active) setLoading(false);
			}
		};

		void run();

		return () => {
			active = false;
		};
	}, [roomId]);

	const isAdmin = Boolean(room && userId && room.ownerId === userId);

	return {
		room,
		loading,
		error,
		isAdmin,
		setRoom,
		reload,
	};
}
