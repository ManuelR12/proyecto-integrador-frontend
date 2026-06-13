import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { dashboard as copy } from "../copy/es";
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

		setJoining(true);
		setError(null);

		try {
			const room = await fetchRoomById(trimmedId);
			if (!room) {
				setError(copy.joinSection.errorNotFound(trimmedId));
				return;
			}
			navigate(`/sala/${trimmedId}`);
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
