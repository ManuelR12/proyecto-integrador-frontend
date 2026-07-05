import { memo, useEffect, useReducer, useRef } from "react";
import { sala as copy } from "../../copy/es";
import type { VideoTileParticipant } from "../../types/media";
import VideoTileAvatar from "./VideoTileAvatar";
import VideoTileMediaIndicators from "./VideoTileMediaIndicators";
import VideoTileSkeleton from "./VideoTileSkeleton";

interface VideoTileProps {
	participant: VideoTileParticipant;
	layoutClassName?: string;
	compact?: boolean;
}

function streamHasLiveVideo(stream: MediaStream | null): boolean {
	return Boolean(
		stream
			?.getVideoTracks()
			.some((track) => track.enabled && !track.muted && track.readyState === "live"),
	);
}

const VideoTile = ({
	participant,
	layoutClassName = "min-h-0 min-w-0 h-full w-full",
	compact = false,
}: VideoTileProps) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const {
		displayName,
		isLocal,
		stream,
		status,
		avatarUrl,
		videoEnabled,
		audioEnabled,
		isScreenSharing,
		isFeatured,
	} = participant;
	const [, bumpTrackRevision] = useReducer((count: number) => count + 1, 0);
	const hasLiveVideoTrack = streamHasLiveVideo(stream);
	const showVideo = (videoEnabled || isScreenSharing) && hasLiveVideoTrack;

	useEffect(() => {
		if (!stream) return;

		const videoTracks = stream.getVideoTracks();
		for (const track of videoTracks) {
			track.addEventListener("ended", bumpTrackRevision);
			track.addEventListener("mute", bumpTrackRevision);
			track.addEventListener("unmute", bumpTrackRevision);
		}

		return () => {
			for (const track of videoTracks) {
				track.removeEventListener("ended", bumpTrackRevision);
				track.removeEventListener("mute", bumpTrackRevision);
				track.removeEventListener("unmute", bumpTrackRevision);
			}
		};
	}, [stream]);

	useEffect(() => {
		const video = videoRef.current;
		if (!video || !stream) return;

		video.srcObject = stream;

		return () => {
			video.srcObject = null;
		};
	}, [stream]);

	useEffect(() => {
		if (!showVideo) return;

		const video = videoRef.current;
		if (!video) return;

		void video.play().catch(() => {});
	}, [showVideo, stream]);

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
			<div className="relative h-full w-full">
				{stream ? (
					// Keep the media element mounted for audio when video is off.
					// eslint-disable-next-line jsx-a11y/media-has-caption
					<video
						ref={videoRef}
						autoPlay
						playsInline
						muted={isLocal}
						tabIndex={-1}
						aria-label={
							isScreenSharing ? `Pantalla compartida de ${displayName}` : `Video de ${displayName}`
						}
						className={
							showVideo
								? [
										"absolute inset-0 h-full w-full",
										isFeatured && isScreenSharing ? "object-contain" : "object-cover",
									].join(" ")
								: "hidden"
						}
					/>
				) : null}

				{!showVideo ? (
					<div className="absolute inset-0">
						<VideoTileAvatar displayName={displayName} avatarUrl={avatarUrl} compact={compact} />
					</div>
				) : null}
			</div>

			<VideoTileMediaIndicators
				micEnabled={audioEnabled}
				cameraEnabled={videoEnabled && !isScreenSharing}
				isLocal={isLocal}
				compact={compact}
			/>

			{isScreenSharing ? (
				<div className="pointer-events-none absolute left-2 top-2 z-10">
					<span
						className={[
							"rounded bg-emerald-600 font-medium text-white shadow-md",
							compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px] sm:text-xs",
						].join(" ")}
					>
						{copy.videoGrid.screenSharing}
					</span>
				</div>
			) : null}

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
