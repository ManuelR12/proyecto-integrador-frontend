import { Link } from "react-router-dom";
import { sala as copy } from "../../copy/es";
import type { Room } from "../../types/room";

interface RoomLobbyProps {
	room: Room;
	onEnter: () => void;
}

const VideoIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" aria-hidden="true">
		<path
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.5}
			d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
		/>
	</svg>
);

const RoomLobby = ({ room, onEnter }: RoomLobbyProps) => {
	const handleEnter = () => {
		onEnter();
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d12] px-6 py-12">
			<div className="w-full max-w-md text-center">
				<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800/80 text-blue-400 ring-1 ring-slate-700">
					<VideoIcon />
				</div>

				<p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
					{copy.lobby.title}
				</p>
				<h1 className="mt-2 text-2xl font-semibold text-white">{room.title}</h1>
				<p className="mt-2 text-sm text-slate-400">{copy.lobby.subtitle(room.title)}</p>
				<p className="mt-4 text-sm leading-relaxed text-slate-500">{copy.lobby.description}</p>

				<button
					type="button"
					onClick={handleEnter}
					className="mt-8 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
				>
					{copy.lobby.enterRoom}
				</button>

				<Link
					to="/dashboard"
					className="mt-4 inline-block text-sm text-slate-500 transition hover:text-slate-300"
				>
					{copy.lobby.backToDashboard}
				</Link>
			</div>
		</div>
	);
};

export default RoomLobby;
