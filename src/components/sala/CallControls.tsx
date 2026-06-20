import { sala as copy } from "../../copy/es";

interface CallControlsProps {
	callActive: boolean;
	micEnabled: boolean;
	cameraEnabled: boolean;
	mediaError: string | null;
	onRetryMedia: () => void;
	onEndCall: () => void;
	onToggleMic: () => void;
	onToggleCamera: () => void;
}

const MicIcon = ({ off }: { off: boolean }) =>
	off ? (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			className="h-5 w-5"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z"
			/>
			<line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" />
		</svg>
	) : (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			className="h-5 w-5"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z"
			/>
		</svg>
	);

const CameraIcon = ({ off }: { off: boolean }) =>
	off ? (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			className="h-5 w-5"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
			/>
			<line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" />
		</svg>
	) : (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			className="h-5 w-5"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
			/>
		</svg>
	);

const PhoneOffIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		className="h-5 w-5"
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z"
		/>
	</svg>
);

interface ControlButtonProps {
	onClick: () => void;
	label: string;
	active?: boolean;
	danger?: boolean;
	warning?: boolean;
	children: React.ReactNode;
}

const ControlButton = ({
	onClick,
	label,
	active = true,
	danger = false,
	warning = false,
	children,
}: ControlButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		title={label}
		className={[
			"flex flex-col items-center gap-1 rounded-xl px-4 py-2.5 text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
			danger
				? "bg-red-600 hover:bg-red-500 focus:ring-red-500"
				: warning
					? "bg-amber-600 hover:bg-amber-500 focus:ring-amber-500"
					: active
						? "bg-slate-700 hover:bg-slate-600 focus:ring-slate-500"
						: "bg-slate-800 text-slate-400 hover:bg-slate-700 focus:ring-slate-500",
		].join(" ")}
	>
		{children}
		<span className="text-[10px] font-medium">{label}</span>
	</button>
);

const CallControls = ({
	callActive,
	micEnabled,
	cameraEnabled,
	mediaError,
	onRetryMedia,
	onEndCall,
	onToggleMic,
	onToggleCamera,
}: CallControlsProps) => {
	if (!callActive) return null;

	if (mediaError) {
		return (
			<div className="flex flex-col items-center gap-2">
				<p role="alert" className="text-xs text-amber-400">
					{copy.call.allowMedia}
				</p>
				<div className="flex items-center gap-3">
					<ControlButton onClick={onRetryMedia} label={copy.call.micBlocked} warning>
						<MicIcon off />
					</ControlButton>

					<ControlButton onClick={onRetryMedia} label={copy.call.cameraBlocked} warning>
						<CameraIcon off />
					</ControlButton>

					<ControlButton onClick={onEndCall} label={copy.call.endCall} danger>
						<PhoneOffIcon />
					</ControlButton>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<ControlButton
				onClick={onToggleMic}
				label={micEnabled ? copy.controls.microfono : copy.call.micOff}
				active={micEnabled}
			>
				<MicIcon off={!micEnabled} />
			</ControlButton>

			<ControlButton
				onClick={onToggleCamera}
				label={cameraEnabled ? copy.controls.camara : copy.call.cameraOff}
				active={cameraEnabled}
			>
				<CameraIcon off={!cameraEnabled} />
			</ControlButton>

			<ControlButton onClick={onEndCall} label={copy.call.endCall} danger>
				<PhoneOffIcon />
			</ControlButton>
		</div>
	);
};

export default CallControls;
