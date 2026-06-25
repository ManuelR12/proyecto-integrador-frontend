import { memo } from "react";
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

	return (
		<div
			className={[
				"pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-1.5",
				compact ? "right-1.5 top-1.5" : "",
			].join(" ")}
			aria-hidden="true"
		>
			{!micEnabled ? (
				<span className="rounded-full bg-black/60 p-1 text-red-500" title="Micrófono silenciado">
					<MicOffIcon className={iconClass} />
				</span>
			) : null}
			{!cameraEnabled ? (
				<span className="rounded-full bg-black/60 p-1 text-red-500" title="Cámara apagada">
					<CamOffIcon className={iconClass} />
				</span>
			) : null}
		</div>
	);
};

export default memo(VideoTileMediaIndicators);
