import { memo, useMemo } from "react";
import { getVideoGridAriaLabel, getVideoGridLayout } from "../../lib/videoGridLayout";
import type { VideoTileParticipant } from "../../types/media";
import VideoTile from "./VideoTile";

interface VideoGridProps {
	tiles: VideoTileParticipant[];
}

const VideoGrid = ({ tiles }: VideoGridProps) => {
	const tileCount = tiles.length;
	const layout = useMemo(() => getVideoGridLayout(tileCount), [tileCount]);
	const ariaLabel = useMemo(
		() => getVideoGridAriaLabel(tileCount, layout.pattern),
		[tileCount, layout.pattern],
	);

	if (tileCount === 0) {
		return null;
	}

	return (
		<div
			role="group"
			aria-label={ariaLabel}
			data-layout={layout.pattern}
			data-participants={tileCount}
			className={[
				"grid min-h-0 min-w-0 w-full flex-1 gap-2 overflow-hidden sm:gap-3",
				layout.containerClass,
			].join(" ")}
		>
			{tiles.map((participant, index) => (
				<VideoTile
					key={participant.uid}
					participant={participant}
					layoutClassName={layout.getTileClass(index)}
					compact={tileCount >= 4}
				/>
			))}
		</div>
	);
};

export default memo(VideoGrid);
