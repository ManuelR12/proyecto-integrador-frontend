import { memo, useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import RoomChatPanel from "./RoomChatPanel";
import { sendRoomChatMessage } from "../../lib/roomSessionSocketRef";
import {
	selectRoomHistoryLoaded,
	selectRoomMessages,
	useChatStore,
} from "../../stores/useChatStore";

interface RoomChatSectionProps {
	roomId: string;
	roomName: string;
	currentUserId: string | undefined;
	onHide?: () => void;
}

const RoomChatSection = ({ roomId, roomName, currentUserId, onHide }: RoomChatSectionProps) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { messages, loadingHistory, connected, connectionError, draft } = useChatStore(
		useShallow((state) => ({
			messages: selectRoomMessages(roomId)(state),
			loadingHistory: !selectRoomHistoryLoaded(roomId)(state),
			connected: state.connected,
			connectionError: state.connectionError,
			draft: state.draft,
		})),
	);

	const setDraft = useChatStore((state) => state.setDraft);
	const clearDraft = useChatStore((state) => state.clearDraft);

	useEffect(() => {
		if (loadingHistory) return;
		requestAnimationFrame(() => {
			// Always use instant scroll - smooth scrolling disabled for accessibility
			// and reduced motion preference
			messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
		});
	}, [loadingHistory, messages]);

	const handleDraftChange = useCallback(
		(value: string) => {
			setDraft(value);
		},
		[setDraft],
	);

	const handleSend = useCallback(() => {
		const text = useChatStore.getState().draft.trim();
		if (!text || !useChatStore.getState().connected) return;
		sendRoomChatMessage(text);
		clearDraft();
	}, [clearDraft]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				handleSend();
			}
		},
		[handleSend],
	);

	return (
		<RoomChatPanel
			roomName={roomName}
			messages={messages}
			loadingHistory={loadingHistory}
			currentUserId={currentUserId}
			connected={connected}
			connectionError={connectionError}
			draft={draft}
			messagesEndRef={messagesEndRef}
			onDraftChange={handleDraftChange}
			onSend={handleSend}
			onKeyDown={handleKeyDown}
			onHide={onHide}
		/>
	);
};

export default memo(RoomChatSection);
