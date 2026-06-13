import { auth } from "./firebase";

export async function getIdToken(): Promise<string> {
	const user = auth.currentUser;
	if (!user) throw new Error("UNAUTHENTICATED");
	return user.getIdToken();
}

export function authHeaders(token: string) {
	return { Authorization: `Bearer ${token}` };
}
