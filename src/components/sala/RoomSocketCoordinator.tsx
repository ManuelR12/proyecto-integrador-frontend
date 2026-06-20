import { useEffect } from "react";
import { useRoomChatSync } from "../../hooks/useRoomChatSync";
import { useRoomSocketBridge } from "../../hooks/useRoomSocketBridge";
import { useChatStore } from "../../stores/useChatStore";
import { useRoomStore } from "../../stores/useRoomStore";

interface RoomSocketCoordinatorProps {
	roomId: string;
}

/**
 * Side-effect-only coordinator: mounts socket/history sync without rendering UI
 * or subscribing to store state, so chat updates never re-render this node.
 */
const RoomSocketCoordinator = ({ roomId }: RoomSocketCoordinatorProps) => {
	useRoomChatSync(roomId);
	useRoomSocketBridge(roomId);

	useEffect(() => {
		return () => {
			useChatStore.getState().reset();
			useRoomStore.getState().reset();
		};
	}, [roomId]);

	return null;
};

export default RoomSocketCoordinator;
