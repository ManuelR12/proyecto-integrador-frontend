import { memo, useEffect, useRef } from "react";
import { sala as copy } from "../../copy/es";
import type { VideoTileParticipant } from "../../types/media";
import VideoTileSkeleton from "./VideoTileSkeleton";

interface VideoTileProps {
	participant: VideoTileParticipant;
	layoutClassName?: string;
	compact?: boolean;
}

const VideoTile = ({
	participant,
	layoutClassName = "min-h-0 min-w-0 h-full w-full",
	compact = false,
}: VideoTileProps) => {
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

	const shellClass = [
		"relative overflow-hidden rounded-xl bg-slate-900",
		isLocal ? "ring-2 ring-blue-500" : "ring-1 ring-slate-800",
		layoutClassName,
	].join(" ");

	if (status === "connecting") {
		return (
			<div className={shellClass}>
				<VideoTileSkeleton displayName={displayName} compact={compact} />
			</div>
		);
	}

	return (
		<div className={shellClass}>
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

			<div
				className={[
					"pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent",
					compact ? "px-2 pb-2 pt-6" : "px-3 pb-3 pt-8",
				].join(" ")}
			>
				<div className="flex min-w-0 items-center gap-1.5">
					<span
						className={[
							"min-w-0 flex-1 truncate font-medium text-white drop-shadow-sm",
							compact ? "text-[10px] leading-tight sm:text-xs" : "text-xs sm:text-sm",
						].join(" ")}
						title={displayName}
					>
						{displayName}
					</span>
					{isLocal && (
						<span className="flex-shrink-0 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
							{copy.videoGrid.youLabel}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default memo(VideoTile);
