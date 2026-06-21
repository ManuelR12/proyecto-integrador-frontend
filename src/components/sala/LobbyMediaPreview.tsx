import { memo, useCallback, useEffect, useRef, useState } from "react";
import { sala as copy } from "../../copy/es";
import { requestMediaTrack } from "../../lib/localMediaStream";
import VideoTileAvatar from "./VideoTileAvatar";

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

const MicLevelMeter = ({ level }: { level: number }) => {
	const bars = [0.15, 0.35, 0.55, 0.75];

	return (
		<div
			className="flex h-5 items-end gap-0.5"
			role="meter"
			aria-label={copy.lobby.micLevelLabel}
			aria-valuenow={Math.round(level * 100)}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			{bars.map((threshold, index) => (
				<span
					key={threshold}
					className={[
						"w-1 rounded-sm transition-colors duration-75",
						index === 0 ? "h-1.5" : index === 1 ? "h-2.5" : index === 2 ? "h-3.5" : "h-5",
						level >= threshold ? "bg-emerald-400" : "bg-slate-600",
					].join(" ")}
				/>
			))}
		</div>
	);
};

interface LobbyMediaPreviewProps {
	stream: MediaStream | null;
	displayName: string;
	avatarUrl: string | null;
	videoEnabled: boolean;
	audioEnabled: boolean;
	hasVideoTrack: boolean;
	hasAudioTrack: boolean;
	onStreamChange: (stream: MediaStream | null) => void;
	onVideoEnabledChange: (enabled: boolean) => void;
	onAudioEnabledChange: (enabled: boolean) => void;
	onHasVideoTrackChange: (hasTrack: boolean) => void;
	onHasAudioTrackChange: (hasTrack: boolean) => void;
}

const LobbyMediaPreview = ({
	stream,
	displayName,
	avatarUrl,
	videoEnabled,
	audioEnabled,
	hasVideoTrack,
	hasAudioTrack,
	onStreamChange,
	onVideoEnabledChange,
	onAudioEnabledChange,
	onHasVideoTrackChange,
	onHasAudioTrackChange,
}: LobbyMediaPreviewProps) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [micLevel, setMicLevel] = useState(0);

	const showVideo =
		videoEnabled &&
		hasVideoTrack &&
		Boolean(stream?.getVideoTracks().some((track) => track.enabled && track.readyState === "live"));
	const micActive = Boolean(stream && audioEnabled && hasAudioTrack);
	const displayedMicLevel = micActive ? micLevel : 0;

	useEffect(() => {
		const video = videoRef.current;
		if (!video || !stream) return;

		video.srcObject = stream;
		void video.play().catch(() => {});

		return () => {
			video.srcObject = null;
		};
	}, [stream]);

	useEffect(() => {
		if (!stream || !audioEnabled || !hasAudioTrack) {
			return;
		}

		const audioContext = new AudioContext();
		const source = audioContext.createMediaStreamSource(stream);
		const analyser = audioContext.createAnalyser();
		analyser.fftSize = 256;
		analyser.smoothingTimeConstant = 0.8;
		source.connect(analyser);

		const buffer = new Uint8Array(analyser.frequencyBinCount);
		let rafId = 0;

		const tick = () => {
			analyser.getByteFrequencyData(buffer);
			const average = buffer.reduce((sum, value) => sum + value, 0) / buffer.length;
			setMicLevel(Math.min(1, average / 128));
			rafId = requestAnimationFrame(tick);
		};

		rafId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(rafId);
			source.disconnect();
			void audioContext.close();
		};
	}, [audioEnabled, hasAudioTrack, stream]);

	const attachTrack = useCallback(
		(track: MediaStreamTrack) => {
			const nextStream = stream ?? new MediaStream();
			const existing =
				track.kind === "video" ? nextStream.getVideoTracks()[0] : nextStream.getAudioTracks()[0];

			if (existing) {
				existing.stop();
				nextStream.removeTrack(existing);
			}

			nextStream.addTrack(track);
			onStreamChange(nextStream);
			return nextStream;
		},
		[onStreamChange, stream],
	);

	const handleToggleVideo = useCallback(() => {
		const track = stream?.getVideoTracks()[0];
		if (track) {
			const nextEnabled = !track.enabled;
			track.enabled = nextEnabled;
			onVideoEnabledChange(nextEnabled);
			return;
		}

		void requestMediaTrack("video").then((videoTrack) => {
			if (!videoTrack) return;
			attachTrack(videoTrack);
			onHasVideoTrackChange(true);
			onVideoEnabledChange(true);
		});
	}, [attachTrack, onHasVideoTrackChange, onVideoEnabledChange, stream]);

	const handleToggleAudio = useCallback(() => {
		const track = stream?.getAudioTracks()[0];
		if (track) {
			const nextEnabled = !track.enabled;
			track.enabled = nextEnabled;
			onAudioEnabledChange(nextEnabled);
			return;
		}

		void requestMediaTrack("audio").then((audioTrack) => {
			if (!audioTrack) return;
			attachTrack(audioTrack);
			onHasAudioTrackChange(true);
			onAudioEnabledChange(true);
		});
	}, [attachTrack, onAudioEnabledChange, onHasAudioTrackChange, stream]);

	return (
		<div className="flex w-full max-w-4xl flex-col gap-6">
			<div className="relative aspect-video w-full min-h-[280px] overflow-hidden rounded-2xl bg-slate-900 shadow-xl ring-1 ring-slate-700 sm:min-h-[360px] lg:min-h-[480px]">
				{stream ? (
					<video
						ref={videoRef}
						autoPlay
						playsInline
						muted
						className={showVideo ? "h-full w-full object-cover" : "hidden"}
					/>
				) : null}

				{!showVideo ? <VideoTileAvatar displayName={displayName} avatarUrl={avatarUrl} /> : null}
			</div>

			<div className="flex items-center justify-center gap-4">
				<div className="flex items-center gap-3">
					<MediaToggleButton
						label={audioEnabled && hasAudioTrack ? copy.controls.micOff : copy.controls.micOn}
						active={audioEnabled && hasAudioTrack}
						onClick={handleToggleAudio}
					>
						{audioEnabled && hasAudioTrack ? <MicOnIcon /> : <MicOffIcon />}
					</MediaToggleButton>
					<MicLevelMeter level={displayedMicLevel} />
				</div>

				<MediaToggleButton
					label={videoEnabled && hasVideoTrack ? copy.controls.camOff : copy.controls.camOn}
					active={videoEnabled && hasVideoTrack}
					onClick={handleToggleVideo}
				>
					{videoEnabled && hasVideoTrack ? <CamOnIcon /> : <CamOffIcon />}
				</MediaToggleButton>
			</div>
		</div>
	);
};

export default memo(LobbyMediaPreview);
