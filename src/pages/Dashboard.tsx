import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { common, product } from "../copy/es";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";

const Dashboard = () => {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const { user } = useAuth();
	const { avatarUrl, profileMissing } = useUserProfile();
	const photoURL = user?.photoURL ?? avatarUrl;


	const handleSignOut = async () => {
		showToast("Sesión cerrada. ¡Hasta luego!", "info");
		await signOut(auth);
		navigate("/login", { replace: true });
	};

	const displayName = user?.displayName ?? user?.email ?? "Usuario";
	const initials = displayName
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div id="dashboard" className="flex min-h-screen w-full flex-col bg-[#f6f7f8]">
			<header className="border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between">
				<span className="text-sm font-bold text-blue-600">{product.name}</span>
				<div className="flex items-center gap-3">
					{photoURL ? (
						<img
							src={photoURL}
							alt={displayName}
							className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
						/>
					) : (
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
							{initials}
						</div>
					)}
					<div className="hidden sm:flex flex-col leading-tight">
						<span className="text-xs font-medium text-slate-800">{displayName}</span>
						{user?.email && user.displayName && (
							<span className="text-[11px] text-slate-400">{user.email}</span>
						)}
					</div>
					<button
						id="btn-sign-out"
						type="button"
						onClick={handleSignOut}
						className="text-xs text-slate-500 transition hover:text-red-600"
					>
						{common.cerrarSesion}
					</button>
				</div>
			</header>

			<main className="flex flex-1 flex-col items-center justify-center px-6">
				<div className="w-full max-w-lg">
					<h1 className="text-2xl font-semibold text-slate-900">
						Hola, {user?.displayName?.split(" ")[0] ?? "bienvenido"} 👋
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Tus salas activas y accesos rápidos aparecerán aquí.
					</p>

					<div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
						<p className="text-sm text-slate-500">Vista en construcción</p>
						<p className="mt-1 font-mono text-xs text-slate-400">/dashboard</p>
					</div>

					<Link
						to="/sala/demo-123"
						className="mt-4 flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
					>
						Entrar a sala de prueba
					</Link>
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
