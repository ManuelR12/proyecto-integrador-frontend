import { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { dashboard as copy } from "../copy/es";
import { useToast } from "../contexts/ToastContext";
import { createRoom } from "../services/roomService";

const MAX_TITLE_LENGTH = copy.createModal.nameMaxLength;

export function useCreateRoom() {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const resetForm = useCallback(() => {
		setTitle("");
		setError(null);
	}, []);

	const openModal = useCallback(() => {
		resetForm();
		setIsOpen(true);
	}, [resetForm]);

	const closeModal = useCallback(() => {
		if (creating) return;
		setIsOpen(false);
		resetForm();
	}, [creating, resetForm]);

	const handleTitleChange = (value: string) => {
		setTitle(value.slice(0, MAX_TITLE_LENGTH));
		if (error) setError(null);
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			setError(copy.createModal.errors.nameRequired);
			return;
		}

		setCreating(true);
		setError(null);

		try {
			const room = await createRoom(trimmedTitle);
			setIsOpen(false);
			resetForm();
			navigate(`/sala/${room.id}`, { replace: true });
		} catch (err) {
			if (err instanceof Error && err.message === "VALIDATION_ERROR") {
				setError(copy.createModal.errors.nameRequired);
			} else {
				showToast("No pudimos crear la sala. Inténtalo de nuevo.", "error");
			}
		} finally {
			setCreating(false);
		}
	};

	return {
		isOpen,
		title,
		creating,
		error,
		maxTitleLength: MAX_TITLE_LENGTH,
		openModal,
		closeModal,
		handleTitleChange,
		handleSubmit,
	};
}
