import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import CreateRoomModal from "../components/dashboard/CreateRoomModal";
import DashboardEmptyState from "../components/dashboard/DashboardEmptyState";
import JoinRoomSection from "../components/dashboard/JoinRoomSection";
import RoomCard from "../components/dashboard/RoomCard";
import { RoomCardSkeleton } from "../components/dashboard/RoomCardSkeleton";
import AgoraBrandLink from "../components/layout/AgoraBrandLink";
import { common, dashboard as copy } from "../copy/es";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { useJoinRoom } from "../hooks/useJoinRoom";
import { useRooms } from "../hooks/useRooms";
import { useUserProfile } from "../hooks/useUserProfile";
import { auth } from "../lib/firebase";

const Dashboard = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { showToast } = useToast();
	const { user } = useAuth();
	const { avatarUrl, displayName: profileDisplayName } = useUserProfile();
	const photoURL = avatarUrl ?? user?.photoURL;

	const displayName = profileDisplayName ?? user?.displayName ?? user?.email ?? "Usuario";
	const initials = displayName
		.split(" ")
		.map((word) => word[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	const { rooms, loading, error, refetch } = useRooms(Boolean(user));
	const createRoom = useCreateRoom();
	const joinRoom = useJoinRoom({ userId: user?.uid });

	useEffect(() => {
		const state = location.state as { deletedRoomId?: string } | null;
		if (!state?.deletedRoomId) return;

		void refetch();
		navigate(location.pathname, { replace: true, state: null });
	}, [location.pathname, location.state, navigate, refetch]);

	const handleSignOut = async () => {
		showToast("Sesión cerrada. ¡Hasta luego!", "info");
		await signOut(auth);
		navigate("/login", { replace: true });
	};

	const hasRooms = rooms.length > 0;

	const renderRoomsSection = () => {
		if (loading) {
			return (
				<div aria-busy="true" aria-live="polite">
					<p className="sr-only">{copy.loadingRooms}</p>
					<RoomCardSkeleton />
				</div>
			);
		}

		if (error) {
			return (
				<div
					role="alert"
					className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
				>
					No pudimos cargar tus salas. Inténtalo de nuevo.
				</div>
			);
		}

		if (hasRooms) {
			return (
				<div className="grid gap-4 sm:grid-cols-2">
					{rooms.map((room) => (
						<RoomCard key={room.id} room={room} currentUserId={user?.uid} />
					))}
				</div>
			);
		}

		return <DashboardEmptyState onCreateRoom={() => void createRoom.openModal()} />;
	};

	return (
		<div id="dashboard" className="flex min-h-screen w-full flex-col bg-[#f6f7f8]">
			<header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 sm:px-8">
				<AgoraBrandLink className="text-sm font-bold text-blue-600" />
				<div className="flex items-center gap-3">
					<Link to="/perfil" aria-label="Ir a mi perfil" className="transition hover:opacity-80">
						{photoURL ? (
							<img
								src={photoURL}
								alt={displayName}
								width="32"
								height="32"
								className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
							/>
						) : (
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
								{initials}
							</div>
						)}
					</Link>
					<div className="hidden flex-col leading-tight sm:flex">
						<span className="text-xs font-medium text-slate-800">{displayName}</span>
						{user?.email && user.displayName && (
							<span className="text-[11px] text-slate-600">{user.email}</span>
						)}
					</div>
					<button
						id="btn-sign-out"
						type="button"
						onClick={handleSignOut}
						className="text-xs text-slate-600 transition hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
					>
						{common.cerrarSesion}
					</button>
				</div>
			</header>

			<main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-slate-900">{copy.title}</h1>
						<p className="mt-1 text-sm text-slate-600">{copy.subtitle}</p>
					</div>
					<button
						type="button"
						onClick={() => void createRoom.openModal()}
						className="inline-flex items-center justify-center self-start rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
					>
						{copy.createRoom}
					</button>
				</div>

				<div className="mt-6">
					<JoinRoomSection
						roomId={joinRoom.roomId}
						error={joinRoom.error}
						joining={joinRoom.joining}
						onRoomIdChange={joinRoom.handleRoomIdChange}
						onSubmit={joinRoom.handleSubmit}
					/>
				</div>

				<div className="mt-8">{renderRoomsSection()}</div>
			</main>

			<CreateRoomModal
				open={createRoom.isOpen}
				title={createRoom.title}
				creating={createRoom.creating}
				error={createRoom.error}
				maxTitleLength={createRoom.maxTitleLength}
				onClose={createRoom.closeModal}
				onTitleChange={createRoom.handleTitleChange}
				onSubmit={createRoom.handleSubmit}
			/>
		</div>
	);
};

export default Dashboard;
