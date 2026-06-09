import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { dashboard as copy } from "../copy/es";
import { joinRoomViaSocket } from "../services/roomSocketService";

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
			await joinRoomViaSocket(trimmedId);
			navigate(`/sala/${trimmedId}`);
		} catch (err) {
			if (err instanceof Error && err.message === "ROOM_NOT_FOUND") {
				setError(copy.joinSection.errorNotFound);
			} else {
				setError(copy.joinSection.errorGeneric);
			}
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
