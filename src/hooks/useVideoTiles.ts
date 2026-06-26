import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
	remoteStreamHasActiveAudio,
	remoteStreamHasActiveVideo,
} from "../lib/remoteStreamVideoState";
import type { VideoTileParticipant } from "../types/media";
import { useRoomStore } from "../stores/useRoomStore";

/**
 * Combines socket-reported media state with WebRTC track signals.
 * Socket "off" is authoritative; when socket says "on" (or is unknown), track mute/unmute
 * events still gate video so black frames fall back to the avatar if a socket event is lost.
 */
function resolveRemoteMediaEnabled(
	socketEnabled: boolean | undefined,
	trackEnabled: boolean | undefined,
	streamFallback: boolean,
): boolean {
	if (socketEnabled === false) return false;
	return trackEnabled ?? streamFallback;
}

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
	remoteAudioEnabledByUid: Record<string, boolean>;
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
			const trackVideoEnabled = state.remoteVideoEnabledByUid[participant.uid];
			const trackAudioEnabled = state.remoteAudioEnabledByUid[participant.uid];

			const videoEnabled = resolveRemoteMediaEnabled(
				socketMedia?.camera,
				trackVideoEnabled,
				remoteStreamHasActiveVideo(stream),
			);
			const audioEnabled = resolveRemoteMediaEnabled(
				socketMedia?.mic,
				trackAudioEnabled,
				remoteStreamHasActiveAudio(stream),
			);

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
			remoteAudioEnabledByUid: state.remoteAudioEnabledByUid,
			remoteMediaByUid: state.remoteMediaByUid,
			remoteStreamsByUid: state.remoteStreamsByUid,
		})),
	);

	return useMemo(() => buildVideoTiles(snapshot), [snapshot]);
}
