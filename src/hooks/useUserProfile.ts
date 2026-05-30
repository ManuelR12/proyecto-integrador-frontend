import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

interface UserProfile {
	avatarUrl: string | null;
	username: string | null;
	profileMissing: boolean;
}

export function useUserProfile(): UserProfile {
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile>({
		avatarUrl: null,
		username: null,
		profileMissing: false,
	});

	useEffect(() => {
		if (!user) {
			setProfile({ avatarUrl: null, username: null, profileMissing: false });
			return;
		}

		getDoc(doc(db, "uids", user.uid))
			.then((uidSnap) => {
				if (!uidSnap.exists()) {
					setProfile((prev) => ({ ...prev, profileMissing: true }));
					return;
				}
				const { username } = uidSnap.data() as { username: string };
				return getDoc(doc(db, "users", username)).then((userSnap) => {
					if (!userSnap.exists()) return;
					const data = userSnap.data() as { avatarUrl?: string | null };
					setProfile({ avatarUrl: data.avatarUrl ?? null, username, profileMissing: false });
				});
			})
			.catch((err) => console.error("[useUserProfile]", err));
	}, [user]);

	return profile;
}
