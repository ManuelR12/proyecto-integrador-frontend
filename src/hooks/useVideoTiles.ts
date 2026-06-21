import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import type { VideoTileParticipant } from "../types/media";
import { useRoomStore } from "../stores/useRoomStore";

function buildVideoTiles(state: {
	currentUserId: string;
	currentDisplayName: string;
	currentAvatarUrl: string | null;
	localStream: MediaStream | null;
	localStatus: VideoTileParticipant["status"];
	localVideoEnabled: boolean;
	participants: Array<{ uid: string; username: string; avatarUrl?: string | null }>;
	remoteVideoEnabledByUid: Record<string, boolean>;
	remoteStreamsByUid: Record<string, MediaStream>;
}): VideoTileParticipant[] {
	const localTile: VideoTileParticipant = {
		uid: state.currentUserId,
		displayName: state.currentDisplayName,
		isLocal: true,
		stream: state.localStream,
		status: state.localStatus,
		avatarUrl: state.currentAvatarUrl,
		videoEnabled: state.localVideoEnabled,
	};

	const remoteTiles = state.participants
		.filter((participant) => participant.uid !== state.currentUserId)
		.map((participant) => {
			const stream = state.remoteStreamsByUid[participant.uid] ?? null;
			return {
				uid: participant.uid,
				displayName: participant.username,
				isLocal: false,
				stream,
				status: stream ? ("connected" as const) : ("connecting" as const),
				avatarUrl: participant.avatarUrl,
				videoEnabled: state.remoteVideoEnabledByUid[participant.uid] ?? false,
			};
		});

	return [localTile, ...remoteTiles];
}

export function useVideoTiles(): VideoTileParticipant[] {
	const snapshot = useRoomStore(
		useShallow((state) => ({
			currentUserId: state.currentUserId,
			currentDisplayName: state.currentDisplayName,
			currentAvatarUrl: state.currentAvatarUrl,
			localStream: state.localStream,
			localStatus: state.localStatus,
			localVideoEnabled: state.localVideoEnabled,
			participants: state.participants,
			remoteVideoEnabledByUid: state.remoteVideoEnabledByUid,
			remoteStreamsByUid: state.remoteStreamsByUid,
		})),
	);

	return useMemo(() => buildVideoTiles(snapshot), [snapshot]);
}
