import { useEffect, useRef } from "react";
import type { SocketParticipant } from "../../types/room";

const AVATAR_COLORS = [
	"bg-blue-600",
	"bg-indigo-500",
	"bg-purple-500",
	"bg-emerald-500",
	"bg-teal-500",
	"bg-orange-500",
	"bg-rose-500",
	"bg-cyan-500",
	"bg-violet-500",
	"bg-amber-500",
];

function avatarColor(seed: string): string {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
	return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function abbrev(name: string): string {
	return name
		.split(/[\s_.-]+/)
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

interface VideoTileProps {
	stream: MediaStream;
	muteAudio: boolean;
	showMicOff: boolean;
	label: string;
	uid: string;
	avatarUrl?: string | null;
	showPlaceholder?: boolean;
	isSelf?: boolean;
}

const VideoTile = ({
	stream,
	muteAudio,
	showMicOff,
	label,
	uid,
	avatarUrl,
	showPlaceholder = false,
	isSelf = false,
}: VideoTileProps) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (videoRef.current) videoRef.current.srcObject = stream;
	}, [stream]);

	return (
		<div className="relative flex aspect-video overflow-hidden rounded-xl bg-slate-800">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted={muteAudio}
				className={["h-full w-full object-cover", showPlaceholder ? "invisible" : ""].join(" ")}
			>
				<track kind="captions" />
			</video>

			{showPlaceholder && (
				<div className="absolute inset-0 flex items-center justify-center">
					{avatarUrl ? (
						<img src={avatarUrl} alt={label} className="h-20 w-20 rounded-full object-cover" />
					) : (
						<div
							className={`flex h-20 w-20 items-center justify-center rounded-full ${avatarColor(uid)} text-2xl font-semibold text-white`}
						>
							{abbrev(label)}
						</div>
					)}
				</div>
			)}

			<div className="absolute bottom-2 left-2 flex items-center gap-1.5">
				<span className="rounded bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
					{label}
				</span>
				{isSelf && (
					<span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
						Tú
					</span>
				)}
			</div>

			{showMicOff && (
				<div className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5">
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						className="h-3 w-3 text-red-400"
						aria-label="Micrófono silenciado"
					>
						<path d="M3.707 2.293a1 1 0 00-1.414 1.414l6.921 6.922a3.5 3.5 0 004.85 4.85l1.53 1.53A7 7 0 015.07 12H3a9 9 0 009 9 8.97 8.97 0 004.664-1.3l1.48 1.48a1 1 0 001.414-1.414L3.707 2.293zM12 3a3.5 3.5 0 013.5 3.5v4.757l-7-7A3.5 3.5 0 0112 3zm3.5 9.5a3.5 3.5 0 01-.08.742l1.51 1.51A5.494 5.494 0 0018.93 12H17a5 5 0 01-5 5v2a7 7 0 007-7h-3.5z" />
					</svg>
				</div>
			)}
		</div>
	);
};

interface VideoGridProps {
	localStream: MediaStream;
	localLabel: string;
	localUid: string;
	localAvatarUrl?: string | null;
	cameraEnabled: boolean;
	micEnabled: boolean;
	remoteStreams: Map<string, MediaStream>;
	participants: SocketParticipant[];
}

const VideoGrid = ({
	localStream,
	localLabel,
	localUid,
	localAvatarUrl,
	cameraEnabled,
	micEnabled,
	remoteStreams,
	participants,
}: VideoGridProps) => {
	const totalTiles = 1 + remoteStreams.size;

	const gridClass =
		totalTiles === 1
			? "grid-cols-1 max-w-lg mx-auto w-full"
			: totalTiles === 2
				? "grid-cols-1 sm:grid-cols-2"
				: totalTiles <= 4
					? "grid-cols-2"
					: "grid-cols-2 lg:grid-cols-3";

	return (
		<div className={`grid w-full gap-3 ${gridClass}`}>
			<VideoTile
				stream={localStream}
				muteAudio
				showMicOff={!micEnabled}
				label={localLabel}
				uid={localUid}
				avatarUrl={localAvatarUrl}
				showPlaceholder={!cameraEnabled}
				isSelf
			/>

			{Array.from(remoteStreams.entries()).map(([uid, stream]) => {
				const peer = participants.find((p) => p.uid === uid);
				return (
					<VideoTile
						key={uid}
						stream={stream}
						muteAudio={false}
						showMicOff={false}
						label={peer?.username ?? uid}
						uid={uid}
						avatarUrl={peer?.avatarUrl}
					/>
				);
			})}
		</div>
	);
};

export default VideoGrid;
