import DeleteRoomModal from "./DeleteRoomModal";
import RoomChatSection from "./RoomChatSection";
import RoomConfigModal from "./RoomConfigModal";
import RoomHeader from "./RoomHeader";
import RoomSocketCoordinator from "./RoomSocketCoordinator";
import RoomVideoSection from "./RoomVideoSection";
import { useAuth } from "../../contexts/AuthContext";
import { useDeleteRoom } from "../../hooks/useDeleteRoom";
import { useUpdateRoom } from "../../hooks/useUpdateRoom";
import { selectParticipantCount, useRoomStore } from "../../stores/useRoomStore";
import type { Room } from "../../types/room";

interface RoomSessionProps {
	room: Room;
	roomId: string;
	isAdmin: boolean;
	onRoomUpdated: (name: string) => void;
}

const RoomSessionHeader = ({
	room,
	isAdmin,
	onEdit,
	onDelete,
}: {
	room: Room;
	isAdmin: boolean;
	onEdit: () => void;
	onDelete: () => void;
}) => {
	const participantCount = useRoomStore(selectParticipantCount);

	return (
		<RoomHeader
			room={room}
			isAdmin={isAdmin}
			participantCount={participantCount}
			onEdit={onEdit}
			onDelete={onDelete}
		/>
	);
};

const RoomSession = ({ room, roomId, isAdmin, onRoomUpdated }: RoomSessionProps) => {
	const { user } = useAuth();

	const updateRoom = useUpdateRoom({
		roomId,
		onSuccess: onRoomUpdated,
	});

	const deleteRoomAction = useDeleteRoom({ roomId });

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-[#0d0d12]">
			<RoomSocketCoordinator roomId={roomId} />

			<RoomSessionHeader
				room={room}
				isAdmin={isAdmin}
				onEdit={() => updateRoom.openModal(room.title)}
				onDelete={deleteRoomAction.openModal}
			/>

			<div className="flex min-h-0 flex-1 flex-col lg:flex-row">
				<main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-6 py-8">
					<RoomVideoSection roomId={roomId} />
				</main>

				<RoomChatSection roomId={roomId} roomName={room.title} currentUserId={user?.uid} />
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
