import DeleteRoomModal from "./DeleteRoomModal";
import RoomChatPanel from "./RoomChatPanel";
import RoomConfigModal from "./RoomConfigModal";
import RoomHeader from "./RoomHeader";
import RoomMediaStage from "./RoomMediaStage";
import { useAuth } from "../../contexts/AuthContext";
import { useDeleteRoom } from "../../hooks/useDeleteRoom";
import { useRoomChat } from "../../hooks/useRoomChat";
import { useUpdateRoom } from "../../hooks/useUpdateRoom";
import { useUserProfile } from "../../hooks/useUserProfile";
import type { Room } from "../../types/room";

interface RoomSessionProps {
	room: Room;
	roomId: string;
	isAdmin: boolean;
	onRoomUpdated: (name: string) => void;
}

const RoomSession = ({ room, roomId, isAdmin, onRoomUpdated }: RoomSessionProps) => {
	const { user } = useAuth();
	const { displayName, avatarUrl } = useUserProfile();

	const updateRoom = useUpdateRoom({
		roomId,
		onSuccess: onRoomUpdated,
	});

	const deleteRoomAction = useDeleteRoom({ roomId });
	const chat = useRoomChat(roomId);

	const currentDisplayName = displayName ?? user?.displayName ?? user?.email ?? "Tú";
	const currentInitials = currentDisplayName
		.split(" ")
		.map((word) => word[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	const participantCount = chat.participants.length + 1;

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-[#0d0d12]">
			<RoomHeader
				room={room}
				isAdmin={isAdmin}
				participantCount={participantCount}
				onEdit={() => updateRoom.openModal(room.title)}
				onDelete={deleteRoomAction.openModal}
			/>

			<div className="flex min-h-0 flex-1 flex-col lg:flex-row">
				<main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
					<RoomMediaStage
						currentDisplayName={currentDisplayName}
						currentInitials={currentInitials}
						currentAvatarUrl={avatarUrl}
						currentUserId={user?.uid}
						participants={chat.participants}
					/>
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

export default RoomSession;
