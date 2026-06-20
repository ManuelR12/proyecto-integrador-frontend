import { useMediaPlayback } from "../../contexts/MediaPlaybackContext";
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

interface RoomMediaStageProps {
	currentDisplayName: string;
	currentInitials: string;
	currentAvatarUrl?: string | null;
	currentUserId?: string;
	participants: SocketParticipant[];
}

/**
 * AV stage wrapper. Only mounts after the lobby unlocks playback so WebRTC
 * streams can autoplay without Chrome blocking them.
 */
const RoomMediaStage = ({
	currentDisplayName,
	currentInitials,
	currentAvatarUrl,
	currentUserId,
	participants,
}: RoomMediaStageProps) => {
	const { playbackUnlocked } = useMediaPlayback();

	if (!playbackUnlocked) {
		return null;
	}

	return (
		<div className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
			<div className="relative flex aspect-[4/3] flex-col items-center justify-center rounded-xl bg-slate-900 p-4 ring-2 ring-blue-500">
				{currentAvatarUrl ? (
					<img
						src={currentAvatarUrl}
						alt={currentDisplayName}
						className="h-16 w-16 rounded-full object-cover"
					/>
				) : (
					<div
						className={`flex h-16 w-16 items-center justify-center rounded-full ${avatarColor(currentUserId ?? "self")} text-lg font-semibold text-white`}
					>
						{currentInitials}
					</div>
				)}
				<p className="mt-3 max-w-full truncate text-sm font-medium text-slate-200">
					{currentDisplayName}
				</p>
				<div className="absolute bottom-3 left-3 flex items-center gap-1.5">
					<span className="max-w-[90px] truncate text-xs text-slate-300">{currentDisplayName}</span>
					<span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
						Tú
					</span>
				</div>
			</div>

			{participants.map((p) => {
				const initials = p.username
					.split(/[\s_.-]+/)
					.map((w) => w[0])
					.slice(0, 2)
					.join("")
					.toUpperCase();
				return (
					<div
						key={p.uid}
						className="relative flex aspect-[4/3] flex-col items-center justify-center rounded-xl bg-slate-900 p-4"
					>
						{p.avatarUrl ? (
							<img
								src={p.avatarUrl}
								alt={p.username}
								className="h-16 w-16 rounded-full object-cover"
							/>
						) : (
							<div
								className={`flex h-16 w-16 items-center justify-center rounded-full ${avatarColor(p.uid)} text-lg font-semibold text-white`}
							>
								{initials}
							</div>
						)}
						<p className="mt-3 max-w-full truncate text-sm font-medium text-slate-200">
							{p.username}
						</p>
						<div className="absolute bottom-3 left-3">
							<span className="max-w-[120px] truncate text-xs text-slate-400">{p.username}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default RoomMediaStage;
