import {
  createUserWithEmailAndPassword,
  updateProfile,
  type UserCredential,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { RegisterPayload, RegisteredUser } from '../types/auth'

/** Firestore collection that holds public user profiles. */
const USERS_COLLECTION = 'users'

/**
 * Returns true when the given username already exists in Firestore.
 * Called before creating the Firebase Auth account so we fail fast
 * without leaving orphan auth records.
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
  const ref = doc(db, USERS_COLLECTION, username.toLowerCase())
  const snap = await getDoc(ref)
  return snap.exists()
}

/**
 * Creates a new account in Firebase Auth, then writes the public profile
 * document to Firestore (keyed by lowercase username for uniqueness).
 *
 * Throws with a descriptive `message` string that the UI can display
 * directly (no Firebase error codes exposed to the user).
 */
export async function registerWithEmail(
  payload: RegisterPayload,
): Promise<RegisteredUser> {
  const { nombres, apellidos, username, email, password, avatarDataUrl } = payload

  // 1. Guard: username collision before touching Firebase Auth
  const taken = await isUsernameTaken(username)
  if (taken) {
    const err = new Error('USERNAME_TAKEN')
    throw err
  }

  // 2. Create Firebase Auth account
  let credential: UserCredential
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password)
  } catch (firebaseError: unknown) {
    throw mapFirebaseAuthError(firebaseError)
  }

  const { user } = credential
  const displayName = `${nombres} ${apellidos}`.trim()

  // 3. Update Auth profile display name (and photo if provided)
  await updateProfile(user, {
    displayName,
    ...(avatarDataUrl ? { photoURL: avatarDataUrl } : {}),
  })

  // 4. Write Firestore user document (username as document ID)
  const userDoc = {
    uid: user.uid,
    email: user.email ?? email,
    username: username.toLowerCase(),
    displayName,
    nombres,
    apellidos,
    avatarUrl: avatarDataUrl ?? null,
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(db, USERS_COLLECTION, username.toLowerCase()), userDoc)

  return {
    uid: user.uid,
    email: user.email ?? email,
    username: username.toLowerCase(),
    displayName,
  }
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
