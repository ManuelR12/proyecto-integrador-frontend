import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import DeleteRoomModal from "../components/sala/DeleteRoomModal";
import RoomChatPanel from "../components/sala/RoomChatPanel";
import RoomConfigModal from "../components/sala/RoomConfigModal";
import RoomHeader from "../components/sala/RoomHeader";
import { sala as copy } from "../copy/es";
import { useAuth } from "../contexts/AuthContext";
import { useDeleteRoom } from "../hooks/useDeleteRoom";
import { useRoomChat } from "../hooks/useRoomChat";
import { useRoom } from "../hooks/useRoom";
import { useUpdateRoom } from "../hooks/useUpdateRoom";
import { useUserProfile } from "../hooks/useUserProfile";
import { normalizeRoomId } from "../lib/roomId";

const Sala = () => {
	const { id: rawId } = useParams<{ id: string }>();
	const roomId = useMemo(() => (rawId ? normalizeRoomId(rawId) : undefined), [rawId]);
	const { user } = useAuth();
	const { displayName } = useUserProfile();
	const { room, loading, error, isAdmin, setRoom } = useRoom(roomId, user?.uid);

	const updateRoom = useUpdateRoom({
		roomId: roomId ?? "",
		onSuccess: (name) => {
			setRoom((prev) => (prev ? { ...prev, title: name } : prev));
		},
	});

	const deleteRoomAction = useDeleteRoom({
		roomId: roomId ?? "",
	});

	const chat = useRoomChat(roomId);

	const currentDisplayName = displayName ?? user?.displayName ?? user?.email ?? "Tú";
	const currentInitials = currentDisplayName
		.split(" ")
		.map((word) => word[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	const participantCount = Math.max(room?.memberIds.length ?? 0, 1);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#0d0d12] text-sm text-slate-400">
				{copy.loadingRoom}
			</div>
		);
	}

	if (error === "ROOM_NOT_FOUND" || !room) {
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

	return (
		<div className="flex min-h-screen w-full flex-col bg-[#0d0d12]">
			<RoomHeader
				room={room}
				isAdmin={isAdmin}
				participantCount={participantCount}
				onEdit={() => updateRoom.openModal(room.title)}
				onDelete={deleteRoomAction.openModal}
			/>

			<div className="flex flex-1 flex-col lg:flex-row">
				<main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
					<div className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
						<div className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 p-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
								{currentInitials}
							</div>
							<p className="mt-3 truncate text-sm font-medium text-slate-200">
								{currentDisplayName}
							</p>
							<span className="mt-1 text-xs text-blue-400">Tú</span>
						</div>
					</div>

					<p className="mt-8 text-center text-xs text-slate-600">{copy.stagePlaceholder}</p>
				</main>

				<RoomChatPanel
					roomName={room.title}
					messages={chat.messages}
					loadingHistory={chat.loadingHistory}
					currentUserId={user?.uid}
					connected={chat.connected}
					connectionError={chat.connectionError}
					draft={chat.draft}
					messagesEndRef={chat.messagesEndRef}
					onDraftChange={chat.handleDraftChange}
					onSend={chat.sendMessage}
					onKeyDown={chat.handleKeyDown}
				/>
			</div>

			<RoomConfigModal
				open={updateRoom.open}
				name={updateRoom.name}
				saving={updateRoom.saving}
				error={updateRoom.error}
				maxNameLength={updateRoom.maxNameLength}
				onClose={updateRoom.closeModal}
				onNameChange={updateRoom.handleNameChange}
				onSubmit={updateRoom.handleSubmit}
			/>

			<DeleteRoomModal
				open={deleteRoomAction.open}
				deleting={deleteRoomAction.deleting}
				error={deleteRoomAction.error}
				confirmText={deleteRoomAction.confirmText}
				onConfirmTextChange={deleteRoomAction.setConfirmText}
				onConfirm={() => void deleteRoomAction.handleConfirm()}
				onCancel={deleteRoomAction.closeModal}
			/>
		</div>
	);
};

export default Sala;
