import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { modals as copy } from "../copy/es";
import {
	deleteRoomDocument,
	RoomForbiddenError,
	RoomNotFoundError,
} from "../services/roomFirestoreService";

interface UseDeleteRoomOptions {
	roomId: string;
	userId: string | undefined;
}

export function useDeleteRoom({ roomId, userId }: UseDeleteRoomOptions) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const openModal = () => {
		setError(null);
		setOpen(true);
	};

	const closeModal = () => {
		if (deleting) return;
		setOpen(false);
		setError(null);
	};

	const handleConfirm = async () => {
		if (!userId || deleting) return;

		setDeleting(true);
		setError(null);

		try {
			await deleteRoomDocument(roomId, userId);
			setOpen(false);
			navigate("/dashboard", { state: { deletedRoomId: roomId } });
		} catch (err) {
			if (err instanceof RoomNotFoundError || err instanceof RoomForbiddenError) {
				setError(copy.eliminarSala.errors.generic);
			} else {
				setError(copy.eliminarSala.errors.generic);
			}
		} finally {
			setDeleting(false);
		}
	};

	return {
		open,
		deleting,
		error,
		openModal,
		closeModal,
		handleConfirm,
	};
}
