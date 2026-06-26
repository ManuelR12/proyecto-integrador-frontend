import { memo, useMemo } from "react";
import {
	getScreenShareGridLayout,
	getVideoGridAriaLabel,
	getVideoGridLayout,
} from "../../lib/videoGridLayout";
import type { VideoTileParticipant } from "../../types/media";
import VideoTile from "./VideoTile";

interface VideoGridProps {
	tiles: VideoTileParticipant[];
}

const VideoGrid = ({ tiles }: VideoGridProps) => {
	const tileCount = tiles.length;
	const featuredIndex = tiles.findIndex((tile) => tile.isFeatured);
	const useScreenShareLayout = featuredIndex >= 0;

	const layout = useMemo(
		() =>
			useScreenShareLayout
				? getScreenShareGridLayout(tileCount, featuredIndex)
				: getVideoGridLayout(tileCount),
		[tileCount, featuredIndex, useScreenShareLayout],
	);

	const ariaLabel = useMemo(
		() => getVideoGridAriaLabel(tileCount, layout.pattern),
		[tileCount, layout.pattern],
	);

	if (tileCount === 0) {
		return null;
	}

	if (useScreenShareLayout) {
		const featuredTile = tiles[featuredIndex];
		const participantStrip = tiles.filter((_, index) => index !== featuredIndex);

		return (
			<div
				role="group"
				aria-label={ariaLabel}
				data-layout={layout.pattern}
				data-participants={tileCount}
				className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden sm:gap-3"
			>
				<VideoTile
					key={featuredTile.uid}
					participant={featuredTile}
					layoutClassName="min-h-0 min-w-0 h-full w-full flex-1"
					compact={false}
				/>

				{participantStrip.length > 0 ? (
					<div
						role="group"
						aria-label={`Participantes (${participantStrip.length})`}
						className="flex shrink-0 gap-2 overflow-x-auto pb-1"
					>
						{participantStrip.map((participant) => (
							<VideoTile
								key={participant.uid}
								participant={participant}
								layoutClassName="h-24 w-36 shrink-0 sm:h-28 sm:w-44"
								compact
							/>
						))}
					</div>
				) : null}
			</div>
		);
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
