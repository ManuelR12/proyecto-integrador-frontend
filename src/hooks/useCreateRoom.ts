import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { dashboard as copy } from "../copy/es";
import { useToast } from "../contexts/ToastContext";
import { createRoom, generateUniqueRoomCode } from "../services/roomService";

const MAX_TITLE_LENGTH = copy.createModal.nameMaxLength;

interface UseCreateRoomOptions {
	ownerId: string | undefined;
	ownerDisplayName: string;
}

export function useCreateRoom({ ownerId, ownerDisplayName }: UseCreateRoomOptions) {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [previewCode, setPreviewCode] = useState("");
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const resetForm = useCallback(() => {
		setTitle("");
		setError(null);
	}, []);

	const openModal = useCallback(async () => {
		resetForm();
		setIsOpen(true);
		try {
			const code = await generateUniqueRoomCode();
			setPreviewCode(code);
		} catch {
			setPreviewCode("");
			showToast("No pudimos generar un ID de sala. Inténtalo de nuevo.", "error");
		}
	}, [resetForm, showToast]);

	const closeModal = useCallback(() => {
		if (creating) return;
		setIsOpen(false);
		resetForm();
	}, [creating, resetForm]);

	useEffect(() => {
		if (!isOpen || previewCode) return;

		void generateUniqueRoomCode()
			.then(setPreviewCode)
			.catch(() => {
				showToast("No pudimos generar un ID de sala. Inténtalo de nuevo.", "error");
			});
	}, [isOpen, previewCode, showToast]);

	const handleTitleChange = (value: string) => {
		setTitle(value.slice(0, MAX_TITLE_LENGTH));
		if (error) setError(null);
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!ownerId) return;

		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			setError(copy.createModal.errors.nameRequired);
			return;
		}

		setCreating(true);
		setError(null);

		try {
			let code = previewCode;
			if (!code) code = await generateUniqueRoomCode();

			const roomCode = await createRoom(code, trimmedTitle, {
				uid: ownerId,
				displayName: ownerDisplayName,
			});

			setIsOpen(false);
			resetForm();
			navigate(`/sala/${roomCode}`, { replace: true });
		} catch (err) {
			if (err instanceof Error && err.message === "CODE_COLLISION") {
				try {
					const freshCode = await generateUniqueRoomCode();
					setPreviewCode(freshCode);
					setError("El ID generado ya existe. Intenta crear la sala de nuevo.");
				} catch {
					showToast("No pudimos crear la sala. Inténtalo de nuevo.", "error");
				}
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
		previewCode,
		creating,
		error,
		maxTitleLength: MAX_TITLE_LENGTH,
		openModal,
		closeModal,
		handleTitleChange,
		handleSubmit,
	};
}
