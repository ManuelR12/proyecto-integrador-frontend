import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sala as copy } from "../../copy/es";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { acquireLocalMedia } from "../../lib/localMediaStream";
import type { Room } from "../../types/room";
import LobbyMediaPreview from "./LobbyMediaPreview";

interface RoomLobbyProps {
	room: Room;
	onEnter: (previewStream: MediaStream | null) => void;
}

const RoomLobby = ({ room, onEnter }: RoomLobbyProps) => {
	const { user } = useAuth();
	const { displayName, avatarUrl } = useUserProfile();
	const currentDisplayName = displayName ?? user?.displayName ?? user?.email ?? "Tú";
	const currentAvatarUrl = avatarUrl ?? user?.photoURL ?? null;

	const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
	const [videoEnabled, setVideoEnabled] = useState(false);
	const [audioEnabled, setAudioEnabled] = useState(false);
	const [hasVideoTrack, setHasVideoTrack] = useState(false);
	const [hasAudioTrack, setHasAudioTrack] = useState(false);
	const [showPermissionPrompt, setShowPermissionPrompt] = useState(true);
	const enteredRef = useRef(false);
	const previewStreamRef = useRef<MediaStream | null>(null);

	const updatePreviewStream = useCallback((mediaStream: MediaStream | null) => {
		previewStreamRef.current = mediaStream;
		setPreviewStream(mediaStream);

		if (!mediaStream) {
			setHasVideoTrack(false);
			setHasAudioTrack(false);
			setVideoEnabled(false);
			setAudioEnabled(false);
			return;
		}

		setHasVideoTrack(mediaStream.getVideoTracks().length > 0);
		setHasAudioTrack(mediaStream.getAudioTracks().length > 0);
		setVideoEnabled(mediaStream.getVideoTracks()[0]?.enabled ?? false);
		setAudioEnabled(mediaStream.getAudioTracks()[0]?.enabled ?? false);
	}, []);

	useEffect(() => {
		let cancelled = false;

		void acquireLocalMedia()
			.then((mediaStream) => {
				if (cancelled) {
					mediaStream.getTracks().forEach((track) => track.stop());
					return;
				}
				updatePreviewStream(mediaStream);
			})
			.catch(() => {
				if (!cancelled) {
					updatePreviewStream(null);
				}
			});

		return () => {
			cancelled = true;
			if (!enteredRef.current) {
				previewStreamRef.current?.getTracks().forEach((track) => track.stop());
			}
		};
	}, [updatePreviewStream]);

	const handleEnter = () => {
		enteredRef.current = true;
		onEnter(previewStreamRef.current);
	};

	return (
		<div className="relative flex min-h-screen flex-col bg-[#0d0d12] lg:flex-row">
			<section className="flex min-h-[55vh] flex-1 items-center justify-center px-6 py-10 lg:min-h-screen lg:px-14 lg:py-12">
				<LobbyMediaPreview
					stream={previewStream}
					displayName={currentDisplayName}
					avatarUrl={currentAvatarUrl}
					videoEnabled={videoEnabled}
					audioEnabled={audioEnabled}
					hasVideoTrack={hasVideoTrack}
					hasAudioTrack={hasAudioTrack}
					onStreamChange={updatePreviewStream}
					onVideoEnabledChange={setVideoEnabled}
					onAudioEnabledChange={setAudioEnabled}
					onHasVideoTrackChange={setHasVideoTrack}
					onHasAudioTrackChange={setHasAudioTrack}
				/>
			</section>

			<section className="flex w-full flex-col justify-center border-t border-slate-800 bg-[#0d0d12] px-6 py-10 lg:max-w-xl lg:border-l lg:border-t-0 lg:px-12 lg:py-12 xl:max-w-2xl">
				<p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
					{copy.lobby.title}
				</p>
				<h1 className="mt-2 text-3xl font-semibold text-white lg:text-4xl">{room.title}</h1>
				<p className="mt-3 text-base text-slate-400 lg:text-lg">
					{copy.lobby.subtitle(room.title)}
				</p>

				<button
					type="button"
					onClick={handleEnter}
					className="mt-10 w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
				>
					{copy.lobby.enterRoom}
				</button>

				<Link
					to="/dashboard"
					className="mt-5 text-center text-sm text-slate-500 transition hover:text-slate-300 lg:text-left"
				>
					{copy.lobby.backToDashboard}
				</Link>
			</section>

			{showPermissionPrompt ? (
				<div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-10">
					<div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" aria-hidden="true" />

					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="lobby-permission-heading"
						className="pointer-events-auto relative w-full max-w-lg rounded-2xl bg-slate-900 px-8 py-10 text-center shadow-2xl ring-1 ring-slate-700 sm:max-w-xl sm:px-10 sm:py-12 lg:max-w-2xl"
					>
						<button
							type="button"
							onClick={() => setShowPermissionPrompt(false)}
							aria-label={copy.lobby.closePermissionPrompt}
							className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-200"
						>
							<svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
								<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
							</svg>
						</button>

						<h2
							id="lobby-permission-heading"
							className="text-2xl font-semibold leading-snug text-white sm:text-3xl lg:text-4xl"
						>
							{copy.lobby.permissionHeading}
						</h2>
						<p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg lg:text-xl">
							{copy.lobby.permissionDescription}
						</p>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default RoomLobby;
