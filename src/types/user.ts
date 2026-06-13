export interface FirestoreUserDocument {
	uid: string;
	email: string;
	username: string;
	nombres?: string;
	apellidos?: string;
	name?: string;
	lastName?: string;
	displayName?: string;
	avatarUrl?: string | null;
	provider?: string;
	profileComplete?: boolean;
}

/** Profile shape returned by GET/PATCH /auth/profile */
export interface ApiProfileDocument {
	id?: string;
	uid: string;
	email: string;
	username: string;
	name?: string;
	lastName?: string;
	nombres?: string;
	apellidos?: string;
	displayName?: string;
	avatarUrl?: string | null;
	profileComplete?: boolean;
	createdAt?: string;
}

export interface ApiProfileResponse {
	profile: ApiProfileDocument;
}

export interface UserProfileData {
	uid: string;
	username: string;
	email: string;
	nombres: string;
	apellidos: string;
	avatarUrl: string | null;
	displayName: string;
}

export interface ProfileFormFields {
	nombres: string;
	apellidos: string;
	username: string;
	email: string;
	avatarUrl: string | null;
}

export interface ProfileFieldErrors {
	nombres?: string;
	apellidos?: string;
	username?: string;
	avatar?: string;
}

export interface ProfileUpdatePayload {
	nombres: string;
	apellidos: string;
	username: string;
	avatarUrl: string | null;
}
