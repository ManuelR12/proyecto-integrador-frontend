import { create } from "zustand";
import type { VideoTileStatus } from "../types/media";
import type { SocketParticipant } from "../types/room";

interface RoomState {
	participants: SocketParticipant[];
	currentUserId: string;
	currentDisplayName: string;
	localStream: MediaStream | null;
	localStatus: VideoTileStatus;
	remoteStreamsByUid: Record<string, MediaStream>;
	setSessionIdentity: (userId: string, displayName: string) => void;
	setParticipants: (participants: SocketParticipant[]) => void;
	addParticipant: (participant: SocketParticipant) => void;
	removeParticipant: (uid: string) => void;
	setLocalStream: (stream: MediaStream | null) => void;
	setLocalStatus: (status: VideoTileStatus) => void;
	registerRemoteStream: (uid: string, stream: MediaStream) => void;
	removeRemoteStream: (uid: string) => void;
	reset: () => void;
}

const initialState = {
	participants: [] as SocketParticipant[],
	currentUserId: "local",
	currentDisplayName: "Tú",
	localStream: null as MediaStream | null,
	localStatus: "connecting" as VideoTileStatus,
	remoteStreamsByUid: {} as Record<string, MediaStream>,
};

export const useRoomStore = create<RoomState>((set, get) => ({
	...initialState,
	setSessionIdentity: (currentUserId, currentDisplayName) =>
		set({ currentUserId, currentDisplayName }),
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
			delete remoteStreamsByUid[uid];
			return {
				participants: state.participants.filter((entry) => entry.uid !== uid),
				remoteStreamsByUid,
			};
		}),
	setLocalStream: (localStream) => set({ localStream }),
	setLocalStatus: (localStatus) => set({ localStatus }),
	registerRemoteStream: (uid, stream) =>
		set((state) => ({
			remoteStreamsByUid: { ...state.remoteStreamsByUid, [uid]: stream },
		})),
	removeRemoteStream: (uid) => {
		const existing = get().remoteStreamsByUid[uid];
		if (!existing) return;
		existing.getTracks().forEach((track) => track.stop());
		set((state) => {
			const next = { ...state.remoteStreamsByUid };
			delete next[uid];
			return { remoteStreamsByUid: next };
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
