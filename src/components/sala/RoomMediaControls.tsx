import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useToast } from "../../contexts/ToastContext";
import { sala as copy } from "../../copy/es";
import { useRoomStore } from "../../stores/useRoomStore";

const MicOnIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
		<path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5zM4.5 9.75a.75.75 0 011.5 0v.75a6.75 6.75 0 0013.5 0v-.75a.75.75 0 011.5 0v.75a8.25 8.25 0 01-7.5 8.207V19.5h2.25a.75.75 0 010 1.5h-6a.75.75 0 010-1.5H12v-1.543A8.25 8.25 0 014.5 10.5v-.75z" />
	</svg>
);

const MicOffIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
		<path d="M12 14.25c1.657 0 3-1.343 3-3V4.5a3 3 0 10-6 0v6.75c0 1.657 1.343 3 3 3z" />
		<path d="M4.5 9.75a.75.75 0 011.5 0v.75a6.75 6.75 0 0011.187 5.197l1.126 1.126a.75.75 0 11-1.06 1.06l-1.127-1.127A8.25 8.25 0 014.5 10.5v-.75zM19.28 4.22a.75.75 0 010 1.06l-15 15a.75.75 0 11-1.06-1.06l15-15a.75.75 0 011.06 0z" />
		<path d="M12 18.75a8.25 8.25 0 01-6.364-2.988.75.75 0 111.128-1.002A6.75 6.75 0 0012 17.25c1.28 0 2.48-.358 3.5-.98a.75.75 0 11.828 1.26A8.25 8.25 0 0112 18.75z" />
	</svg>
);

const CamOnIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
		<path d="M4.5 7.5A2.25 2.25 0 016.75 5.25h6A2.25 2.25 0 0115 7.5v9a2.25 2.25 0 01-2.25 2.25h-6A2.25 2.25 0 014.5 16.5v-9z" />
		<path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72V10.5z" />
	</svg>
);

const CamOffIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
		<path d="M3.28 2.22a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18z" />
		<path d="M4.5 7.5A2.25 2.25 0 016.75 5.25h3.19l1.5 1.5H6.75a.75.75 0 00-.75.75v9c0 .414.336.75.75.75h6a.75.75 0 00.75-.75v-1.69l1.5 1.5V16.5A2.25 2.25 0 0113.25 18.75h-6A2.25 2.25 0 015 16.5v-9z" />
		<path d="M15.75 10.5l1.22 1.22-4.72 4.72V10.5h3.5zM19.03 6.97l1.06 1.06-2.25 2.25a3 3 0 00-3.59 3.59l-1.06 1.06A4.5 4.5 0 0119.03 6.97z" />
	</svg>
);

interface MediaToggleButtonProps {
	label: string;
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

const MediaToggleButton = ({ label, active, onClick, children }: MediaToggleButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		aria-label={label}
		aria-pressed={active}
		className={[
			"inline-flex h-12 w-12 items-center justify-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
			active
				? "bg-slate-700 text-white hover:bg-slate-600"
				: "bg-red-600/90 text-white hover:bg-red-500",
		].join(" ")}
	>
		{children}
	</button>
);

const RoomMediaControls = () => {
	const { showTimedToast } = useToast();
	const {
		hasLocalAudioTrack,
		hasLocalVideoTrack,
		localAudioEnabled,
		localVideoEnabled,
		toggleLocalAudio,
		toggleLocalVideo,
	} = useRoomStore(
		useShallow((state) => ({
			hasLocalAudioTrack: state.hasLocalAudioTrack,
			hasLocalVideoTrack: state.hasLocalVideoTrack,
			localAudioEnabled: state.localAudioEnabled,
			localVideoEnabled: state.localVideoEnabled,
			toggleLocalAudio: state.toggleLocalAudio,
			toggleLocalVideo: state.toggleLocalVideo,
		})),
	);

	const notifyPermissionsRequired = useCallback(() => {
		showTimedToast(copy.controls.permissionsRequired, "info");
	}, [showTimedToast]);

	const handleToggleAudio = useCallback(() => {
		if (!hasLocalAudioTrack) {
			notifyPermissionsRequired();
		}
		toggleLocalAudio();
	}, [hasLocalAudioTrack, notifyPermissionsRequired, toggleLocalAudio]);

	const handleToggleVideo = useCallback(() => {
		if (!hasLocalVideoTrack) {
			notifyPermissionsRequired();
		}
		toggleLocalVideo();
	}, [hasLocalVideoTrack, notifyPermissionsRequired, toggleLocalVideo]);

	return (
		<div
			role="toolbar"
			aria-label="Controles de audio y video"
			className="flex flex-shrink-0 items-center justify-center gap-3 py-4"
		>
			<MediaToggleButton
				label={localAudioEnabled && hasLocalAudioTrack ? copy.controls.micOff : copy.controls.micOn}
				active={localAudioEnabled && hasLocalAudioTrack}
				onClick={handleToggleAudio}
			>
				{localAudioEnabled && hasLocalAudioTrack ? <MicOnIcon /> : <MicOffIcon />}
			</MediaToggleButton>

			<MediaToggleButton
				label={localVideoEnabled && hasLocalVideoTrack ? copy.controls.camOff : copy.controls.camOn}
				active={localVideoEnabled && hasLocalVideoTrack}
				onClick={handleToggleVideo}
			>
				{localVideoEnabled && hasLocalVideoTrack ? <CamOnIcon /> : <CamOffIcon />}
			</MediaToggleButton>
		</div>
	);
};

export default memo(RoomMediaControls);
