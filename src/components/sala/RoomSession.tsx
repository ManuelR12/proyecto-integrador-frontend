import { useEffect, useRef, useState, useCallback } from "react";
import ConnectionStatus from "./ConnectionStatus";
import DeleteRoomModal from "./DeleteRoomModal";
import RoomChatSection from "./RoomChatSection";
import RoomHeader from "./RoomHeader";
import RoomSocketCoordinator from "./RoomSocketCoordinator";
import RoomVideoSection from "./RoomVideoSection";
import { useAuth } from "../../contexts/AuthContext";
import { sala as copy } from "../../copy/es";
import { useDeleteRoom } from "../../hooks/useDeleteRoom";
import { selectParticipantCount, useRoomStore } from "../../stores/useRoomStore";
import { useChatStore } from "../../stores/useChatStore";
import type { Room } from "../../types/room";

interface RoomSessionProps {
	room: Room;
	roomId: string;
	isAdmin: boolean;
}

const ChatIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
		<path d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.47 0 4.911.185 7.298.548 1.878.244 3.212 1.854 3.406 3.712.196 1.867-.693 3.642-2.297 4.323-2.828 1.207-5.943 1.807-9.407 1.807-1.08 0-2.14-.072-3.17-.216-.96-.134-1.88.433-2.006 1.394-.126.96.433 1.88 1.394 2.006 1.18.165 2.385.248 3.612.248 3.817 0 7.326-.676 10.06-2.028 2.858-1.422 4.351-4.087 4.031-6.894C22.9 4.087 20.314 1.502 17.507 1.18 14.8.847 11.292.17 7.475.17c-1.226 0-2.431.083-3.611.248-.96.126-1.52 1.046-1.394 2.006.126.96 1.046 1.52 2.006 1.394z" />
		<path d="M1.5 8.67v6.58a3 3 0 003 3h1.372l2.305 2.305a.75.75 0 001.06 0l2.305-2.305H15a3 3 0 003-3V8.67a3 3 0 00-3-3h-10.5a3 3 0 00-3 3z" />
	</svg>
);

const RoomSessionHeader = ({
	room,
	isAdmin,
	onDelete,
}: {
	room: Room;
	isAdmin: boolean;
	onDelete: () => void;
}) => {
	const participantCount = useRoomStore(selectParticipantCount);

	return (
		<RoomHeader
			room={room}
			isAdmin={isAdmin}
			participantCount={participantCount}
			onDelete={onDelete}
		/>
	);
};

const RoomSession = ({ room, roomId, isAdmin }: RoomSessionProps) => {
	const { user } = useAuth();
	const [chatOpen, setChatOpen] = useState(true);
	const activeScreenShareUid = useRoomStore((state) => state.activeScreenShareUid);
	const hadScreenShareRef = useRef(false);
	const chatConnected = useChatStore((state) => state.connected);

	const deleteRoomAction = useDeleteRoom({ roomId });

	useEffect(() => {
		if (activeScreenShareUid && !hadScreenShareRef.current) {
			setChatOpen(false);
		}
		hadScreenShareRef.current = Boolean(activeScreenShareUid);
	}, [activeScreenShareUid]);

	const handleReconnect = useCallback(() => {
		// Reload the page to re-establish all connections
		window.location.reload();
	}, []);

	const isScreenShareActive = Boolean(activeScreenShareUid);

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-[#0d0d12]">
			<ConnectionStatus connected={chatConnected} onReconnect={handleReconnect} />
			<RoomSocketCoordinator roomId={roomId} />

			<RoomSessionHeader room={room} isAdmin={isAdmin} onDelete={deleteRoomAction.openModal} />

			<div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
				<main
					className={[
						"flex min-h-0 flex-1 flex-col overflow-hidden",
						isScreenShareActive ? "px-3 py-3 sm:px-4 sm:py-4" : "px-6 py-8",
					].join(" ")}
				>
					<RoomVideoSection roomId={roomId} />
				</main>

				{chatOpen ? (
					<RoomChatSection
						roomId={roomId}
						roomName={room.title}
						currentUserId={user?.uid}
						onHide={() => setChatOpen(false)}
					/>
				) : (
					<button
						type="button"
						onClick={() => setChatOpen(true)}
						aria-label={copy.chatShow}
						className={[
							"fixed bottom-24 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500",
							"lg:absolute lg:bottom-auto lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:rounded-l-full lg:rounded-r-none lg:px-3 lg:py-4 lg:[writing-mode:vertical-rl]",
						].join(" ")}
					>
						<span className="lg:rotate-180">
							<ChatIcon />
						</span>
						<span className="hidden sm:inline lg:hidden">{copy.chatTitle}</span>
					</button>
				)}
			</div>

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
