import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

interface UserProfile {
	avatarUrl: string | null;
	username: string | null;
}

export function useUserProfile(): UserProfile {
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile>({ avatarUrl: null, username: null });

	useEffect(() => {
		if (!user) {
			setProfile({ avatarUrl: null, username: null });
			return;
		}

		getDoc(doc(db, "uids", user.uid)).then((uidSnap) => {
			console.log("[useUserProfile] uids snap exists:", uidSnap.exists(), uidSnap.data());
			if (!uidSnap.exists()) return;
			const { username } = uidSnap.data() as { username: string };
			getDoc(doc(db, "users", username)).then((userSnap) => {
				console.log("[useUserProfile] users snap exists:", userSnap.exists(), userSnap.data());
				if (!userSnap.exists()) return;
				const data = userSnap.data() as { avatarUrl?: string | null };
				setProfile({ avatarUrl: data.avatarUrl ?? null, username });
			});
		}).catch((err) => console.error("[useUserProfile] error:", err));
	}, [user]);

	return profile;
}
