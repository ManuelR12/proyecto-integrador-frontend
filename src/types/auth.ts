/** Payload sent to Firebase Auth + Firestore when creating an account. */
export interface RegisterPayload {
	nombres: string;
	apellidos: string;
	username: string;
	email: string;
	password: string;
	/** Base-64 data URL or remote URL of the chosen avatar. */
	avatarDataUrl: string | null;
}

/** Validated errors per field for the register form. */
export interface RegisterFieldErrors {
	nombres?: string;
	apellidos?: string;
	username?: string;
	email?: string;
	password?: string;
	avatar?: string;
}

/** Shape returned by the auth service on success. */
export interface RegisteredUser {
	uid: string;
	email: string;
	username: string;
	displayName: string;
}

/** Credentials for email + password sign-in. */
export interface LoginPayload {
	email: string;
	password: string;
}

/** Validated errors per field for the login form. */
export interface LoginFieldErrors {
	email?: string;
	password?: string;
}
