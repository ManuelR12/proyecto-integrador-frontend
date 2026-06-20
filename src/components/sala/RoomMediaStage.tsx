import { memo } from "react";
import { useMediaPlayback } from "../../contexts/MediaPlaybackContext";
import { useVideoTiles } from "../../hooks/useVideoTiles";
import VideoGrid from "./VideoGrid";

interface RoomMediaStageProps {
	roomId: string;
}

/**
 * AV stage wrapper. Reads only from the room store so chat updates never
 * trigger re-renders here.
 */
const RoomMediaStage = ({ roomId }: RoomMediaStageProps) => {
	void roomId;
	const { playbackUnlocked } = useMediaPlayback();
	const tiles = useVideoTiles();

	if (!playbackUnlocked) {
		return null;
	}

	return (
		<div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
			<VideoGrid tiles={tiles} />
		</div>
	);
};

export default memo(RoomMediaStage);
