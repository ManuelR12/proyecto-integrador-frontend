import {
	LocalParticipant,
	Participant,
	RemoteParticipant,
	Room,
	RoomEvent,
	Track,
	TrackPublication,
} from "livekit-client";
import { useEffect } from "react";
import {
	participantCameraEnabled,
	participantHasCameraTrack,
	participantHasMicrophoneTrack,
	participantMediaStream,
	participantMicrophoneEnabled,
} from "../lib/livekitMedia";
import { getActiveLiveKitRoom, setActiveLiveKitRoom } from "../lib/roomLiveKitRef";
import { fetchLiveKitToken } from "../services/livekitService";
import { useRoomStore } from "../stores/useRoomStore";

function syncLocalParticipant(participant: LocalParticipant): void {
	const store = useRoomStore.getState();
	const stream = participantMediaStream(participant);

	store.setLocalStream(stream);
	store.setLocalMediaState({
		hasLocalVideoTrack: participantHasCameraTrack(participant),
		hasLocalAudioTrack: participantHasMicrophoneTrack(participant),
		localVideoEnabled: participantCameraEnabled(participant),
		localAudioEnabled: participantMicrophoneEnabled(participant),
	});
}

function syncRemoteParticipant(participant: RemoteParticipant): void {
	const uid = participant.identity;
	const stream = participantMediaStream(participant);

	if (stream) {
		useRoomStore.getState().registerRemoteStream(uid, stream);
		useRoomStore.getState().setRemoteVideoEnabled(uid, participantCameraEnabled(participant));
		return;
	}

	useRoomStore.getState().removeRemoteStream(uid);
}

function bindRoomEvents(room: Room): () => void {
	const onLocalTrackChange = () => {
		syncLocalParticipant(room.localParticipant);
	};

	const onTrackSubscribed = (
		_track: Track,
		_publication: unknown,
		participant: RemoteParticipant,
	) => {
		syncRemoteParticipant(participant);
	};

	const onTrackUnsubscribed = (
		_track: Track,
		_publication: unknown,
		participant: RemoteParticipant,
	) => {
		syncRemoteParticipant(participant);
	};

	const onTrackMuted = (_publication: TrackPublication, participant: Participant) => {
		if (participant instanceof LocalParticipant) {
			syncLocalParticipant(participant);
			return;
		}
		if (participant instanceof RemoteParticipant) {
			syncRemoteParticipant(participant);
		}
	};

	const onTrackUnmuted = (_publication: TrackPublication, participant: Participant) => {
		if (participant instanceof LocalParticipant) {
			syncLocalParticipant(participant);
			return;
		}
		if (participant instanceof RemoteParticipant) {
			syncRemoteParticipant(participant);
		}
	};

	const onParticipantConnected = (participant: RemoteParticipant) => {
		syncRemoteParticipant(participant);
	};

	const onParticipantDisconnected = (participant: RemoteParticipant) => {
		useRoomStore.getState().removeRemoteStream(participant.identity);
	};

	room.on(RoomEvent.LocalTrackPublished, onLocalTrackChange);
	room.on(RoomEvent.LocalTrackUnpublished, onLocalTrackChange);
	room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
	room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
	room.on(RoomEvent.TrackMuted, onTrackMuted);
	room.on(RoomEvent.TrackUnmuted, onTrackUnmuted);
	room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
	room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);

	return () => {
		room.off(RoomEvent.LocalTrackPublished, onLocalTrackChange);
		room.off(RoomEvent.LocalTrackUnpublished, onLocalTrackChange);
		room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
		room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
		room.off(RoomEvent.TrackMuted, onTrackMuted);
		room.off(RoomEvent.TrackUnmuted, onTrackUnmuted);
		room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
		room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
	};
}

async function enableLocalMedia(room: Room): Promise<void> {
	try {
		await room.localParticipant.setCameraEnabled(true);
		await room.localParticipant.setMicrophoneEnabled(true);
	} catch {
		try {
			await room.localParticipant.setMicrophoneEnabled(true);
		} catch {
			// User may deny permissions; tile falls back to avatar.
		}
	}
}

/**
 * Connects to LiveKit for the study room and mirrors track state into useRoomStore.
 * Socket.io remains the source of participant names/avatars.
 */
export function useLiveKitRoom(roomId: string | undefined, enabled: boolean) {
	useEffect(() => {
		if (!enabled || !roomId) return;

		let cancelled = false;
		const room = new Room({
			adaptiveStream: true,
			dynacast: true,
		});

		setActiveLiveKitRoom(room);
		const unbindRoomEvents = bindRoomEvents(room);
		useRoomStore.getState().setLocalStatus("connecting");

		void (async () => {
			try {
				const credentials = await fetchLiveKitToken(roomId);
				if (cancelled) return;

				await room.connect(credentials.url, credentials.token);
				if (cancelled) return;

				await enableLocalMedia(room);
				if (cancelled) return;

				useRoomStore.getState().setLocalStatus("connected");
				syncLocalParticipant(room.localParticipant);

				for (const participant of room.remoteParticipants.values()) {
					syncRemoteParticipant(participant);
				}
			} catch (error) {
				console.error("[LiveKit] failed to connect", error);
				if (!cancelled) {
					useRoomStore.getState().setLocalStream(null);
					useRoomStore.getState().setLocalStatus("failed");
				}
			}
		})();

		return () => {
			cancelled = true;
			unbindRoomEvents();
			if (getActiveLiveKitRoom() === room) {
				setActiveLiveKitRoom(null);
			}
			void room.disconnect();
		};
	}, [enabled, roomId]);
}
