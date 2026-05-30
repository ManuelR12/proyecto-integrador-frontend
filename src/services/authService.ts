/**
 * @module authService
 * @description Auth service — Firebase Auth on the client, profile persistence via backend API.
 *
 * ## Backend endpoints used
 * - POST /auth/register  — creates Firebase Auth user + Firestore profile
 * - POST /auth/google    — verifies Google ID token, creates Firestore profile on first login
 *
 * ## Firestore data model (written by backend)
 * ### users/{username}
 * { uid, email, username, name, lastName, provider, profileComplete, createdAt }
 *
 * ### uids/{uid}  (written by frontend for Google username-setup flow)
 * { username }
 */

import {
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	GoogleAuthProvider,
	type UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { isAxiosError } from "axios";
import { auth, db } from "../lib/firebase";
import apiClient from "../lib/apiClient";
import type { LoginPayload, RegisterPayload, RegisteredUser } from "../types/auth";

const USERS_COLLECTION = "users";
const UIDS_COLLECTION = "uids";
const INSTITUTIONAL_EMAIL_RE = /\.edu\.co$/i;

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Checks whether a username is already taken in Firestore.
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
	const ref = doc(db, USERS_COLLECTION, username.toLowerCase());
	const snap = await getDoc(ref);
	return snap.exists();
}

/**
 * Registers a new user via backend, then signs in with Firebase Auth on the client.
 *
 * Flow:
 * 1. Validate institutional email
 * 2. POST /auth/register — backend creates Firebase Auth user + Firestore profile
 * 3. signInWithEmailAndPassword — authenticate on the client
 *
 * @throws `Error('NON_INSTITUTIONAL_EMAIL')`
 * @throws `Error('USERNAME_TAKEN')`
 * @throws `Error('EMAIL_TAKEN')`
 * @throws `Error('PASSWORD_WEAK')`
 * @throws `Error('NETWORK_ERROR')`
 */
export async function registerWithEmail(payload: RegisterPayload): Promise<RegisteredUser> {
	const { nombres, apellidos, username, email, password } = payload;

	if (!INSTITUTIONAL_EMAIL_RE.test(email)) throw new Error("NON_INSTITUTIONAL_EMAIL");

	try {
		await apiClient.post("/auth/register", {
			name: nombres,
			lastName: apellidos,
			username,
			email,
			password,
		});
	} catch (error: unknown) {
		throw mapBackendError(error);
	}

	let credential: UserCredential;
	try {
		credential = await signInWithEmailAndPassword(auth, email, password);
	} catch (firebaseError: unknown) {
		throw mapFirebaseAuthError(firebaseError);
	}

	const lowerUsername = username.toLowerCase();
	const displayName = `${nombres} ${apellidos}`.trim();

	return {
		uid: credential.user.uid,
		email: credential.user.email ?? email,
		username: lowerUsername,
		displayName,
	};
}

/**
 * Authenticates an existing user with email and password.
 * @throws `Error('NON_INSTITUTIONAL_EMAIL')`
 * @throws `Error('INVALID_CREDENTIALS')`
 * @throws `Error('TOO_MANY_REQUESTS')`
 * @throws `Error('NETWORK_ERROR')`
 */
export async function loginWithEmail(payload: LoginPayload): Promise<void> {
	if (!INSTITUTIONAL_EMAIL_RE.test(payload.email)) throw new Error("NON_INSTITUTIONAL_EMAIL");
	try {
		await signInWithEmailAndPassword(auth, payload.email, payload.password);
	} catch (error: unknown) {
		throw mapFirebaseAuthError(error);
	}
}

/**
 * Initiates Google OAuth via popup, then verifies the ID token with the backend.
 *
 * Flow:
 * 1. signInWithPopup — Firebase Auth on the client
 * 2. Institutional email check
 * 3. POST /auth/google with ID token — backend creates Firestore profile if first login
 *
 * @returns `{ needsUsername: true }` — first login, redirect to /username-setup
 * @returns `{ needsUsername: false }` — returning user, redirect to /dashboard
 * @throws `Error('POPUP_CLOSED')`
 * @throws `Error('NON_INSTITUTIONAL_EMAIL')`
 * @throws `Error('NETWORK_ERROR')`
 */
export async function signInWithGoogle(): Promise<{ needsUsername: boolean }> {
	const provider = new GoogleAuthProvider();
	let credential: UserCredential;
	try {
		credential = await signInWithPopup(auth, provider);
	} catch (error: unknown) {
		throw mapFirebaseAuthError(error);
	}

	if (!INSTITUTIONAL_EMAIL_RE.test(credential.user.email ?? "")) {
		await signOut(auth);
		throw new Error("NON_INSTITUTIONAL_EMAIL");
	}

	const idToken = await credential.user.getIdToken();

	try {
		await apiClient.post("/auth/google", { idToken });
		return { needsUsername: false };
	} catch (error: unknown) {
		if (isAxiosError(error) && error.response?.status === 403) {
			const code = error.response.data?.code as string | undefined;
			if (code === "google/username-required") {
				return { needsUsername: true };
			}
		}
		// Backend unreachable — fall back to Firestore check so auth still works
		if (!isAxiosError(error) || !error.response) {
			const uidSnap = await getDoc(doc(db, UIDS_COLLECTION, credential.user.uid));
			return { needsUsername: !uidSnap.exists() };
		}
		throw new Error("GOOGLE_AUTH_ERROR");
	}
}

/**
 * Saves a Firestore profile for a Google user completing username setup.
 * Called after the user picks a username on /username-setup.
 *
 * @throws `Error('UNAUTHENTICATED')`
 * @throws `Error('USERNAME_TAKEN')`
 */
export async function saveGoogleUserProfile(username: string): Promise<void> {
	const currentUser = auth.currentUser;
	if (!currentUser) throw new Error("UNAUTHENTICATED");

	const taken = await isUsernameTaken(username);
	if (taken) throw new Error("USERNAME_TAKEN");

	const lowerUsername = username.toLowerCase();
	const displayName = currentUser.displayName ?? "";

	await setDoc(doc(db, USERS_COLLECTION, lowerUsername), {
		uid: currentUser.uid,
		email: currentUser.email ?? "",
		username: lowerUsername,
		displayName,
		nombres: displayName.split(" ")[0] ?? "",
		apellidos: displayName.split(" ").slice(1).join(" "),
		avatarUrl: currentUser.photoURL ?? null,
		createdAt: serverTimestamp(),
	});

	await setDoc(doc(db, UIDS_COLLECTION, currentUser.uid), { username: lowerUsername });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function mapBackendError(error: unknown): Error {
	if (!isAxiosError(error)) return new Error("UNKNOWN_ERROR");

	const status = error.response?.status;
	const data = error.response?.data as { error?: string; code?: string } | undefined;
	const code = data?.code ?? "";
	const msg = (data?.error ?? "").toLowerCase();

	if (!error.response) return new Error("NETWORK_ERROR");

	if (status === 400) {
		if (msg.includes("username")) return new Error("USERNAME_TAKEN");
		if (msg.includes("email")) return new Error("EMAIL_TAKEN");
		return new Error("VALIDATION_ERROR");
	}

	if (status === 500 || status === 409) {
		if (code === "auth/email-already-exists" || msg.includes("email")) {
			return new Error("EMAIL_TAKEN");
		}
	}

	return new Error("UNKNOWN_ERROR");
}

function mapFirebaseAuthError(error: unknown): Error {
	if (!isFirebaseError(error)) return new Error("UNKNOWN_ERROR");

	switch (error.code) {
		case "auth/email-already-in-use":
			return new Error("EMAIL_TAKEN");
		case "auth/invalid-email":
			return new Error("EMAIL_INVALID");
		case "auth/weak-password":
			return new Error("PASSWORD_WEAK");
		case "auth/network-request-failed":
			return new Error("NETWORK_ERROR");
		case "auth/wrong-password":
		case "auth/user-not-found":
		case "auth/invalid-credential":
			return new Error("INVALID_CREDENTIALS");
		case "auth/too-many-requests":
			return new Error("TOO_MANY_REQUESTS");
		case "auth/popup-closed-by-user":
		case "auth/cancelled-popup-request":
			return new Error("POPUP_CLOSED");
		default:
			return new Error("UNKNOWN_ERROR");
	}
}

function isFirebaseError(err: unknown): err is { code: string; message: string } {
	return (
		typeof err === "object" &&
		err !== null &&
		"code" in err &&
		typeof (err as Record<string, unknown>).code === "string"
	);
}
