import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { perfil as copy } from "../copy/es";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useUserProfileContext } from "../contexts/UserProfileContext";
import { deleteUserAccount } from "../services/profileService";
import type { DeleteModalPhase } from "../components/profile/DeleteAccountModal";

export function useDeleteAccount() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { showToast } = useToast();
	const { data } = useUserProfileContext();

	const [isOpen, setIsOpen] = useState(false);
	const [phase, setPhase] = useState<DeleteModalPhase>("confirm");
	const [confirmText, setConfirmText] = useState("");

	const openModal = () => {
		setConfirmText("");
		setPhase("confirm");
		setIsOpen(true);
	};

	const closeModal = () => {
		if (phase === "loading") return;
		setIsOpen(false);
		setConfirmText("");
		setPhase("confirm");
	};

	const handleConfirm = async () => {
		if (!user || !data?.username || phase !== "confirm") return;

		setPhase("loading");
		try {
			await deleteUserAccount();
			await signOut(auth);
			setIsOpen(false);
			navigate("/login", { replace: true });
		} catch (err: unknown) {
			if (err instanceof Error && err.message === "REQUIRES_RECENT_LOGIN") {
				setPhase("reauth");
				return;
			}
			console.error("[useDeleteAccount]", err);
			setPhase("confirm");
			showToast(copy.deleteModal.errors.generic, "error");
		}
	};

	const handleReauthAction = async () => {
		setIsOpen(false);
		setConfirmText("");
		setPhase("confirm");
		await signOut(auth);
		navigate("/login", { replace: true });
	};

	return {
		isOpen,
		phase,
		confirmText,
		openModal,
		closeModal,
		setConfirmText,
		handleConfirm,
		handleReauthAction,
	};
}
