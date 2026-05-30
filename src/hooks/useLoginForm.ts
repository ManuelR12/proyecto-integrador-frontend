import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth as copy } from "../copy/es";
import { loginWithEmail } from "../services/authService";
import { useToast } from "../contexts/ToastContext";
import type { LoginFieldErrors, LoginPayload } from "../types/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
	email: string;
	password: string;
}

const INITIAL: FormState = { email: "", password: "" };

export function useLoginForm() {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const [fields, setFields] = useState<FormState>(INITIAL);
	const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
	const [serverError, setServerError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const setField = (name: keyof FormState, value: string) => {
		setFields((prev) => ({ ...prev, [name]: value }));
		setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
		setServerError(null);
	};

	function validate(data: FormState): LoginFieldErrors {
		const errors: LoginFieldErrors = {};
		if (!EMAIL_REGEX.test(data.email)) {
			errors.email = copy.register.errors.emailInvalid;
		} else if (!data.email.toLowerCase().endsWith(".edu.co")) {
			errors.email = copy.register.errors.emailNotInstitutional;
		}
		if (!data.password) {
			errors.password = copy.register.errors.passwordWeak;
		}
		return errors;
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setServerError(null);

		const errors = validate(fields);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}

		const payload: LoginPayload = {
			email: fields.email.trim(),
			password: fields.password,
		};

		setLoading(true);
		try {
			await loginWithEmail(payload);
			showToast("¡Sesión iniciada! Bienvenido de vuelta.", "success");
			navigate("/dashboard", { replace: true });
		} catch (err: unknown) {
			if (err instanceof Error) {
				switch (err.message) {
					case "NON_INSTITUTIONAL_EMAIL":
						setFieldErrors((prev) => ({
							...prev,
							email: copy.register.errors.emailNotInstitutional,
						}));
						break;
					case "TOO_MANY_REQUESTS":
						setServerError(copy.login.errors.tooManyRequests);
						break;
					case "NETWORK_ERROR":
						setServerError(copy.login.errors.networkError);
						break;
					default:
						setServerError(copy.login.errors.invalidCredentials);
				}
			}
		} finally {
			setLoading(false);
		}
	};

	return { fields, fieldErrors, serverError, loading, setField, handleSubmit };
}
