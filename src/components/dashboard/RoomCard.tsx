import { Link } from "react-router-dom";
import { dashboard as copy, sala } from "../../copy/es";
import { useToast } from "../../contexts/ToastContext";
import type { Room } from "../../types/room";
import ParticipantAvatar from "./ParticipantAvatar";

interface RoomCardProps {
	room: Room;
	currentUserId?: string;
}

const MonitorIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		className="h-5 w-5"
		aria-hidden="true"
	>
		<rect x="2.25" y="4.5" width="19.5" height="12" rx="2" />
		<path strokeLinecap="round" d="M9 20.25h6M12 16.5V20.25" />
	</svg>
);

const CopyIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
		<path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l2.622 2.621A1.5 1.5 0 0116 6.122V12.5A1.5 1.5 0 0114.5 14H8.5A1.5 1.5 0 017 12.5v-9z" />
		<path d="M5.5 6A1.5 1.5 0 004 7.5v6A1.5 1.5 0 005.5 15H6v-7.5A1.5 1.5 0 017.5 6H5.5z" />
	</svg>
);

const RoomCard = ({ room }: RoomCardProps) => {
	const { showToast } = useToast();
	const visibleParticipants = room.participants.slice(0, 4);
	const overflowCount = Math.max(room.participants.length - visibleParticipants.length, 0);

	const participantCount = room.participants.length || Math.max(room.memberIds.length, 1);

	const handleCopyId = async () => {
		try {
			await navigator.clipboard.writeText(room.id);
			showToast(copy.roomCard.copySuccess, "success");
		} catch {
			showToast("No pudimos copiar el ID. Inténtalo de nuevo.", "error");
		}
	};

	return (
		<article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-start gap-3">
					<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
						<MonitorIcon />
					</div>
					<div className="min-w-0">
						<h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
							{room.title}
						</h3>
						<div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
							<span>
								{copy.roomCard.idPrefix} {room.id}
							</span>
							<button
								type="button"
								onClick={handleCopyId}
								aria-label={`Copiar ID ${room.id}`}
								className="rounded p-0.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
							>
								<CopyIcon />
							</button>
						</div>
					</div>
				</div>

				{room.isLive ? (
					<span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
						{sala.enVivo}
					</span>
				) : (
					<span className="flex-shrink-0 text-xs text-slate-600">{copy.roomCard.inactive}</span>
				)}
			</div>

			<div className="mt-4 flex items-center gap-2">
				{visibleParticipants.length > 0 && (
					<div className="flex -space-x-2">
						{visibleParticipants.map((participant, index) => (
							<ParticipantAvatar
								key={participant.uid}
								initials={participant.initials}
								index={index}
							/>
						))}
						{overflowCount > 0 && (
							<div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-semibold text-slate-600">
								+{overflowCount}
							</div>
						)}
					</div>
				)}
				<span className="text-xs text-slate-600">
					{copy.roomCard.participants(participantCount)}
				</span>
			</div>

			<div className="mt-5 flex gap-3">
				<Link
					to={`/sala/${room.id}`}
					aria-label={`${copy.roomCard.enter}: ${room.title}`}
					className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
				>
					{copy.roomCard.enter}
				</Link>
			</div>
		</article>
	);
};

export default RoomCard;
