import { Link } from "react-router-dom";
import { dashboard as copy, sala } from "../../copy/es";
import { useToast } from "../../contexts/ToastContext";
import type { Room } from "../../types/room";
import ParticipantAvatar from "./ParticipantAvatar";

interface RoomCardProps {
	room: Room;
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

const GearIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
		<path
			fillRule="evenodd"
			d="M11.983 1.907a.75.75 0 01.734.011l2.25 1.5a.75.75 0 01.232.938l-1.106 2.213a6.96 6.96 0 011.732 1.732l2.213 1.106a.75.75 0 01.938.232l1.5 2.25a.75.75 0 01-.011.734l-1.5 2.25a.75.75 0 01-.938.232l-2.213-1.106a6.96 6.96 0 01-1.732 1.732l-1.106 2.213a.75.75 0 01-.232.938l-2.25 1.5a.75.75 0 01-.734.011l-2.25-1.5a.75.75 0 01-.232-.938l1.106-2.213a6.96 6.96 0 01-1.732-1.732l-2.213-1.106a.75.75 0 01-.938-.232l-1.5-2.25a.75.75 0 01.011-.734l1.5-2.25a.75.75 0 01.938-.232l2.213 1.106a6.96 6.96 0 011.732-1.732l1.106-2.213a.75.75 0 01.232-.938l2.25-1.5zM10 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
			clipRule="evenodd"
		/>
	</svg>
);

const RoomCard = ({ room }: RoomCardProps) => {
	const { showToast } = useToast();
	const visibleParticipants = room.participants.slice(0, 4);
	const overflowCount = Math.max(room.participants.length - visibleParticipants.length, 0);

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(room.code);
			showToast(copy.roomCard.copySuccess, "success");
		} catch {
			showToast("No pudimos copiar el ID. Inténtalo de nuevo.", "error");
		}
	};

	const handleSettings = () => {
		showToast(copy.roomCard.settingsSoon, "info");
	};

	return (
		<article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-start gap-3">
					<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
						<MonitorIcon />
					</div>
					<div className="min-w-0">
						<h3 className="truncate text-base font-semibold text-slate-900">{room.title}</h3>
						<div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
							<span>
								{copy.roomCard.idPrefix} {room.code}
							</span>
							<button
								type="button"
								onClick={handleCopyCode}
								aria-label={`Copiar ID ${room.code}`}
								className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
					<span className="flex-shrink-0 text-xs text-slate-400">{copy.roomCard.inactive}</span>
				)}
			</div>

			<div className="mt-4 flex items-center gap-2">
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
				<span className="text-xs text-slate-500">
					{copy.roomCard.participants(room.participants.length || room.memberIds.length)}
				</span>
			</div>

			<div className="mt-5 flex gap-3">
				<Link
					to={`/sala/${room.code}`}
					className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
				>
					{copy.roomCard.enter}
				</Link>
				<button
					type="button"
					onClick={handleSettings}
					className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
				>
					<GearIcon />
					{copy.roomCard.settings}
				</button>
			</div>
		</article>
	);
};

export default RoomCard;
