import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { remoteStreamHasActiveVideo } from "../lib/remoteStreamVideoState";
import type { VideoTileParticipant } from "../types/media";
import { useRoomStore } from "../stores/useRoomStore";

function buildVideoTiles(state: {
	currentUserId: string;
	currentDisplayName: string;
	currentAvatarUrl: string | null;
	localStream: MediaStream | null;
	localStatus: VideoTileParticipant["status"];
	localVideoEnabled: boolean;
	localAudioEnabled: boolean;
	participants: Array<{ uid: string; username: string; avatarUrl?: string | null }>;
	remoteVideoEnabledByUid: Record<string, boolean>;
	remoteMediaByUid: Record<string, { mic: boolean; camera: boolean }>;
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
		audioEnabled: state.localAudioEnabled,
	};

	const remoteTiles = state.participants
		.filter((participant) => participant.uid !== state.currentUserId)
		.map((participant) => {
			const stream = state.remoteStreamsByUid[participant.uid] ?? null;
			const socketMedia = state.remoteMediaByUid[participant.uid];
			const trackVideoEnabled = remoteStreamHasActiveVideo(stream);
			const videoEnabled = socketMedia ? socketMedia.camera : trackVideoEnabled;
			const audioEnabled = socketMedia?.mic ?? true;

			return {
				uid: participant.uid,
				displayName: participant.username,
				isLocal: false,
				stream,
				status: stream ? ("connected" as const) : ("connecting" as const),
				avatarUrl: participant.avatarUrl,
				videoEnabled,
				audioEnabled,
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
			localAudioEnabled: state.localAudioEnabled,
			participants: state.participants,
			remoteVideoEnabledByUid: state.remoteVideoEnabledByUid,
			remoteMediaByUid: state.remoteMediaByUid,
			remoteStreamsByUid: state.remoteStreamsByUid,
		})),
	);

	return useMemo(() => buildVideoTiles(snapshot), [snapshot]);
}
