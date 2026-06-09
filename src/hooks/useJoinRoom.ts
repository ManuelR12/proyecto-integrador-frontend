import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { dashboard as copy } from "../copy/es";
import { joinRoom } from "../services/roomService";

interface UseJoinRoomOptions {
	userId: string | undefined;
	userDisplayName: string;
}

export function useJoinRoom({ userId, userDisplayName }: UseJoinRoomOptions) {
	const navigate = useNavigate();
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [joining, setJoining] = useState(false);

	const handleCodeChange = (value: string) => {
		setCode(value);
		if (error) setError(null);
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!userId) return;

		const trimmedCode = code.trim();
		if (!trimmedCode) {
			setError(copy.joinSection.errorRequired);
			return;
		}

		setJoining(true);
		setError(null);

		try {
			const roomCode = await joinRoom(trimmedCode, {
				uid: userId,
				displayName: userDisplayName,
			});
			navigate(`/sala/${roomCode}`);
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
		code,
		error,
		joining,
		handleCodeChange,
		handleSubmit,
	};
}
