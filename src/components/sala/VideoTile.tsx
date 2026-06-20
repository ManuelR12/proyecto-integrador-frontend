import { memo, useEffect, useRef } from "react";
import { sala as copy } from "../../copy/es";
import type { VideoTileParticipant } from "../../types/media";
import VideoTileSkeleton from "./VideoTileSkeleton";

interface VideoTileProps {
	participant: VideoTileParticipant;
	aspectClassName?: string;
}

const VideoTile = ({ participant, aspectClassName = "aspect-video" }: VideoTileProps) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const { displayName, isLocal, stream, status } = participant;
	const hasVideoTrack = Boolean(
		stream?.getVideoTracks().some((track) => track.enabled && track.readyState === "live"),
	);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		video.srcObject = stream;
		if (stream) {
			void video.play().catch(() => {});
		}

		return () => {
			video.srcObject = null;
		};
	}, [stream]);

	if (status === "connecting") {
		return (
			<div className={["min-h-0 w-full", aspectClassName].join(" ")}>
				<VideoTileSkeleton displayName={displayName} />
			</div>
		);
	}

	return (
		<div
			className={[
				"relative min-h-0 w-full overflow-hidden rounded-xl bg-slate-900",
				isLocal ? "ring-2 ring-blue-500" : "ring-1 ring-slate-800",
				aspectClassName,
			].join(" ")}
		>
			{stream && hasVideoTrack ? (
				// Live WebRTC streams do not ship caption tracks.
				// eslint-disable-next-line jsx-a11y/media-has-caption
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted={isLocal}
					className="h-full w-full object-cover"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm text-slate-500">
					{copy.videoGrid.cameraOff}
				</div>
			)}

			<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8">
				<div className="flex items-center gap-1.5">
					<span className="max-w-full truncate text-xs font-medium text-white">{displayName}</span>
					{isLocal && (
						<span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
							{copy.videoGrid.youLabel}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default memo(VideoTile);
