import { Track } from "livekit-client";
import { create } from "zustand";
import { getActiveLiveKitRoom } from "../lib/roomLiveKitRef";
import type { VideoTileStatus } from "../types/media";
import type { SocketParticipant } from "../types/room";

interface LocalMediaState {
	hasLocalVideoTrack: boolean;
	hasLocalAudioTrack: boolean;
	localVideoEnabled: boolean;
	localAudioEnabled: boolean;
}

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
	remoteStreamsByUid: Record<string, MediaStream>;
	setSessionIdentity: (userId: string, displayName: string, avatarUrl?: string | null) => void;
	setParticipants: (participants: SocketParticipant[]) => void;
	addParticipant: (participant: SocketParticipant) => void;
	removeParticipant: (uid: string) => void;
	setLocalStream: (stream: MediaStream | null) => void;
	setLocalStatus: (status: VideoTileStatus) => void;
	setLocalMediaState: (state: LocalMediaState) => void;
	setRemoteVideoEnabled: (uid: string, videoEnabled: boolean) => void;
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
	remoteStreamsByUid: {} as Record<string, MediaStream>,
};

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
	setParticipants: (participants) => set({ participants }),
	addParticipant: (participant) =>
		set((state) =>
			state.participants.some((entry) => entry.uid === participant.uid)
				? state
				: { participants: [...state.participants, participant] },
		),
	removeParticipant: (uid) =>
		set((state) => {
			const remoteStream = state.remoteStreamsByUid[uid];
			remoteStream?.getTracks().forEach((track) => track.stop());
			const remoteStreamsByUid = { ...state.remoteStreamsByUid };
			const remoteVideoEnabledByUid = { ...state.remoteVideoEnabledByUid };
			delete remoteStreamsByUid[uid];
			delete remoteVideoEnabledByUid[uid];
			return {
				participants: state.participants.filter((entry) => entry.uid !== uid),
				remoteStreamsByUid,
				remoteVideoEnabledByUid,
			};
		}),
	setLocalStream: (localStream) => set({ localStream }),
	setLocalStatus: (localStatus) => set({ localStatus }),
	setLocalMediaState: (mediaState) => set(mediaState),
	toggleLocalVideo: () => {
		const room = getActiveLiveKitRoom();
		if (!room) return;

		const nextEnabled = !get().localVideoEnabled;
		void room.localParticipant.setCameraEnabled(nextEnabled).then(() => {
			const { localParticipant } = room;
			set({
				localVideoEnabled: nextEnabled,
				hasLocalVideoTrack: Boolean(localParticipant.getTrackPublication(Track.Source.Camera)),
			});
		});
	},
	toggleLocalAudio: () => {
		const room = getActiveLiveKitRoom();
		if (!room) return;

		const nextEnabled = !get().localAudioEnabled;
		void room.localParticipant.setMicrophoneEnabled(nextEnabled).then(() => {
			const { localParticipant } = room;
			set({
				localAudioEnabled: nextEnabled,
				hasLocalAudioTrack: Boolean(localParticipant.getTrackPublication(Track.Source.Microphone)),
			});
		});
	},
	registerRemoteStream: (uid, stream) =>
		set((state) => ({
			remoteStreamsByUid: { ...state.remoteStreamsByUid, [uid]: stream },
		})),
	setRemoteVideoEnabled: (uid, videoEnabled) =>
		set((state) => {
			if (state.remoteVideoEnabledByUid[uid] === videoEnabled) return state;
			return {
				remoteVideoEnabledByUid: { ...state.remoteVideoEnabledByUid, [uid]: videoEnabled },
			};
		}),
	removeRemoteStream: (uid) => {
		const existing = get().remoteStreamsByUid[uid];
		if (!existing) return;
		existing.getTracks().forEach((track) => track.stop());
		set((state) => {
			const next = { ...state.remoteStreamsByUid };
			const remoteVideoEnabledByUid = { ...state.remoteVideoEnabledByUid };
			delete next[uid];
			delete remoteVideoEnabledByUid[uid];
			return { remoteStreamsByUid: next, remoteVideoEnabledByUid };
		});
	},
	reset: () => {
		const { localStream, remoteStreamsByUid } = get();
		localStream?.getTracks().forEach((track) => track.stop());
		Object.values(remoteStreamsByUid).forEach((stream) => {
			stream.getTracks().forEach((track) => track.stop());
		});
		set(initialState);
	},
}));

export function selectParticipantCount(state: RoomState) {
	return state.participants.length + 1;
}
