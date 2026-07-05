import { sala as copy } from "../../copy/es";

interface ConnectionStatusProps {
	connected: boolean;
	onReconnect?: () => void;
}

const ConnectionStatus = ({ connected, onReconnect }: ConnectionStatusProps) => {
	if (connected) return null;

	return (
		<div
			className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg"
			role="alert"
			aria-live="assertive"
		>
			<div className="flex items-center gap-2">
				<svg
					className="h-5 w-5 text-amber-600"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
						clipRule="evenodd"
					/>
				</svg>
				<span className="text-sm font-medium text-amber-900">
					{copy.chatDisconnected || "Sin conexión. Reconectando..."}
				</span>
			</div>
			{onReconnect && (
				<button
					type="button"
					onClick={onReconnect}
					className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
				>
					Reconectar manualmente
				</button>
			)}
		</div>
	);
};

export default ConnectionStatus;
