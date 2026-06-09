import { useEffect, useMemo, useRef, useState } from "react";
import { auth as authCopy, perfil as perfilCopy } from "../copy/es";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useUserProfileContext } from "../contexts/UserProfileContext";
import { updateUserProfile } from "../services/profileService";
import { isUsernameTaken } from "../services/authService";
import type { ProfileFieldErrors, ProfileFormFields } from "../types/user";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const DEBOUNCE_MS = 450;

const EMPTY_FORM: ProfileFormFields = {
	nombres: "",
	apellidos: "",
	username: "",
	email: "",
	avatarUrl: null,
};

function toFormFields(
	profile: {
		nombres: string;
		apellidos: string;
		username: string;
		email: string;
		avatarUrl: string | null;
	},
	authEmail: string,
): ProfileFormFields {
	return {
		nombres: profile.nombres,
		apellidos: profile.apellidos,
		username: profile.username,
		email: profile.email || authEmail,
		avatarUrl: profile.avatarUrl,
	};
}

function formsEqual(a: ProfileFormFields, b: ProfileFormFields): boolean {
	return (
		a.nombres === b.nombres &&
		a.apellidos === b.apellidos &&
		a.username === b.username &&
		a.avatarUrl === b.avatarUrl
	);
}

function validate(data: ProfileFormFields): ProfileFieldErrors {
	const errors: ProfileFieldErrors = {};
	if (!data.nombres.trim()) errors.nombres = perfilCopy.errors.nombresRequired;
	if (!data.apellidos.trim()) errors.apellidos = perfilCopy.errors.apellidosRequired;
	if (!USERNAME_REGEX.test(data.username))
		errors.username = authCopy.register.errors.usernameInvalid;
	return errors;
}

export function useProfileForm() {
	const { user } = useAuth();
	const { showToast } = useToast();
	const { data, loading: profileLoading, refetch } = useUserProfileContext();

	const [fields, setFields] = useState<ProfileFormFields>(EMPTY_FORM);
	const [baseline, setBaseline] = useState<ProfileFormFields>(EMPTY_FORM);
	const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
	const [saving, setSaving] = useState(false);
	const [checkingUsername, setCheckingUsername] = useState(false);
	const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (usernameTimerRef.current !== null) clearTimeout(usernameTimerRef.current);
		};
	}, []);

	useEffect(() => {
		if (!data || !user) return;

		const next = toFormFields(data, user.email ?? "");
		queueMicrotask(() => {
			setFields(next);
			setBaseline(next);
			setFieldErrors({});
		});
	}, [data, user]);

	const isDirty = useMemo(() => !formsEqual(fields, baseline), [fields, baseline]);
	const validationErrors = useMemo(() => validate(fields), [fields]);
	const isValid = Object.keys(validationErrors).length === 0;
	const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
	const canSave =
		isDirty && isValid && !hasFieldErrors && !saving && !checkingUsername && Boolean(data);

	const setField = (name: keyof ProfileFormFields, value: string | null) => {
		setFields((prev) => ({ ...prev, [name]: value }));
		setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
	};

	const setAvatarError = (error: string | undefined) => {
		setFieldErrors((prev) => ({ ...prev, avatar: error }));
	};

	const handleUsernameChange = (value: string) => {
		setField("username", value);

		if (usernameTimerRef.current !== null) {
			clearTimeout(usernameTimerRef.current);
			usernameTimerRef.current = null;
		}

		if (!USERNAME_REGEX.test(value) || value.toLowerCase() === baseline.username.toLowerCase()) {
			setCheckingUsername(false);
			return;
		}

		setCheckingUsername(true);
		usernameTimerRef.current = setTimeout(async () => {
			try {
				const taken = await isUsernameTaken(value);
				if (taken) {
					setFieldErrors((prev) => ({
						...prev,
						username: authCopy.register.errors.usernameTaken,
					}));
				}
			} catch {
				// submit will re-validate
			} finally {
				setCheckingUsername(false);
				usernameTimerRef.current = null;
			}
		}, DEBOUNCE_MS);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!canSave || !data || !user) return;

		const errors = validate(fields);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}

		setSaving(true);
		try {
			const { profile } = await updateUserProfile({
				nombres: fields.nombres.trim(),
				apellidos: fields.apellidos.trim(),
				username: fields.username.trim(),
				avatarUrl: fields.avatarUrl,
			});
			await refetch();
			const refreshed = toFormFields(profile, user.email ?? "");
			setBaseline(refreshed);
			setFields(refreshed);
			showToast(perfilCopy.success, "success");
		} catch (err: unknown) {
			if (err instanceof Error && err.message === "USERNAME_TAKEN") {
				setFieldErrors((prev) => ({
					...prev,
					username: authCopy.register.errors.usernameTaken,
				}));
			} else {
				console.error("[Profile] update error:", err);
				showToast(perfilCopy.errors.saveFailed, "error");
			}
		} finally {
			setSaving(false);
		}
	};

	const initials = useMemo(() => {
		const source = `${fields.nombres} ${fields.apellidos}`.trim() || user?.displayName || "AG";
		return source
			.split(" ")
			.filter(Boolean)
			.map((w) => w[0])
			.slice(0, 2)
			.join("")
			.toUpperCase();
	}, [fields.nombres, fields.apellidos, user?.displayName]);

	return {
		fields,
		fieldErrors,
		saving,
		checkingUsername,
		profileLoading,
		profileMissing: !data && !profileLoading,
		canSave,
		initials,
		setField,
		setAvatarError,
		handleUsernameChange,
		handleSubmit,
	};
}
