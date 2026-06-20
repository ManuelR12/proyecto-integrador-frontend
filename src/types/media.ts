export type VideoTileStatus = "connecting" | "connected" | "failed";

export interface VideoTileParticipant {
	uid: string;
	displayName: string;
	isLocal: boolean;
	stream: MediaStream | null;
	status: VideoTileStatus;
	avatarUrl?: string | null;
}
