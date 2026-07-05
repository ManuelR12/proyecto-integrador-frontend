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
	onHide?: () => void;
}

const UsersIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-blue-500" aria-hidden="true">
		<path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
	</svg>
);

const SendIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
		<path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
	</svg>
);

const CloseIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
		<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
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
	onHide,
}: RoomChatPanelProps) => {
	const canSend = connected && !loadingHistory && draft.trim().length > 0;
	const lastMessage = messages[messages.length - 1];
	const lastMessageText =
		lastMessage && lastMessage.sender_id !== currentUserId ? `Nuevo mensaje recibido` : undefined;

	return (
		<aside className="flex min-h-0 w-full max-h-[50vh] flex-1 flex-col border-l border-slate-200 bg-white lg:max-h-none lg:w-96 lg:flex-none">
			<div className="border-b border-slate-200 px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<UsersIcon />
						<div>
							<h2 className="text-sm font-semibold text-slate-900">{copy.chatTitle}</h2>
							<p className="text-xs text-slate-600">{roomName}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
							{messages.length} msgs
						</span>
						{onHide ? (
							<button
								type="button"
								onClick={onHide}
								aria-label={copy.chatHide}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
							>
								<CloseIcon />
							</button>
						) : null}
					</div>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
				{/* Aria-live region for new message announcements */}
				<div aria-live="polite" aria-atomic="true" className="sr-only">
					{lastMessageText}
				</div>

				<div
					className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
					role="log"
					aria-label="Historial de mensajes del chat"
					aria-live="off"
				>
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
						<label htmlFor="chat-message-input" className="sr-only">
							{copy.chatPlaceholder}
						</label>
						<textarea
							id="chat-message-input"
							value={draft}
							onChange={(event) => onDraftChange(event.target.value)}
							onKeyDown={onKeyDown}
							placeholder={copy.chatPlaceholder}
							disabled={!connected || loadingHistory}
							aria-describedby="chat-input-hint"
							rows={2}
							className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
						/>
						<button
							type="button"
							onClick={onSend}
							disabled={!canSend}
							aria-label={copy.chatSend}
							className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<SendIcon />
						</button>
					</div>
					<p id="chat-input-hint" className="mt-2 text-[10px] text-slate-400">
						{copy.chatEnterHint}
					</p>
				</div>
			</div>
		</aside>
	);
};

export default RoomChatPanel;
