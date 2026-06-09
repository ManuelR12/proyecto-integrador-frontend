import { useUserProfileContext } from "../contexts/UserProfileContext";

/**
 * Backward-compatible hook for consuming the shared user profile state.
 */
export function useUserProfile() {
	const { avatarUrl, username, profileMissing, displayName, nombres, apellidos, email, loading, refetch } =
		useUserProfileContext();

	return {
		avatarUrl,
		username,
		profileMissing,
		displayName,
		nombres,
		apellidos,
		email,
		loading,
		refetch,
	};
}
