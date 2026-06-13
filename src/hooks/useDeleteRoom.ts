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
	const [confirmText, setConfirmText] = useState("");

	const openModal = () => {
		setError(null);
		setConfirmText("");
		setOpen(true);
	};

	const closeModal = () => {
		if (deleting) return;
		setOpen(false);
		setError(null);
		setConfirmText("");
	};

	const handleConfirm = async () => {
		if (deleting) return;
		if (confirmText.trim().toLowerCase() !== copy.eliminarSala.confirmWord) return;

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
		confirmText,
		openModal,
		closeModal,
		setConfirmText,
		handleConfirm,
	};
}
