import { sala as copy } from "../../copy/es";

interface VideoTileSkeletonProps {
	displayName: string;
	compact?: boolean;
}

const VideoTileSkeleton = ({ displayName, compact = false }: VideoTileSkeletonProps) => (
	<div
		aria-busy="true"
		aria-label={copy.videoGrid.connecting}
		className="relative flex h-full w-full flex-col overflow-hidden"
	>
		<div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
		<div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
			<div
				className={
					compact
						? "h-10 w-10 animate-pulse rounded-full bg-slate-700"
						: "h-14 w-14 animate-pulse rounded-full bg-slate-700"
				}
			/>
			<div
				className={
					compact
						? "h-2.5 w-20 animate-pulse rounded bg-slate-700"
						: "h-3 w-28 animate-pulse rounded bg-slate-700"
				}
			/>
		</div>
		<div
			className={[
				"absolute bottom-2 left-2 z-10 max-w-[75%] truncate rounded bg-black/50 text-slate-300",
				compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
			].join(" ")}
			title={displayName}
		>
			{displayName}
		</div>
	</div>
);

export default VideoTileSkeleton;
