import { memo, useMemo } from "react";
import { getVideoGridClass, getVideoTileAspectClass } from "../../lib/videoGridLayout";
import type { VideoTileParticipant } from "../../types/media";
import VideoTile from "./VideoTile";

interface VideoGridProps {
	tiles: VideoTileParticipant[];
}

const VideoGrid = ({ tiles }: VideoGridProps) => {
	const tileCount = tiles.length;
	const gridClass = useMemo(() => getVideoGridClass(tileCount), [tileCount]);
	const aspectClass = useMemo(() => getVideoTileAspectClass(tileCount), [tileCount]);

	if (tileCount === 0) {
		return null;
	}

	return (
		<div
			className={[
				"grid h-full w-full max-w-5xl auto-rows-fr gap-3 overflow-hidden",
				gridClass,
			].join(" ")}
		>
			{tiles.map((participant) => (
				<VideoTile key={participant.uid} participant={participant} aspectClassName={aspectClass} />
			))}
		</div>
	);
};

export default memo(VideoGrid);
