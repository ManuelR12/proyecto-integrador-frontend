import { Link } from "react-router-dom";
import { dashboard as dashboardCopy, sala as copy } from "../../copy/es";
import { useToast } from "../../contexts/ToastContext";
import type { Room } from "../../types/room";

interface RoomHeaderProps {
	room: Room;
	isAdmin: boolean;
	participantCount: number;
	onEdit?: () => void;
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

const CopyIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
		<path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l2.622 2.621A1.5 1.5 0 0116 6.122V12.5A1.5 1.5 0 0114.5 14H8.5A1.5 1.5 0 017 12.5v-9z" />
		<path d="M5.5 6A1.5 1.5 0 004 7.5v6A1.5 1.5 0 005.5 15H6v-7.5A1.5 1.5 0 017.5 6H5.5z" />
	</svg>
);

const RoomHeader = ({ room, isAdmin, participantCount, onEdit, onDelete }: RoomHeaderProps) => {
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
					className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
					aria-label={copy.backToDashboard}
				>
					<BackIcon />
				</Link>

				<div className="min-w-0">
					<h1 className="truncate text-lg font-semibold text-slate-900">{room.title}</h1>
					<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
						<span className="inline-flex items-center gap-1">
							{dashboardCopy.roomCard.idPrefix} {room.id}
							<button
								type="button"
								onClick={() => void handleCopyId()}
								className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-blue-600 transition hover:bg-blue-50"
							>
								<CopyIcon />
								{copy.copyId}
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

			{isAdmin && (
				<div className="flex flex-shrink-0 items-center gap-2 sm:ml-4">
					<button
						type="button"
						onClick={onEdit}
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
					>
						{copy.editRoom}
					</button>
					<button
						type="button"
						onClick={onDelete}
						className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
					>
						{copy.deleteRoom}
					</button>
				</div>
			)}
		</header>
	);
};

export default RoomHeader;
