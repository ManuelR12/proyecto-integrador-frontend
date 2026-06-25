import { create } from "zustand";
import {
	applyLocalStreamUpdate,
	attachTrackToLocalStream,
	localMediaFlagsFromStream,
	requestMediaTrack,
} from "../lib/localMediaStream";
import {
	bindLocalStreamTrackState,
	unbindLocalStreamTrackState,
} from "../lib/localStreamTrackState";
import {
	bindRemoteStreamVideoState,
	unbindRemoteStreamVideoState,
} from "../lib/remoteStreamVideoState";
import { getActiveRoomSocket } from "../lib/roomSessionSocketRef";
import type { VideoTileStatus } from "../types/media";
import type { SocketParticipant } from "../types/room";

export interface RemoteMediaState {
	mic: boolean;
	camera: boolean;
}

const DEFAULT_REMOTE_MEDIA: RemoteMediaState = { mic: true, camera: true };

interface RoomState {
	participants: SocketParticipant[];
	currentUserId: string;
	currentDisplayName: string;
	currentAvatarUrl: string | null;
	localStream: MediaStream | null;
	localStatus: VideoTileStatus;
	hasLocalVideoTrack: boolean;
	hasLocalAudioTrack: boolean;
	localVideoEnabled: boolean;
	localAudioEnabled: boolean;
	remoteVideoEnabledByUid: Record<string, boolean>;
	remoteMediaByUid: Record<string, RemoteMediaState>;
	remoteStreamsByUid: Record<string, MediaStream>;
	uidBySocketId: Record<string, string>;
	setSessionIdentity: (userId: string, displayName: string, avatarUrl?: string | null) => void;
	setParticipants: (participants: SocketParticipant[]) => void;
	addParticipant: (participant: SocketParticipant) => void;
	removeParticipant: (uid: string) => void;
	registerParticipantSocket: (uid: string, socketId: string) => void;
	resolveUidFromSocketId: (socketId: string) => string | undefined;
	setLocalStream: (stream: MediaStream | null) => void;
	setLocalStatus: (status: VideoTileStatus) => void;
	setRemoteVideoEnabled: (uid: string, videoEnabled: boolean) => void;
	setRemoteMediaState: (uid: string, state: Partial<RemoteMediaState>) => void;
	toggleLocalVideo: () => void;
	toggleLocalAudio: () => void;
	registerRemoteStream: (uid: string, stream: MediaStream) => void;
	removeRemoteStream: (uid: string) => void;
	reset: () => void;
}

const initialState = {
	participants: [] as SocketParticipant[],
	currentUserId: "local",
	currentDisplayName: "Tú",
	currentAvatarUrl: null as string | null,
	localStream: null as MediaStream | null,
	localStatus: "connecting" as VideoTileStatus,
	hasLocalVideoTrack: false,
	hasLocalAudioTrack: false,
	localVideoEnabled: false,
	localAudioEnabled: false,
	remoteVideoEnabledByUid: {} as Record<string, boolean>,
	remoteMediaByUid: {} as Record<string, RemoteMediaState>,
	remoteStreamsByUid: {} as Record<string, MediaStream>,
	uidBySocketId: {} as Record<string, string>,
};

function registerParticipantSockets(participants: SocketParticipant[]): Record<string, string> {
	const uidBySocketId: Record<string, string> = {};
	for (const participant of participants) {
		if (participant.socketId) {
			uidBySocketId[participant.socketId] = participant.uid;
		}
	}
	return uidBySocketId;
}

function emitLocalMediaState(micEnabled: boolean, cameraEnabled: boolean): void {
	getActiveRoomSocket()?.sendMediaStateChanged(!micEnabled, !cameraEnabled);
}

function syncLocalMediaFlags(
	set: (partial: Partial<RoomState>) => void,
	stream: MediaStream | null,
) {
	set(localMediaFlagsFromStream(stream));
}

export const useRoomStore = create<RoomState>((set, get) => ({
	...initialState,
	setSessionIdentity: (currentUserId, currentDisplayName, avatarUrl = null) =>
		set((state) => {
			const nextAvatar = avatarUrl ?? null;
			if (
				state.currentUserId === currentUserId &&
				state.currentDisplayName === currentDisplayName &&
				state.currentAvatarUrl === nextAvatar
			) {
				return state;
			}
			return { currentUserId, currentDisplayName, currentAvatarUrl: nextAvatar };
		}),
	setParticipants: (participants) =>
		set((state) => ({
			participants,
			uidBySocketId: {
				...state.uidBySocketId,
				...registerParticipantSockets(participants),
			},
		})),
	addParticipant: (participant) =>
		set((state) => {
			if (state.participants.some((entry) => entry.uid === participant.uid)) {
				return state;
			}
			const uidBySocketId = { ...state.uidBySocketId };
			if (participant.socketId) {
				uidBySocketId[participant.socketId] = participant.uid;
			}
			return {
				participants: [...state.participants, participant],
				uidBySocketId,
			};
		}),
	registerParticipantSocket: (uid, socketId) =>
		set((state) => {
			if (state.uidBySocketId[socketId] === uid) return state;
			return { uidBySocketId: { ...state.uidBySocketId, [socketId]: uid } };
		}),
	resolveUidFromSocketId: (socketId) => get().uidBySocketId[socketId],
	removeParticipant: (uid) =>
		set((state) => {
			unbindRemoteStreamVideoState(uid);
			const remoteStream = state.remoteStreamsByUid[uid];
			remoteStream?.getTracks().forEach((track) => track.stop());
			const remoteStreamsByUid = { ...state.remoteStreamsByUid };
			const remoteVideoEnabledByUid = { ...state.remoteVideoEnabledByUid };
			const remoteMediaByUid = { ...state.remoteMediaByUid };
			const uidBySocketId = { ...state.uidBySocketId };
			delete remoteStreamsByUid[uid];
			delete remoteVideoEnabledByUid[uid];
			delete remoteMediaByUid[uid];
			for (const [socketId, mappedUid] of Object.entries(uidBySocketId)) {
				if (mappedUid === uid) delete uidBySocketId[socketId];
			}
			return {
				participants: state.participants.filter((entry) => entry.uid !== uid),
				remoteStreamsByUid,
				remoteVideoEnabledByUid,
				remoteMediaByUid,
				uidBySocketId,
			};
		}),
	setLocalStream: (localStream) => {
		const previous = get().localStream;
		if (previous && previous !== localStream) {
			unbindLocalStreamTrackState(previous);
		}

		if (localStream) {
			bindLocalStreamTrackState(localStream, () => {
				syncLocalMediaFlags(set, localStream);
			});
		}

		set({ localStream, ...localMediaFlagsFromStream(localStream) });
	},
	setLocalStatus: (localStatus) => set({ localStatus }),
	toggleLocalVideo: () => {
		const { localStream } = get();
		const track = localStream?.getVideoTracks()[0];
		if (track) {
			const nextEnabled = !track.enabled;
			track.enabled = nextEnabled;
			const nextState = { localVideoEnabled: nextEnabled };
			set(nextState);
			emitLocalMediaState(get().localAudioEnabled, nextEnabled);
			return;
		}

		void requestMediaTrack("video").then((videoTrack) => {
			if (!videoTrack) return;

			const nextStream = attachTrackToLocalStream(get().localStream, videoTrack);
			get().setLocalStream(nextStream);
			applyLocalStreamUpdate(nextStream);
			emitLocalMediaState(get().localAudioEnabled, true);
		});
	},
	toggleLocalAudio: () => {
		const { localStream } = get();
		const track = localStream?.getAudioTracks()[0];
		if (track) {
			const nextEnabled = !track.enabled;
			track.enabled = nextEnabled;
			set({ localAudioEnabled: nextEnabled });
			emitLocalMediaState(nextEnabled, get().localVideoEnabled);
			return;
		}

		void requestMediaTrack("audio").then((audioTrack) => {
			if (!audioTrack) return;

			const nextStream = attachTrackToLocalStream(get().localStream, audioTrack);
			get().setLocalStream(nextStream);
			applyLocalStreamUpdate(nextStream);
			emitLocalMediaState(true, get().localVideoEnabled);
		});
	},
	registerRemoteStream: (uid, stream) => {
		bindRemoteStreamVideoState(uid, stream, (videoEnabled) => {
			get().setRemoteVideoEnabled(uid, videoEnabled);
		});
		set((state) => ({
			remoteStreamsByUid: { ...state.remoteStreamsByUid, [uid]: stream },
		}));
	},
	setRemoteVideoEnabled: (uid, videoEnabled) =>
		set((state) => {
			if (state.remoteVideoEnabledByUid[uid] === videoEnabled) return state;
			return {
				remoteVideoEnabledByUid: { ...state.remoteVideoEnabledByUid, [uid]: videoEnabled },
			};
		}),
	setRemoteMediaState: (uid, partial) =>
		set((state) => {
			const current = state.remoteMediaByUid[uid] ?? DEFAULT_REMOTE_MEDIA;
			const next = { ...current, ...partial };
			if (current.mic === next.mic && current.camera === next.camera) {
				return state;
			}
			return {
				remoteMediaByUid: { ...state.remoteMediaByUid, [uid]: next },
			};
		}),
	removeRemoteStream: (uid) => {
		const existing = get().remoteStreamsByUid[uid];
		if (!existing) return;
		unbindRemoteStreamVideoState(uid);
		existing.getTracks().forEach((track) => track.stop());
		set((state) => {
			const next = { ...state.remoteStreamsByUid };
			const remoteVideoEnabledByUid = { ...state.remoteVideoEnabledByUid };
			const remoteMediaByUid = { ...state.remoteMediaByUid };
			delete next[uid];
			delete remoteVideoEnabledByUid[uid];
			delete remoteMediaByUid[uid];
			return { remoteStreamsByUid: next, remoteVideoEnabledByUid, remoteMediaByUid };
		});
	},
	reset: () => {
		const { localStream, remoteStreamsByUid } = get();
		unbindLocalStreamTrackState(localStream);
		localStream?.getTracks().forEach((track) => track.stop());
		for (const uid of Object.keys(remoteStreamsByUid)) {
			unbindRemoteStreamVideoState(uid);
		}
		Object.values(remoteStreamsByUid).forEach((stream) => {
			stream.getTracks().forEach((track) => track.stop());
		});
		set(initialState);
	},
}));

export function selectParticipantCount(state: RoomState) {
	return state.participants.length + 1;
}
