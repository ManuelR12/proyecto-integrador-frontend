import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth as copy } from "../copy/es";
import { signInWithGoogle, getGoogleRedirectResult } from "../services/authService";
import { useToast } from "../contexts/ToastContext";

export function useGoogleAuth() {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const result = await getGoogleRedirectResult();
				if (!result) return;
				if (!result.needsUsername) showToast("¡Conectado con Google! Bienvenido.", "success");
				navigate(result.needsUsername ? "/username-setup" : "/dashboard", { replace: true });
			} catch {
				setError(copy.google.error);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const signIn = async () => {
		setLoading(true);
		setError(null);
		try {
			await signInWithGoogle();
		} catch {
			setError(copy.google.error);
			setLoading(false);
		}
	};

	return { signIn, loading, error };
}
