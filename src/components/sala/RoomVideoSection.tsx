import { memo, useLayoutEffect } from "react";
import { useMediaPlayback } from "../../contexts/MediaPlaybackContext";
import { useAuth } from "../../contexts/AuthContext";
import { useRoomMediaBootstrap } from "../../hooks/useRoomMediaBootstrap";
import { useRoomWebRtc } from "../../hooks/useRoomWebRtc";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useRoomStore } from "../../stores/useRoomStore";
import RoomMediaStage from "./RoomMediaStage";

interface RoomVideoSectionProps {
	roomId: string;
}

const RoomVideoSection = ({ roomId }: RoomVideoSectionProps) => {
	const { user } = useAuth();
	const { displayName } = useUserProfile();
	const { playbackUnlocked } = useMediaPlayback();
	const currentDisplayName = displayName ?? user?.displayName ?? user?.email ?? "Tú";
	const currentUserId = user?.uid ?? "local";

	useLayoutEffect(() => {
		useRoomStore.getState().setSessionIdentity(currentUserId, currentDisplayName);
	}, [currentDisplayName, currentUserId]);

	useRoomMediaBootstrap(playbackUnlocked);
	useRoomWebRtc(roomId, playbackUnlocked);

	if (!playbackUnlocked) {
		return null;
	}

	return (
		<div className="flex min-h-0 w-full flex-1 flex-col">
			<RoomMediaStage roomId={roomId} />
		</div>
	);
};

export default memo(RoomVideoSection);
