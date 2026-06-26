import { memo } from "react";
import { sala as copy } from "../../copy/es";
import { CamOffIcon, MicOffIcon } from "./mediaControlIcons";

interface VideoTileMediaIndicatorsProps {
	micEnabled: boolean;
	cameraEnabled: boolean;
	isLocal: boolean;
	compact?: boolean;
}

const VideoTileMediaIndicators = ({
	micEnabled,
	cameraEnabled,
	isLocal,
	compact = false,
}: VideoTileMediaIndicatorsProps) => {
	if (isLocal || (micEnabled && cameraEnabled)) {
		return null;
	}

	const iconClass = compact ? "h-4 w-4" : "h-5 w-5";
	const statusParts: string[] = [];
	if (!micEnabled) statusParts.push(copy.videoGrid.micMuted);
	if (!cameraEnabled) statusParts.push(copy.videoGrid.cameraOff);
	const statusLabel = statusParts.join(", ");

	return (
		<div
			className={[
				"pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-1.5",
				compact ? "right-1.5 top-1.5" : "",
			].join(" ")}
			role="status"
			aria-label={statusLabel}
		>
			<span className="sr-only">{statusLabel}</span>
			{!micEnabled ? (
				<span
					className="rounded-full bg-black/60 p-1 text-red-500"
					aria-hidden="true"
					title={copy.videoGrid.micMuted}
				>
					<MicOffIcon className={iconClass} />
				</span>
			) : null}
			{!cameraEnabled ? (
				<span
					className="rounded-full bg-black/60 p-1 text-red-500"
					aria-hidden="true"
					title={copy.videoGrid.cameraOff}
				>
					<CamOffIcon className={iconClass} />
				</span>
			) : null}
		</div>
	);
};

export default memo(VideoTileMediaIndicators);
