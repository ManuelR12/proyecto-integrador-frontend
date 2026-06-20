import { memo, useEffect } from "react";
import { useMediaPlayback } from "../../contexts/MediaPlaybackContext";
import { useAuth } from "../../contexts/AuthContext";
import { useRoomMediaBootstrap } from "../../hooks/useRoomMediaBootstrap";
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

	useRoomMediaBootstrap(playbackUnlocked);

	useEffect(() => {
		const currentDisplayName = displayName ?? user?.displayName ?? user?.email ?? "Tú";
		useRoomStore.getState().setSessionIdentity(user?.uid ?? "local", currentDisplayName);
	}, [displayName, user?.displayName, user?.email, user?.uid]);

	if (!playbackUnlocked) {
		return null;
	}

	return <RoomMediaStage roomId={roomId} />;
};

export default memo(RoomVideoSection);
