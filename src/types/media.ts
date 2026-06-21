export type VideoTileStatus = "connecting" | "connected" | "failed";

export interface VideoTileParticipant {
	uid: string;
	displayName: string;
	isLocal: boolean;
	stream: MediaStream | null;
	status: VideoTileStatus;
	avatarUrl?: string | null;
	/** When false the tile shows the avatar fallback instead of the video element. */
	videoEnabled: boolean;
}
