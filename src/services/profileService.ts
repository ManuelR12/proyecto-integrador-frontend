import { isAxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { authHeaders, getIdToken } from "../lib/authToken";
import type {
	ApiProfileDocument,
	ApiProfileResponse,
	ProfileUpdatePayload,
	UserProfileData,
} from "../types/user";

function normalizeApiProfile(profile: ApiProfileDocument): UserProfileData {
	const nombres = (profile.nombres ?? profile.name ?? "").trim();
	const apellidos = (profile.apellidos ?? profile.lastName ?? "").trim();
	const displayName = (profile.displayName ?? `${nombres} ${apellidos}`).trim();

	return {
		uid: profile.uid,
		username: profile.username,
		email: profile.email ?? "",
		nombres,
		apellidos,
		avatarUrl: profile.avatarUrl ?? null,
		displayName,
	};
}

function mapProfileApiError(error: unknown): Error {
	if (!isAxiosError(error)) return new Error("UNKNOWN_ERROR");

	const status = error.response?.status;
	const data = error.response?.data as { code?: string; error?: string } | undefined;
	const code = data?.code ?? "";
	const msg = (data?.error ?? "").toLowerCase();

	if (!error.response) return new Error("NETWORK_ERROR");

	if (status === 400 && (code === "auth/missing-id-token" || msg.includes("missing token"))) {
		return new Error("UNAUTHENTICATED");
	}

	if (status === 401) {
		if (
			code === "REQUIRES_RECENT_LOGIN" ||
			code === "auth/requires-recent-login" ||
			msg.includes("recent login")
		) {
			return new Error("REQUIRES_RECENT_LOGIN");
		}
		return new Error("UNAUTHENTICATED");
	}

	if (status === 404 && (code === "profile/not-found" || msg.includes("not found"))) {
		return new Error("PROFILE_NOT_FOUND");
	}

	if (status === 409 || status === 400) {
		if (code.includes("username") || msg.includes("username")) return new Error("USERNAME_TAKEN");
	}

	return new Error("UNKNOWN_ERROR");
}

/**
 * Fetches the authenticated user's profile via GET /auth/profile.
 *
 * @returns `null` when the backend reports profile/not-found (404)
 * @throws `Error('UNAUTHENTICATED')`
 * @throws `Error('NETWORK_ERROR')`
 */
export async function fetchUserProfile(): Promise<UserProfileData | null> {
	const token = await getIdToken();

	try {
		const { data } = await apiClient.get<ApiProfileResponse>("/auth/profile", {
			headers: authHeaders(token),
		});
		return normalizeApiProfile(data.profile);
	} catch (error: unknown) {
		if (isAxiosError(error) && error.response?.status === 404) {
			const responseCode = (error.response.data as { code?: string } | undefined)?.code ?? "";
			if (responseCode === "profile/not-found" || !responseCode) return null;
		}

		throw mapProfileApiError(error);
	}
}

/**
 * Updates the authenticated user's profile via PATCH /auth/profile.
 *
 * @throws `Error('USERNAME_TAKEN')`
 * @throws `Error('PROFILE_NOT_FOUND')`
 * @throws `Error('UNAUTHENTICATED')`
 */
export async function updateUserProfile(
	updates: ProfileUpdatePayload,
): Promise<{ username: string; profile: UserProfileData }> {
	const token = await getIdToken();

	try {
		const { data } = await apiClient.patch<ApiProfileResponse>(
			"/auth/profile",
			{
				name: updates.nombres.trim(),
				lastName: updates.apellidos.trim(),
				username: updates.username.trim().toLowerCase(),
				avatarUrl: updates.avatarUrl,
			},
			{ headers: authHeaders(token) },
		);

		const profile = normalizeApiProfile(data.profile);
		return { username: profile.username, profile };
	} catch (error: unknown) {
		throw mapProfileApiError(error);
	}
}

/**
 * Permanently deletes the authenticated user's account via DELETE /auth/account.
 * The backend performs the hard delete (Auth + Firestore).
 *
 * @throws `Error('UNAUTHENTICATED')`
 * @throws `Error('REQUIRES_RECENT_LOGIN')`
 */
export async function deleteUserAccount(): Promise<void> {
	const token = await getIdToken();

	try {
		await apiClient.delete("/auth/account", {
			headers: authHeaders(token),
		});
	} catch (error: unknown) {
		throw mapProfileApiError(error);
	}
}
