import { useCallback, useEffect, useState } from "react";
import { fetchOwnedRooms } from "../services/roomService";
import type { Room } from "../types/room";

export function useRooms(isAuthenticated: boolean) {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [loading, setLoading] = useState(isAuthenticated);
	const [error, setError] = useState<string | null>(null);

	const loadRooms = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const nextRooms = await fetchOwnedRooms();
			setRooms(nextRooms);
		} catch (err) {
			console.error("[useRooms]", err);
			setRooms([]);
			setError("No pudimos cargar tus salas.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!isAuthenticated) return;

		let active = true;

		const run = async () => {
			setLoading(true);
			setError(null);

			try {
				const nextRooms = await fetchOwnedRooms();
				if (!active) return;
				setRooms(nextRooms);
			} catch (err) {
				if (!active) return;
				console.error("[useRooms]", err);
				setRooms([]);
				setError("No pudimos cargar tus salas.");
			} finally {
				if (active) setLoading(false);
			}
		};

		void run();

		return () => {
			active = false;
		};
	}, [isAuthenticated]);

	if (!isAuthenticated) {
		return { rooms: [], loading: false, error: null, refetch: loadRooms };
	}

	return { rooms, loading, error, refetch: loadRooms };
}
