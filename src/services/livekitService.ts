import { isAxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { authHeaders, getIdToken } from "../lib/authToken";

export interface LiveKitTokenResponse {
	token: string;
	url: string;
}

function resolveLiveKitUrl(serverUrl?: string): string {
	const url = serverUrl?.trim() || import.meta.env.VITE_LIVEKIT_URL?.trim();
	if (!url) {
		throw new Error("Missing LiveKit URL");
	}
	return url;
}

function mapLiveKitTokenError(error: unknown): Error {
	if (!isAxiosError(error)) return new Error("LIVEKIT_TOKEN_FAILED");
	if (!error.response) return new Error("NETWORK_ERROR");
	if (error.response.status === 401) return new Error("UNAUTHENTICATED");
	if (error.response.status === 404) return new Error("ROOM_NOT_FOUND");
	if (error.response.status === 503) return new Error("LIVEKIT_NOT_CONFIGURED");
	return new Error("LIVEKIT_TOKEN_FAILED");
}

/** Fetches a short-lived LiveKit JWT from the backend for the given study room. */
export async function fetchLiveKitToken(roomId: string): Promise<LiveKitTokenResponse> {
	const token = await getIdToken();

	try {
		const { data } = await apiClient.post<{ token: string; url?: string }>(
			`/rooms/${roomId}/token`,
			{},
			{ headers: authHeaders(token) },
		);
		return {
			token: data.token,
			url: resolveLiveKitUrl(data.url),
		};
	} catch (error: unknown) {
		throw mapLiveKitTokenError(error);
	}
}
