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
		if (!user) return;

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
		if (!user) return;

		let active = true;

		const run = async () => {
			setLoading(true);
			try {
				const profile = await fetchUserProfile();
				if (!active) return;

				if (!profile) {
					setData(null);
					setProfileMissing(true);
					return;
				}

				setData(profile);
				setProfileMissing(false);
			} catch (err) {
				if (!active) return;
				console.error("[UserProfileContext]", err);
				setData(null);
				setProfileMissing(true);
			} finally {
				if (active) setLoading(false);
			}
		};

		void run();

		return () => {
			active = false;
		};
	}, [user]);

	const effectiveData = user ? data : null;
	const effectiveLoading = user ? loading : false;
	const effectiveProfileMissing = user ? profileMissing : false;

	const value = useMemo<UserProfileContextValue>(
		() => ({
			data: effectiveData,
			avatarUrl: effectiveData?.avatarUrl ?? null,
			username: effectiveData?.username ?? null,
			displayName: effectiveData?.displayName ?? null,
			nombres: effectiveData?.nombres ?? null,
			apellidos: effectiveData?.apellidos ?? null,
			email: effectiveData?.email ?? null,
			loading: effectiveLoading,
			profileMissing: effectiveProfileMissing,
			refetch: loadProfile,
		}),
		[effectiveData, effectiveLoading, effectiveProfileMissing, loadProfile],
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
