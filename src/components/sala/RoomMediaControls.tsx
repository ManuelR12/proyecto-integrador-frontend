import { memo, useCallback, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useToast } from "../../contexts/ToastContext";
import { sala as copy } from "../../copy/es";
import { useRoomStore } from "../../stores/useRoomStore";
import { CamOffIcon, CamOnIcon, MicOffIcon, MicOnIcon } from "./mediaControlIcons";

const TOGGLE_COOLDOWN_MS = 400;

interface MediaToggleButtonProps {
	label: string;
	active: boolean;
	disabled?: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

const MediaToggleButton = ({
	label,
	active,
	disabled = false,
	onClick,
	children,
}: MediaToggleButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		disabled={disabled}
		aria-label={label}
		aria-pressed={active}
		aria-busy={disabled}
		className={[
			"inline-flex h-12 w-12 items-center justify-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
			disabled ? "cursor-not-allowed opacity-50" : "",
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
	const [audioBusy, setAudioBusy] = useState(false);
	const [videoBusy, setVideoBusy] = useState(false);
	const audioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const videoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

	const runWithCooldown = useCallback(
		(
			isBusy: boolean,
			setBusy: (value: boolean) => void,
			timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
			action: () => void,
		) => {
			if (isBusy) return;

			setBusy(true);
			action();

			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
			timerRef.current = setTimeout(() => {
				setBusy(false);
				timerRef.current = null;
			}, TOGGLE_COOLDOWN_MS);
		},
		[],
	);

	const handleToggleAudio = useCallback(() => {
		runWithCooldown(audioBusy, setAudioBusy, audioTimerRef, () => {
			if (!hasLocalAudioTrack) {
				notifyPermissionsRequired();
			}
			toggleLocalAudio();
		});
	}, [audioBusy, hasLocalAudioTrack, notifyPermissionsRequired, runWithCooldown, toggleLocalAudio]);

	const handleToggleVideo = useCallback(() => {
		runWithCooldown(videoBusy, setVideoBusy, videoTimerRef, () => {
			if (!hasLocalVideoTrack) {
				notifyPermissionsRequired();
			}
			toggleLocalVideo();
		});
	}, [hasLocalVideoTrack, notifyPermissionsRequired, runWithCooldown, toggleLocalVideo, videoBusy]);

	return (
		<div
			role="toolbar"
			aria-label="Controles de audio y video"
			className="flex flex-shrink-0 items-center justify-center gap-3 py-4"
		>
			<MediaToggleButton
				label={localAudioEnabled && hasLocalAudioTrack ? copy.controls.micOff : copy.controls.micOn}
				active={localAudioEnabled && hasLocalAudioTrack}
				disabled={audioBusy}
				onClick={handleToggleAudio}
			>
				{localAudioEnabled && hasLocalAudioTrack ? <MicOnIcon /> : <MicOffIcon />}
			</MediaToggleButton>

			<MediaToggleButton
				label={localVideoEnabled && hasLocalVideoTrack ? copy.controls.camOff : copy.controls.camOn}
				active={localVideoEnabled && hasLocalVideoTrack}
				disabled={videoBusy}
				onClick={handleToggleVideo}
			>
				{localVideoEnabled && hasLocalVideoTrack ? <CamOnIcon /> : <CamOffIcon />}
			</MediaToggleButton>
		</div>
	);
};

export default memo(RoomMediaControls);
