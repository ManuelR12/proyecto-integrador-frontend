import { useState } from "react";
import { modals as copy } from "../copy/es";
import { updateRoomName } from "../services/roomService";

interface UseUpdateRoomOptions {
	roomId: string;
	onSuccess: (name: string) => void;
}

export function useUpdateRoom({ roomId, onSuccess }: UseUpdateRoomOptions) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const openModal = (currentName: string) => {
		setName(currentName);
		setError(null);
		setOpen(true);
	};

	const closeModal = () => {
		if (saving) return;
		setOpen(false);
		setError(null);
	};

	const handleNameChange = (value: string) => {
		setName(value);
		if (error) setError(null);
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (saving) return;

		const trimmedName = name.trim();
		if (!trimmedName) {
			setError(copy.editarSala.errors.nameRequired);
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const result = await updateRoomName(roomId, trimmedName);
			onSuccess(result.name);
			setOpen(false);
		} catch {
			setError(copy.editarSala.errors.generic);
		} finally {
			setSaving(false);
		}
	};

	return {
		open,
		name,
		saving,
		error,
		maxNameLength: copy.editarSala.nameMaxLength,
		openModal,
		closeModal,
		handleNameChange,
		handleSubmit,
	};
}
