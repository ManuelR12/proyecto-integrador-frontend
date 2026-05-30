import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextValue {
	user: User | null;
	loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	// Firebase sometimes fires onAuthStateChanged(null) during initialization
	// before firing again with the actual user. We wait for auth.authStateReady()
	// so ProtectedRoute never sees a false-negative null.
	const ready = useRef(false);

	useEffect(() => {
		auth.authStateReady().then(() => {
			ready.current = true;
		});

		return onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser);
			if (ready.current || firebaseUser) setLoading(false);
		});
	}, []);

	return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	return useContext(AuthContext);
}
