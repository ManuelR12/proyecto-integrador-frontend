import { Link } from "react-router-dom";
import { dashboard as dashboardCopy, sala as copy } from "../../copy/es";
import { useToast } from "../../contexts/ToastContext";
import type { Room } from "../../types/room";

interface RoomHeaderProps {
	room: Room;
	isAdmin: boolean;
	participantCount: number;
	onDelete?: () => void;
}

const BackIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
		<path
			fillRule="evenodd"
			d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
			clipRule="evenodd"
		/>
	</svg>
);

const LeaveIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
		<path
			fillRule="evenodd"
			d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
			clipRule="evenodd"
		/>
		<path
			fillRule="evenodd"
			d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
			clipRule="evenodd"
		/>
	</svg>
);

const TrashIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
		<path
			fillRule="evenodd"
			d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
			clipRule="evenodd"
		/>
	</svg>
);

const CopyIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
		<path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l2.622 2.621A1.5 1.5 0 0116 6.122V12.5A1.5 1.5 0 0114.5 14H8.5A1.5 1.5 0 017 12.5v-9z" />
		<path d="M5.5 6A1.5 1.5 0 004 7.5v6A1.5 1.5 0 005.5 15H6v-7.5A1.5 1.5 0 017.5 6H5.5z" />
	</svg>
);

const RoomHeader = ({ room, isAdmin, participantCount, onDelete }: RoomHeaderProps) => {
	const { showToast } = useToast();

	const handleCopyId = async () => {
		try {
			await navigator.clipboard.writeText(room.id);
			showToast(copy.copyIdSuccess, "success");
		} catch {
			showToast("No pudimos copiar el ID. Inténtalo de nuevo.", "error");
		}
	};

	return (
		<header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
			<div className="flex min-w-0 items-start gap-3">
				<Link
					to="/dashboard"
					className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
					aria-label={copy.backToDashboard}
				>
					<BackIcon />
				</Link>

				<div className="min-w-0">
					<h1 className="truncate text-lg font-semibold text-slate-900">{room.title}</h1>
					<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
						<span className="inline-flex items-center gap-1">
							{dashboardCopy.roomCard.idPrefix} {room.id}
							<button
								type="button"
								onClick={() => void handleCopyId()}
								aria-label={`${copy.copyId} ID de sala: ${room.id}`}
								className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-blue-600 transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
							>
								<CopyIcon />
								<span aria-hidden="true">{copy.copyId}</span>
							</button>
						</span>
						<span>{copy.participantes(participantCount)}</span>
						<span className="inline-flex items-center gap-1.5 text-emerald-700">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
							{copy.enVivo}
						</span>
					</div>
				</div>
			</div>

			<div className="flex flex-shrink-0 items-center gap-2 sm:ml-4">
				<Link
					to="/dashboard"
					aria-label={`${copy.leaveRoom}: ${room.title}`}
					className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
				>
					<LeaveIcon />
					{copy.leaveRoom}
				</Link>
				{isAdmin && onDelete && (
					<button
						type="button"
						onClick={onDelete}
						aria-label={`${copy.deleteRoom}: ${room.title}`}
						className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
					>
						<TrashIcon />
						{copy.deleteRoom}
					</button>
				)}
			</div>
		</header>
	);
};

export default RoomHeader;
