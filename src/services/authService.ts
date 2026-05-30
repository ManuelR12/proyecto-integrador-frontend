/**
 * @module authService
 * @description Firebase Auth + Firestore authentication service.
 *
 * ## Firestore data model
 *
 * ### Collection `users/{username}` — public user profile (keyed by lowercase username)
 * ```
 * {
 *   uid:         string          // Firebase Auth UID
 *   email:       string          // User email
 *   username:    string          // Unique lowercase username (3-20 chars, [a-z0-9_])
 *   displayName: string          // "nombres apellidos"
 *   nombres:     string          // First name(s)
 *   apellidos:   string          // Last name(s)
 *   avatarUrl:   string | null   // Data URL or Google photoURL
 *   createdAt:   Timestamp       // Firestore server timestamp
 * }
 * ```
 *
 * ### Collection `uids/{uid}` — reverse lookup (keyed by Firebase Auth UID)
 * ```
 * {
 *   username: string   // Points to the users/{username} document
 * }
 * ```
 *
 * Both documents are written atomically on registration to allow O(1)
 * uid → username lookups without Firestore collection scans.
 */

import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	GoogleAuthProvider,
	updateProfile,
	type UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { LoginPayload, RegisterPayload, RegisteredUser } from "../types/auth";

const USERS_COLLECTION = "users";
const UIDS_COLLECTION = "uids";
const INSTITUTIONAL_EMAIL_RE = /\.edu\.co$/i;

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Checks whether a username is already taken in Firestore.
 * @param username - Raw username (will be lowercased before querying)
 * @returns `true` if the username exists, `false` otherwise
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
	const ref = doc(db, USERS_COLLECTION, username.toLowerCase());
	const snap = await getDoc(ref);
	return snap.exists();
}

/**
 * Registers a new user with email and password.
 *
 * Flow:
 * 1. Verifies username uniqueness (throws `USERNAME_TAKEN` if occupied)
 * 2. Creates Firebase Auth account (`createUserWithEmailAndPassword`)
 * 3. Updates Auth profile with `displayName`
 * 4. Writes `users/{username}` and `uids/{uid}` documents in Firestore
 *
 * @param payload - Registration form data
 * @returns Minimal registered user info (uid, email, username, displayName)
 * @throws `Error('USERNAME_TAKEN')` — username already in use
 * @throws `Error('EMAIL_TAKEN')` — email already registered
 * @throws `Error('PASSWORD_WEAK')` — password does not meet Firebase requirements
 * @throws `Error('NETWORK_ERROR')` — no network connection
 */
export async function registerWithEmail(payload: RegisterPayload): Promise<RegisteredUser> {
	const { nombres, apellidos, username, email, password, avatarDataUrl } = payload;

	if (!INSTITUTIONAL_EMAIL_RE.test(email)) throw new Error("NON_INSTITUTIONAL_EMAIL");

	const taken = await isUsernameTaken(username);
	if (taken) throw new Error("USERNAME_TAKEN");

	let credential: UserCredential;
	try {
		credential = await createUserWithEmailAndPassword(auth, email, password);
	} catch (firebaseError: unknown) {
		throw mapFirebaseAuthError(firebaseError);
	}

	const { user } = credential;
	const displayName = `${nombres} ${apellidos}`.trim();

	// photoURL only accepts a real URL — base64 data URIs exceed Firebase's
	// character limit and return 400. Avatar is persisted in Firestore instead.
	await updateProfile(user, { displayName });

	const lowerUsername = username.toLowerCase();
	const userDoc = {
		uid: user.uid,
		email: user.email ?? email,
		username: lowerUsername,
		displayName,
		nombres,
		apellidos,
		avatarUrl: avatarDataUrl ?? null,
		createdAt: serverTimestamp(),
	};

	await setDoc(doc(db, USERS_COLLECTION, lowerUsername), userDoc);
	await setDoc(doc(db, UIDS_COLLECTION, user.uid), { username: lowerUsername });

	return {
		uid: user.uid,
		email: user.email ?? email,
		username: lowerUsername,
		displayName,
	};
}

/**
 * Authenticates an existing user with email and password.
 * @param payload - `{ email, password }`
 * @throws `Error('INVALID_CREDENTIALS')` — wrong email or password
 * @throws `Error('TOO_MANY_REQUESTS')` — account temporarily locked
 * @throws `Error('NETWORK_ERROR')` — no network connection
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
 * Initiates Google OAuth sign-in via popup.
 *
 * Firebase automatically creates an Auth account on first sign-in with Google,
 * so this function serves as both login and registration for Google users.
 *
 * After sign-in, checks whether a Firestore profile (`uids/{uid}`) already
 * exists to determine if the user needs to set up a username.
 *
 * @returns `{ needsUsername: true }` — first time Google user, redirect to `/username-setup`
 * @returns `{ needsUsername: false }` — returning user, redirect to `/dashboard`
 * @throws `Error('POPUP_CLOSED')` — user closed the Google popup (silent, no UI error shown)
 * @throws `Error('NETWORK_ERROR')` — no network connection
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

	const uidRef = doc(db, UIDS_COLLECTION, credential.user.uid);
	const uidSnap = await getDoc(uidRef);
	return { needsUsername: !uidSnap.exists() };
}

/**
 * Saves a Firestore profile for a user who signed in with Google.
 * Called after the user completes the username setup screen.
 *
 * Writes both `users/{username}` and `uids/{uid}` to maintain the
 * dual-collection consistency required for O(1) reverse lookups.
 *
 * @param username - Chosen username (will be lowercased before saving)
 * @throws `Error('UNAUTHENTICATED')` — no Firebase Auth session active
 * @throws `Error('USERNAME_TAKEN')` — username was claimed between the
 *   real-time check and the submit (race condition guard)
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

/**
 * Maps Firebase Auth error codes to domain-level error strings.
 * Consumers should switch on `error.message` (e.g. `'INVALID_CREDENTIALS'`).
 */
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
