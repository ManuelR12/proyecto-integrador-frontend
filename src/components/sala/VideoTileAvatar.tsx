import { displayNameInitials } from "../../lib/displayNameInitials";

interface VideoTileAvatarProps {
	displayName: string;
	avatarUrl?: string | null;
	compact?: boolean;
}

const VideoTileAvatar = ({ displayName, avatarUrl, compact = false }: VideoTileAvatarProps) => {
	const initials = displayNameInitials(displayName) || "?";

	return (
		<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
			{avatarUrl ? (
				<img
					src={avatarUrl}
					alt=""
					className={[
						"rounded-full object-cover ring-2 ring-slate-700",
						compact ? "h-16 w-16" : "h-24 w-24",
					].join(" ")}
				/>
			) : (
				<div
					className={[
						"flex items-center justify-center rounded-full bg-slate-700 font-semibold text-white ring-2 ring-slate-600",
						compact ? "h-16 w-16 text-lg" : "h-24 w-24 text-2xl",
					].join(" ")}
					aria-hidden="true"
				>
					{initials}
				</div>
			)}
		</div>
	);
};

export default VideoTileAvatar;
