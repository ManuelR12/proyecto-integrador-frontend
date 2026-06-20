import { useCallback, useEffect, useMemo, useState } from "react";
import type { SocketParticipant } from "../types/room";
import type { VideoTileParticipant, VideoTileStatus } from "../types/media";

interface UseRoomMediaStreamsOptions {
	roomId: string;
	currentUserId: string;
	currentDisplayName: string;
	remoteParticipants: SocketParticipant[];
	enabled: boolean;
}

export function useRoomMediaStreams({
	currentUserId,
	currentDisplayName,
	remoteParticipants,
	enabled,
}: UseRoomMediaStreamsOptions) {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [localStatus, setLocalStatus] = useState<VideoTileStatus>("connecting");
	const [remoteStreamsByUid, setRemoteStreamsByUid] = useState<Record<string, MediaStream>>({});

	const registerRemoteStream = useCallback((uid: string, stream: MediaStream) => {
		setRemoteStreamsByUid((prev) => ({ ...prev, [uid]: stream }));
	}, []);

	const removeRemoteStream = useCallback((uid: string) => {
		setRemoteStreamsByUid((prev) => {
			const existing = prev[uid];
			if (!existing) return prev;
			existing.getTracks().forEach((track) => track.stop());
			const next = { ...prev };
			delete next[uid];
			return next;
		});
	}, []);

	useEffect(() => {
		if (!enabled) return;

		let stream: MediaStream | null = null;
		let cancelled = false;

		void navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((mediaStream) => {
				if (cancelled) {
					mediaStream.getTracks().forEach((track) => track.stop());
					return;
				}
				stream = mediaStream;
				setLocalStream(mediaStream);
				setLocalStatus("connected");
			})
			.catch(() => {
				if (!cancelled) {
					setLocalStream(null);
					setLocalStatus("failed");
				}
			});

		return () => {
			cancelled = true;
			stream?.getTracks().forEach((track) => track.stop());
		};
	}, [enabled]);

	const tiles = useMemo<VideoTileParticipant[]>(() => {
		const localTile: VideoTileParticipant = {
			uid: currentUserId,
			displayName: currentDisplayName,
			isLocal: true,
			stream: localStream,
			status: localStatus,
		};

		const remoteTiles = remoteParticipants
			.filter((participant) => participant.uid !== currentUserId)
			.map((participant) => {
				const stream = remoteStreamsByUid[participant.uid] ?? null;
				return {
					uid: participant.uid,
					displayName: participant.username,
					isLocal: false,
					stream,
					status: stream ? ("connected" as const) : ("connecting" as const),
					avatarUrl: participant.avatarUrl,
				};
			});

		return [localTile, ...remoteTiles];
	}, [
		currentDisplayName,
		currentUserId,
		localStatus,
		localStream,
		remoteParticipants,
		remoteStreamsByUid,
	]);

	return {
		tiles,
		localStream,
		registerRemoteStream,
		removeRemoteStream,
	};
}
