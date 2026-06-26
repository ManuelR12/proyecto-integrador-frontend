import { memo, useMemo } from "react";
import { sala as copy } from "../../copy/es";
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

function resolveFeaturedIndex(tiles: VideoTileParticipant[]): number {
	const featured = tiles.findIndex((tile) => tile.isFeatured);
	if (featured >= 0) return featured;

	return tiles.findIndex((tile) => tile.isScreenSharing);
}

const MOBILE_FILMSTRIP_TILE = "h-[4.5rem] w-[5.5rem] shrink-0 snap-start sm:h-24 sm:w-32";

const VideoGrid = ({ tiles }: VideoGridProps) => {
	const tileCount = tiles.length;
	const featuredIndex = resolveFeaturedIndex(tiles);
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
		const featuredParticipant = { ...featuredTile, isFeatured: true };

		return (
			<>
				{/* Mobile: featured stage + horizontal scroll filmstrip */}
				<div
					role="group"
					aria-label={ariaLabel}
					data-layout="screenShareMobile"
					data-participants={tileCount}
					className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden sm:gap-2.5 lg:hidden"
				>
					<div className="flex min-h-0 min-w-0 flex-1 basis-0">
						<VideoTile
							key={featuredTile.uid}
							participant={featuredParticipant}
							layoutClassName="min-h-0 min-w-0 h-full w-full"
							compact={false}
						/>
					</div>

					{participantStrip.length > 0 ? (
						<div
							role="group"
							aria-label={copy.videoGrid.participantsStrip(participantStrip.length)}
							className="flex shrink-0 snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
						>
							{participantStrip.map((participant) => (
								<VideoTile
									key={participant.uid}
									participant={participant}
									layoutClassName={MOBILE_FILMSTRIP_TILE}
									compact
								/>
							))}
						</div>
					) : null}
				</div>

				{/* Desktop: featured tile + vertical side filmstrip */}
				<div
					role="group"
					aria-label={ariaLabel}
					data-layout={layout.pattern}
					data-participants={tileCount}
					className={[
						"hidden min-h-0 min-w-0 w-full flex-1 gap-3 overflow-hidden lg:grid",
						layout.containerClass,
					].join(" ")}
				>
					{tiles.map((participant, index) => (
						<VideoTile
							key={participant.uid}
							participant={
								index === featuredIndex ? { ...participant, isFeatured: true } : participant
							}
							layoutClassName={layout.getTileClass(index)}
							compact={index !== featuredIndex}
						/>
					))}
				</div>
			</>
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
