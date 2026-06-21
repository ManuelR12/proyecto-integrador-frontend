import { create } from "zustand";
import {
	applyLocalStreamUpdate,
	attachTrackToLocalStream,
	localMediaFlagsFromStream,
	requestMediaTrack,
} from "../lib/localMediaStream";
import {
	bindRemoteStreamVideoState,
	unbindRemoteStreamVideoState,
} from "../lib/remoteStreamVideoState";
import { getActivePeerManager } from "../lib/roomWebRtcRef";
import type { VideoTileStatus } from "../types/media";
import type { SocketParticipant } from "../types/room";

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
			unbindRemoteStreamVideoState(uid);
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
	setLocalStream: (localStream) => set({ localStream, ...localMediaFlagsFromStream(localStream) }),
	setLocalStatus: (localStatus) => set({ localStatus }),
	toggleLocalVideo: () => {
		const { localStream } = get();
		const track = localStream?.getVideoTracks()[0];
		if (track) {
			const nextEnabled = !track.enabled;
			track.enabled = nextEnabled;
			getActivePeerManager()?.setLocalVideoEnabled(nextEnabled);
			set({ localVideoEnabled: nextEnabled });
			return;
		}

		void requestMediaTrack("video").then((videoTrack) => {
			if (!videoTrack) return;

			const nextStream = attachTrackToLocalStream(get().localStream, videoTrack);
			set({ localStream: nextStream, ...localMediaFlagsFromStream(nextStream) });
			applyLocalStreamUpdate(nextStream);
		});
	},
	toggleLocalAudio: () => {
		const { localStream } = get();
		const track = localStream?.getAudioTracks()[0];
		if (track) {
			track.enabled = !track.enabled;
			set({ localAudioEnabled: track.enabled });
			return;
		}

		void requestMediaTrack("audio").then((audioTrack) => {
			if (!audioTrack) return;

			const nextStream = attachTrackToLocalStream(get().localStream, audioTrack);
			set({ localStream: nextStream, ...localMediaFlagsFromStream(nextStream) });
			applyLocalStreamUpdate(nextStream);
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
	removeRemoteStream: (uid) => {
		const existing = get().remoteStreamsByUid[uid];
		if (!existing) return;
		unbindRemoteStreamVideoState(uid);
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
