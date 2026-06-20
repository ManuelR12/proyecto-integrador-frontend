import { useMediaPlayback } from "../../contexts/MediaPlaybackContext";
import { useRoomMediaStreams } from "../../hooks/useRoomMediaStreams";
import type { SocketParticipant } from "../../types/room";
import VideoGrid from "./VideoGrid";

interface RoomMediaStageProps {
	roomId: string;
	currentDisplayName: string;
	currentUserId: string;
	remoteParticipants: SocketParticipant[];
}

/**
 * AV stage wrapper. Only mounts after the lobby unlocks playback so WebRTC
 * streams can autoplay without Chrome blocking them.
 */
const RoomMediaStage = ({
	roomId,
	currentDisplayName,
	currentUserId,
	remoteParticipants,
}: RoomMediaStageProps) => {
	const { playbackUnlocked } = useMediaPlayback();
	const { tiles } = useRoomMediaStreams({
		roomId,
		currentUserId,
		currentDisplayName,
		remoteParticipants,
		enabled: playbackUnlocked,
	});

	if (!playbackUnlocked) {
		return null;
	}

	return (
		<div className="flex h-full min-h-0 w-full max-w-5xl flex-1 items-center justify-center overflow-hidden">
			<VideoGrid tiles={tiles} />
		</div>
	);
};

export default RoomMediaStage;
