import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { fetchUserProfile } from "../services/profileService";
import type { UserProfileData } from "../types/user";

interface UserProfileContextValue {
	data: UserProfileData | null;
	avatarUrl: string | null;
	username: string | null;
	displayName: string | null;
	nombres: string | null;
	apellidos: string | null;
	email: string | null;
	loading: boolean;
	profileMissing: boolean;
	refetch: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [data, setData] = useState<UserProfileData | null>(null);
	const [loading, setLoading] = useState(false);
	const [profileMissing, setProfileMissing] = useState(false);

	const loadProfile = useCallback(async () => {
		if (!user) {
			setData(null);
			setProfileMissing(false);
			return;
		}

		setLoading(true);
		try {
			const profile = await fetchUserProfile();
			if (!profile) {
				setData(null);
				setProfileMissing(true);
				return;
			}
			setData(profile);
			setProfileMissing(false);
		} catch (err) {
			console.error("[UserProfileContext]", err);
			setData(null);
			setProfileMissing(true);
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		void loadProfile();
	}, [loadProfile]);

	const value = useMemo<UserProfileContextValue>(
		() => ({
			data,
			avatarUrl: data?.avatarUrl ?? null,
			username: data?.username ?? null,
			displayName: data?.displayName ?? null,
			nombres: data?.nombres ?? null,
			apellidos: data?.apellidos ?? null,
			email: data?.email ?? null,
			loading,
			profileMissing,
			refetch: loadProfile,
		}),
		[data, loading, profileMissing, loadProfile],
	);

	return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserProfileContext(): UserProfileContextValue {
	const ctx = useContext(UserProfileContext);
	if (!ctx) {
		throw new Error("useUserProfileContext must be used within UserProfileProvider");
	}
	return ctx;
}
