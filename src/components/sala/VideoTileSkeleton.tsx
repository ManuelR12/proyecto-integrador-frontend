import { sala as copy } from "../../copy/es";

const VideoTileSkeleton = ({ displayName }: { displayName: string }) => (
	<div
		aria-busy="true"
		aria-label={copy.videoGrid.connecting}
		className="relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800"
	>
		<div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
		<div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
			<div className="h-14 w-14 animate-pulse rounded-full bg-slate-700" />
			<div className="h-3 w-28 animate-pulse rounded bg-slate-700" />
		</div>
		<div className="absolute bottom-3 left-3 z-10 max-w-[70%] truncate rounded bg-black/50 px-2 py-1 text-xs text-slate-300">
			{displayName}
		</div>
	</div>
);

export default VideoTileSkeleton;
