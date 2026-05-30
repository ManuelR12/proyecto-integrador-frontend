import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	updateProfile,
	type UserCredential,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { LoginPayload, RegisterPayload, RegisteredUser } from '../types/auth'

const USERS_COLLECTION = 'users'
const UIDS_COLLECTION = 'uids'

export async function isUsernameTaken(username: string): Promise<boolean> {
	const ref = doc(db, USERS_COLLECTION, username.toLowerCase())
	const snap = await getDoc(ref)
	return snap.exists()
}

export async function registerWithEmail(payload: RegisterPayload): Promise<RegisteredUser> {
	const { nombres, apellidos, username, email, password, avatarDataUrl } = payload

	const taken = await isUsernameTaken(username)
	if (taken) throw new Error('USERNAME_TAKEN')

	let credential: UserCredential
	try {
		credential = await createUserWithEmailAndPassword(auth, email, password)
	} catch (firebaseError: unknown) {
		throw mapFirebaseAuthError(firebaseError)
	}

	const { user } = credential
	const displayName = `${nombres} ${apellidos}`.trim()

	await updateProfile(user, {
		displayName,
		...(avatarDataUrl ? { photoURL: avatarDataUrl } : {}),
	})

	const lowerUsername = username.toLowerCase()
	const userDoc = {
		uid: user.uid,
		email: user.email ?? email,
		username: lowerUsername,
		displayName,
		nombres,
		apellidos,
		avatarUrl: avatarDataUrl ?? null,
		createdAt: serverTimestamp(),
	}

	await setDoc(doc(db, USERS_COLLECTION, lowerUsername), userDoc)
	await setDoc(doc(db, UIDS_COLLECTION, user.uid), { username: lowerUsername })

	return {
		uid: user.uid,
		email: user.email ?? email,
		username: lowerUsername,
		displayName,
	}
}

export async function loginWithEmail(payload: LoginPayload): Promise<void> {
	try {
		await signInWithEmailAndPassword(auth, payload.email, payload.password)
	} catch (error: unknown) {
		throw mapFirebaseAuthError(error)
	}
}

export async function signInWithGoogle(): Promise<{ needsUsername: boolean }> {
	const provider = new GoogleAuthProvider()
	let credential: UserCredential
	try {
		credential = await signInWithPopup(auth, provider)
	} catch (error: unknown) {
		throw mapFirebaseAuthError(error)
	}

	const uidRef = doc(db, UIDS_COLLECTION, credential.user.uid)
	const uidSnap = await getDoc(uidRef)
	return { needsUsername: !uidSnap.exists() }
}

export async function saveGoogleUserProfile(username: string): Promise<void> {
	const currentUser = auth.currentUser
	if (!currentUser) throw new Error('UNAUTHENTICATED')

	const taken = await isUsernameTaken(username)
	if (taken) throw new Error('USERNAME_TAKEN')

	const lowerUsername = username.toLowerCase()
	const displayName = currentUser.displayName ?? ''

	await setDoc(doc(db, USERS_COLLECTION, lowerUsername), {
		uid: currentUser.uid,
		email: currentUser.email ?? '',
		username: lowerUsername,
		displayName,
		nombres: displayName.split(' ')[0] ?? '',
		apellidos: displayName.split(' ').slice(1).join(' '),
		avatarUrl: currentUser.photoURL ?? null,
		createdAt: serverTimestamp(),
	})

	await setDoc(doc(db, UIDS_COLLECTION, currentUser.uid), { username: lowerUsername })
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function mapFirebaseAuthError(error: unknown): Error {
	if (!isFirebaseError(error)) return new Error('UNKNOWN_ERROR')

	switch (error.code) {
		case 'auth/email-already-in-use':
			return new Error('EMAIL_TAKEN')
		case 'auth/invalid-email':
			return new Error('EMAIL_INVALID')
		case 'auth/weak-password':
			return new Error('PASSWORD_WEAK')
		case 'auth/network-request-failed':
			return new Error('NETWORK_ERROR')
		case 'auth/wrong-password':
		case 'auth/user-not-found':
		case 'auth/invalid-credential':
			return new Error('INVALID_CREDENTIALS')
		case 'auth/too-many-requests':
			return new Error('TOO_MANY_REQUESTS')
		case 'auth/popup-closed-by-user':
		case 'auth/cancelled-popup-request':
			return new Error('POPUP_CLOSED')
		default:
			return new Error('UNKNOWN_ERROR')
	}
}

function isFirebaseError(err: unknown): err is { code: string; message: string } {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		typeof (err as Record<string, unknown>).code === 'string'
	)
}
