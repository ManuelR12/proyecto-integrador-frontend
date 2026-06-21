import { memo, useLayoutEffect } from "react";
import { useMediaPlayback } from "../../contexts/MediaPlaybackContext";
import { useAuth } from "../../contexts/AuthContext";
import { useLiveKitRoom } from "../../hooks/useLiveKitRoom";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useRoomStore } from "../../stores/useRoomStore";
import RoomMediaControls from "./RoomMediaControls";
import RoomMediaStage from "./RoomMediaStage";

interface RoomVideoSectionProps {
	roomId: string;
}

const RoomVideoSection = ({ roomId }: RoomVideoSectionProps) => {
	const { user } = useAuth();
	const { displayName, avatarUrl } = useUserProfile();
	const { playbackUnlocked } = useMediaPlayback();
	const currentDisplayName = displayName ?? user?.displayName ?? user?.email ?? "Tú";
	const currentAvatarUrl = avatarUrl ?? user?.photoURL ?? null;
	const currentUserId = user?.uid ?? "local";

	useLayoutEffect(() => {
		useRoomStore.getState().setSessionIdentity(currentUserId, currentDisplayName, currentAvatarUrl);
	}, [currentAvatarUrl, currentDisplayName, currentUserId]);

	useLiveKitRoom(roomId, playbackUnlocked);

	if (!playbackUnlocked) {
		return null;
	}

	return (
		<div className="flex min-h-0 w-full flex-1 flex-col">
			<RoomMediaStage roomId={roomId} />
			<RoomMediaControls />
		</div>
	);
};

export default memo(RoomVideoSection);
