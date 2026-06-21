import type { LocalParticipant, RemoteParticipant } from "livekit-client";
import { Track } from "livekit-client";

type MediaParticipant = LocalParticipant | RemoteParticipant;

/** Builds a single MediaStream from a participant's subscribed camera/mic tracks. */
export function participantMediaStream(participant: MediaParticipant): MediaStream | null {
	const tracks: MediaStreamTrack[] = [];

	for (const publication of participant.trackPublications.values()) {
		const track = publication.track;
		if (!track || publication.isMuted) continue;
		if (publication.kind === Track.Kind.Video || publication.kind === Track.Kind.Audio) {
			tracks.push(track.mediaStreamTrack);
		}
	}

	return tracks.length > 0 ? new MediaStream(tracks) : null;
}

export function participantHasCameraTrack(participant: MediaParticipant): boolean {
	return Boolean(participant.getTrackPublication(Track.Source.Camera)?.track);
}

export function participantHasMicrophoneTrack(participant: MediaParticipant): boolean {
	return Boolean(participant.getTrackPublication(Track.Source.Microphone)?.track);
}

export function participantCameraEnabled(participant: MediaParticipant): boolean {
	const publication = participant.getTrackPublication(Track.Source.Camera);
	const track = publication?.track;
	if (!publication || !track || publication.isMuted) return false;
	return track.mediaStreamTrack.readyState === "live" && track.mediaStreamTrack.enabled;
}

export function participantMicrophoneEnabled(participant: MediaParticipant): boolean {
	const publication = participant.getTrackPublication(Track.Source.Microphone);
	const track = publication?.track;
	if (!publication || !track || publication.isMuted) return false;
	return track.mediaStreamTrack.readyState === "live" && track.mediaStreamTrack.enabled;
}
