import { memo, useCallback, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useToast } from "../../contexts/ToastContext";
import { sala as copy } from "../../copy/es";
import { selectCanStartScreenShare, useRoomStore } from "../../stores/useRoomStore";
import {
	CamOffIcon,
	CamOnIcon,
	MicOffIcon,
	MicOnIcon,
	ScreenShareIcon,
	ScreenShareStopIcon,
} from "./mediaControlIcons";

const TOGGLE_COOLDOWN_MS = 400;

/** Short button cooldown protects local hardware; socket emits are debounced separately in the store. */
interface MediaToggleButtonProps {
	label: string;
	caption: string;
	active: boolean;
	disabled?: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

const MediaToggleButton = ({
	label,
	caption,
	active,
	disabled = false,
	onClick,
	children,
}: MediaToggleButtonProps) => (
	<div className="flex flex-col items-center gap-1">
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			aria-pressed={active}
			aria-busy={disabled}
			title={label}
			className={[
				"group relative inline-flex h-12 w-12 items-center justify-center rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:opacity-50",
				active
					? "bg-slate-700 text-white hover:bg-slate-600 hover:scale-105"
					: "bg-red-600/90 text-white hover:bg-red-500 hover:scale-105",
			].join(" ")}
		>
			{children}
		</button>
		<span aria-hidden="true" className="text-[11px] font-medium text-slate-200">
			{caption}
		</span>
	</div>
);

const RoomMediaControls = () => {
	const { showTimedToast } = useToast();
	const [audioBusy, setAudioBusy] = useState(false);
	const [videoBusy, setVideoBusy] = useState(false);
	const [screenShareBusy, setScreenShareBusy] = useState(false);
	const audioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const videoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const screenShareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const {
		hasLocalAudioTrack,
		hasLocalVideoTrack,
		localAudioEnabled,
		localVideoEnabled,
		localScreenSharing,
		canStartScreenShare,
		toggleLocalAudio,
		toggleLocalVideo,
		startScreenShare,
		stopScreenShare,
	} = useRoomStore(
		useShallow((state) => ({
			hasLocalAudioTrack: state.hasLocalAudioTrack,
			hasLocalVideoTrack: state.hasLocalVideoTrack,
			localAudioEnabled: state.localAudioEnabled,
			localVideoEnabled: state.localVideoEnabled,
			localScreenSharing: state.localScreenSharing,
			canStartScreenShare: selectCanStartScreenShare(state),
			toggleLocalAudio: state.toggleLocalAudio,
			toggleLocalVideo: state.toggleLocalVideo,
			startScreenShare: state.startScreenShare,
			stopScreenShare: state.stopScreenShare,
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

	const handleToggleScreenShare = useCallback(() => {
		runWithCooldown(screenShareBusy, setScreenShareBusy, screenShareTimerRef, () => {
			if (localScreenSharing) {
				void stopScreenShare();
				return;
			}
			void startScreenShare();
		});
	}, [localScreenSharing, runWithCooldown, screenShareBusy, startScreenShare, stopScreenShare]);

	const screenShareBlocked = !localScreenSharing && !canStartScreenShare;
	const screenShareDisabled = screenShareBusy || screenShareBlocked;
	const screenShareLabel = localScreenSharing
		? copy.controls.dejarCompartirPantalla
		: screenShareBlocked
			? copy.controls.screenShareUnavailable
			: copy.controls.compartirPantalla;

	// Dynamic ARIA labels that describe the current state and action
	const micLabel =
		localAudioEnabled && hasLocalAudioTrack
			? `${copy.controls.microfono}: activado. ${copy.controls.micOff}`
			: `${copy.controls.microfono}: desactivado. ${copy.controls.micOn}`;

	const cameraLabel =
		localVideoEnabled && hasLocalVideoTrack
			? `${copy.controls.camara}: activada. ${copy.controls.camOff}`
			: `${copy.controls.camara}: desactivada. ${copy.controls.camOn}`;

	const screenShareFullLabel = localScreenSharing
		? `Compartir pantalla: activo. ${screenShareLabel}`
		: screenShareBlocked
			? `Compartir pantalla: no disponible. ${screenShareLabel}`
			: `Compartir pantalla: inactivo. ${screenShareLabel}`;

	return (
		<div
			role="toolbar"
			aria-label={copy.controls.toolbar}
			className="flex flex-shrink-0 items-center justify-center gap-3 py-4"
		>
			<MediaToggleButton
				label={micLabel}
				caption={copy.controls.microfono}
				active={localAudioEnabled && hasLocalAudioTrack}
				disabled={audioBusy}
				onClick={handleToggleAudio}
			>
				{localAudioEnabled && hasLocalAudioTrack ? (
					<MicOnIcon className="h-6 w-6" />
				) : (
					<MicOffIcon className="h-6 w-6" />
				)}
			</MediaToggleButton>

			<MediaToggleButton
				label={cameraLabel}
				caption={copy.controls.camara}
				active={localVideoEnabled && hasLocalVideoTrack}
				disabled={videoBusy}
				onClick={handleToggleVideo}
			>
				{localVideoEnabled && hasLocalVideoTrack ? (
					<CamOnIcon className="h-6 w-6" />
				) : (
					<CamOffIcon className="h-6 w-6" />
				)}
			</MediaToggleButton>

			<MediaToggleButton
				label={screenShareFullLabel}
				caption={copy.controls.compartirPantalla}
				active={localScreenSharing}
				disabled={screenShareDisabled}
				onClick={handleToggleScreenShare}
			>
				{localScreenSharing ? (
					<ScreenShareStopIcon className="h-6 w-6" />
				) : (
					<ScreenShareIcon className="h-6 w-6" />
				)}
			</MediaToggleButton>
		</div>
	);
};

export default memo(RoomMediaControls);
