import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RoomLobby from "../components/sala/RoomLobby";
import RoomSession from "../components/sala/RoomSession";
import { sala as copy } from "../copy/es";
import { MediaPlaybackProvider } from "../contexts/MediaPlaybackContext";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../hooks/useRoom";
import { unlockMediaPlayback } from "../lib/unlockMediaPlayback";
import { normalizeRoomId } from "../lib/roomId";
import { useRoomStore } from "../stores/useRoomStore";

const Sala = () => {
	const { id: rawId } = useParams<{ id: string }>();
	const roomId = useMemo(() => (rawId ? normalizeRoomId(rawId) : undefined), [rawId]);
	const { user } = useAuth();
	const { room, loading, error, isAdmin, setRoom } = useRoom(roomId, user?.uid);
	const [enteredRoomId, setEnteredRoomId] = useState<string | null>(null);
	const playbackUnlocked = enteredRoomId !== null && enteredRoomId === roomId;

	useEffect(() => {
		useRoomStore.getState().reset();
	}, [roomId]);

	const handleEnterRoom = (previewStream: MediaStream | null) => {
		if (!roomId) return;

		unlockMediaPlayback();
		if (previewStream) {
			const roomStore = useRoomStore.getState();
			roomStore.setLocalStream(previewStream);
			roomStore.setLocalStatus("connected");
		}
		setEnteredRoomId(roomId);
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#0d0d12] text-sm text-slate-400">
				{copy.loadingRoom}
			</div>
		);
	}

	if (error === "ROOM_NOT_FOUND" || !room || !roomId) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0d0d12] px-6 text-center">
				<p className="text-sm text-slate-300">{copy.roomNotFound}</p>
				<Link
					to="/dashboard"
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
				>
					{copy.backToDashboard}
				</Link>
			</div>
		);
	}

	if (!playbackUnlocked) {
		return <RoomLobby room={room} onEnter={handleEnterRoom} />;
	}

	return (
		<MediaPlaybackProvider playbackUnlocked>
			<RoomSession
				room={room}
				roomId={roomId}
				isAdmin={isAdmin}
				onRoomUpdated={(name) => {
					setRoom((prev) => (prev ? { ...prev, title: name } : prev));
				}}
			/>
		</MediaPlaybackProvider>
	);
};

export default Sala;
