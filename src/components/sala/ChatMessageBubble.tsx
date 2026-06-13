import type { ChatMessage } from "../../types/room";

interface ChatMessageBubbleProps {
	message: ChatMessage;
	isOwn: boolean;
}

function formatTime(timestamp: string | null): string {
	if (!timestamp) return "";
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

const ChatMessageBubble = ({ message, isOwn }: ChatMessageBubbleProps) => {
	const initials = message.username
		.split(/[_\s]+/)
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	if (isOwn) {
		return (
			<div className="flex justify-end">
				<div className="max-w-[85%]">
					<div className="rounded-2xl rounded-br-md bg-blue-600 px-3 py-2 text-sm text-white">
						{message.text}
					</div>
					<p className="mt-1 text-right text-[10px] text-slate-400">
						{formatTime(message.timestamp)}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-start gap-2">
			<div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
				{initials || "?"}
			</div>
			<div className="max-w-[85%]">
				<div className="mb-1 flex items-baseline gap-2">
					<span className="text-xs font-medium text-slate-700">{message.username}</span>
					<span className="text-[10px] text-slate-400">{formatTime(message.timestamp)}</span>
				</div>
				<div className="rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-sm text-slate-800">
					{message.text}
				</div>
			</div>
		</div>
	);
};

export default ChatMessageBubble;
