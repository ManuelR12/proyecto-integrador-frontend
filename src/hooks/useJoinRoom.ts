import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { dashboard as copy } from "../copy/es";
import { isValidRoomIdFormat, normalizeRoomId } from "../lib/roomId";
import { fetchRoomById } from "../services/roomFirestoreService";

interface UseJoinRoomOptions {
	userId: string | undefined;
}

export function useJoinRoom({ userId }: UseJoinRoomOptions) {
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [joining, setJoining] = useState(false);

	const handleRoomIdChange = (value: string) => {
		setRoomId(value);
		if (error) setError(null);
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!userId) return;

		const trimmedId = roomId.trim();
		if (!trimmedId) {
			setError(copy.joinSection.errorRequired);
			return;
		}

		if (!isValidRoomIdFormat(trimmedId)) {
			setError(copy.joinSection.errorFormat);
			return;
		}

		const normalizedId = normalizeRoomId(trimmedId);

		setJoining(true);
		setError(null);

		try {
			const room = await fetchRoomById(normalizedId);
			if (!room) {
				setError(copy.joinSection.errorNotFound(normalizedId));
				return;
			}
			navigate(`/sala/${normalizedId}`);
		} catch {
			setError(copy.joinSection.errorGeneric);
		} finally {
			setJoining(false);
		}
	};

	return {
		roomId,
		error,
		joining,
		handleRoomIdChange,
		handleSubmit,
	};
}
