import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { modals as copy } from "../copy/es";
import { deleteRoom } from "../services/roomService";

interface UseDeleteRoomOptions {
	roomId: string;
}

export function useDeleteRoom({ roomId }: UseDeleteRoomOptions) {
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
		if (deleting) return;

		setDeleting(true);
		setError(null);

		try {
			await deleteRoom(roomId);
			setOpen(false);
			navigate("/dashboard", { state: { deletedRoomId: roomId } });
		} catch {
			setError(copy.eliminarSala.errors.generic);
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
