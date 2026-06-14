import ChatMessageBubble from "./ChatMessageBubble";
import ChatSkeleton from "./ChatSkeleton";
import { sala as copy } from "../../copy/es";
import type { ChatMessage } from "../../types/room";

interface RoomChatPanelProps {
	roomName: string;
	messages: ChatMessage[];
	loadingHistory: boolean;
	currentUserId: string | undefined;
	connected: boolean;
	connectionError: string | null;
	draft: string;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
	onDraftChange: (value: string) => void;
	onSend: () => void;
	onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const SendIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
		<path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
	</svg>
);

const RoomChatPanel = ({
	roomName,
	messages,
	loadingHistory,
	currentUserId,
	connected,
	connectionError,
	draft,
	messagesEndRef,
	onDraftChange,
	onSend,
	onKeyDown,
}: RoomChatPanelProps) => {
	const canSend = connected && !loadingHistory && draft.trim().length > 0;

	return (
		<aside className="flex min-h-0 w-full flex-col border-l border-slate-200 bg-white lg:w-96">
			<div className="border-b border-slate-200 px-4 py-4">
				<h2 className="text-sm font-semibold text-slate-900">{copy.chatTitle}</h2>
				<p className="mt-0.5 text-xs text-slate-500">
					{copy.chatSubtitle(roomName, messages.length)}
				</p>
			</div>

			<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
				<div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
					{loadingHistory ? (
						<>
							<p className="sr-only">{copy.chatLoadingHistory}</p>
							<ChatSkeleton />
						</>
					) : (
						messages.map((message) => (
							<ChatMessageBubble
								key={message.id}
								message={message}
								isOwn={message.sender_id === currentUserId}
							/>
						))
					)}
					<div ref={messagesEndRef} />
				</div>

				<div className="border-t border-slate-200 px-4 py-3">
					{connectionError ? (
						<p role="alert" className="mb-2 text-xs text-red-600">
							{connectionError}
						</p>
					) : (
						!connected &&
						!loadingHistory && (
							<p role="status" className="mb-2 text-xs text-amber-600">
								{copy.chatDisconnected}
							</p>
						)
					)}
					<div className="flex items-center gap-2">
						<textarea
							value={draft}
							onChange={(event) => onDraftChange(event.target.value)}
							onKeyDown={onKeyDown}
							placeholder={copy.chatPlaceholder}
							disabled={!connected || loadingHistory}
							rows={2}
							className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
						/>
						<button
							type="button"
							onClick={onSend}
							disabled={!canSend}
							aria-label={copy.chatSend}
							className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<SendIcon />
						</button>
					</div>
					<p className="mt-2 text-[10px] text-slate-400">{copy.chatEnterHint}</p>
				</div>
			</div>
		</aside>
	);
};

export default RoomChatPanel;
