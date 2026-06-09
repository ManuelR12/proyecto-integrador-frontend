import { useEffect, useState } from "react";
import { subscribeOwnedRooms } from "../services/roomService";
import type { Room } from "../types/room";

export function useRooms(ownerId: string | undefined) {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [loading, setLoading] = useState(Boolean(ownerId));
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!ownerId) return;

		let active = true;

		const run = async () => {
			setLoading(true);
			setError(null);
		};

		void run();

		const unsubscribe = subscribeOwnedRooms(
			ownerId,
			(nextRooms) => {
				if (!active) return;
				setRooms(nextRooms);
				setLoading(false);
			},
			(message) => {
				if (!active) return;
				setError(message);
				setLoading(false);
			},
		);

		return () => {
			active = false;
			unsubscribe();
		};
	}, [ownerId]);

	if (!ownerId) {
		return { rooms: [], loading: false, error: null };
	}

	return { rooms, loading, error };
}
